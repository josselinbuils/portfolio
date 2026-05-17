import { type Frame } from '../models/Frame';

// HU above which a voxel is body (soft tissue, fat, bone). Foam, air and lung
// sit well below, so the patient is one solid region.
const BODY_HU_THRESHOLD = -350;
// 3-D opening radius. Erosion by this many voxels severs the thin seam where
// the patient touches the table (in 3-D that contact is thin even where 2-D
// slices look fused); dilation by the same amount restores the patient so the
// skeleton — well interior to the soft-tissue envelope — is never clipped.
const OPENING_RADIUS = 3;

/**
 * Detects the patient's body across the whole volume so the WebGPU volume
 * renderer can drop the CT examination table and its rails in the 3D bones
 * view.
 *
 * The patient lies directly on a tilted table, so per-slice methods fail:
 * persistence/global cutoffs cannot track the tilt, and in the slices where
 * the back is flush against the table the two fuse into one 2-D blob. The fix
 * is to work in 3-D. There the patient↔table contact is only a thin seam, so a
 * 3-D morphological opening (erode, keep the largest connected component, then
 * dilate back) cleanly separates the bulky patient from the thin, flat table
 * and its rails — regardless of the tilt.
 *
 * The resulting per-frame body mask is stored on each frame; the renderer
 * keeps only voxels inside it.
 */
export function computeTableMask(frames: Frame[]): void {
  const sample = frames.find((f) => f.pixelData !== undefined);
  if (!sample) {
    return;
  }

  const W = sample.columns;
  const H = sample.rows;
  const D = frames.length;
  const S = W * H;
  const N = S * D;

  const vol = new Uint8Array(N);
  const queue = new Int32Array(N);
  const line = new Uint8Array(Math.max(W, H, D));

  for (let z = 0; z < D; z++) {
    const frame = frames[z];
    const base = z * S;
    if (!frame.pixelData) {
      vol.fill(1, base, base + S);
      continue;
    }
    const { pixelData, rescaleIntercept, rescaleSlope } = frame;
    for (let i = 0; i < S; i++) {
      const hu = (pixelData as Int16Array)[i] * rescaleSlope + rescaleIntercept;
      vol[base + i] = hu > BODY_HU_THRESHOLD ? 1 : 0;
    }
  }

  morph(vol, line, W, H, D, OPENING_RADIUS, false); // 3-D erosion

  // Largest connected component (6-connectivity) = the patient. Pass 1 labels
  // every component to 2 while measuring sizes; we remember the largest seed.
  let bestSeed = -1;
  let bestSize = 0;
  for (let p = 0; p < N; p++) {
    if (vol[p] !== 1) {
      continue;
    }
    let head = 0;
    let tail = 0;
    queue[tail++] = p;
    vol[p] = 2;
    let size = 0;
    while (head < tail) {
      const q = queue[head++];
      size++;
      const z = (q / S) | 0;
      const r = q - z * S;
      const y = (r / W) | 0;
      const x = r - y * W;
      if (x > 0 && vol[q - 1] === 1) {
        vol[q - 1] = 2;
        queue[tail++] = q - 1;
      }
      if (x < W - 1 && vol[q + 1] === 1) {
        vol[q + 1] = 2;
        queue[tail++] = q + 1;
      }
      if (y > 0 && vol[q - W] === 1) {
        vol[q - W] = 2;
        queue[tail++] = q - W;
      }
      if (y < H - 1 && vol[q + W] === 1) {
        vol[q + W] = 2;
        queue[tail++] = q + W;
      }
      if (z > 0 && vol[q - S] === 1) {
        vol[q - S] = 2;
        queue[tail++] = q - S;
      }
      if (z < D - 1 && vol[q + S] === 1) {
        vol[q + S] = 2;
        queue[tail++] = q + S;
      }
    }
    if (size > bestSize) {
      bestSize = size;
      bestSeed = p;
    }
  }

  if (bestSeed === -1) {
    // No body found — keep everything rather than blank the volume.
    for (let z = 0; z < D; z++) {
      frames[z].bodyMask = new Uint8Array(S).fill(1);
    }
    return;
  }

  // Restore the eroded mask (2 -> 1), then flood only the patient -> 3.
  for (let p = 0; p < N; p++) {
    if (vol[p] === 2) {
      vol[p] = 1;
    }
  }

  let head = 0;
  let tail = 0;
  queue[tail++] = bestSeed;
  vol[bestSeed] = 3;
  while (head < tail) {
    const q = queue[head++];
    const z = (q / S) | 0;
    const r = q - z * S;
    const y = (r / W) | 0;
    const x = r - y * W;
    if (x > 0 && vol[q - 1] === 1) {
      vol[q - 1] = 3;
      queue[tail++] = q - 1;
    }
    if (x < W - 1 && vol[q + 1] === 1) {
      vol[q + 1] = 3;
      queue[tail++] = q + 1;
    }
    if (y > 0 && vol[q - W] === 1) {
      vol[q - W] = 3;
      queue[tail++] = q - W;
    }
    if (y < H - 1 && vol[q + W] === 1) {
      vol[q + W] = 3;
      queue[tail++] = q + W;
    }
    if (z > 0 && vol[q - S] === 1) {
      vol[q - S] = 3;
      queue[tail++] = q - S;
    }
    if (z < D - 1 && vol[q + S] === 1) {
      vol[q + S] = 3;
      queue[tail++] = q + S;
    }
  }

  // Keep = the patient component only.
  for (let p = 0; p < N; p++) {
    vol[p] = vol[p] === 3 ? 1 : 0;
  }

  morph(vol, line, W, H, D, OPENING_RADIUS, true); // 3-D dilation

  for (let z = 0; z < D; z++) {
    frames[z].bodyMask = vol.subarray(z * S, z * S + S);
  }
}

/**
 * Separable 3-D binary morphology (erosion when dilate=false, dilation when
 * true) by a (2r+1)³ box, applied in place one axis at a time. Each line is
 * snapshotted before being rewritten, so passes do not contaminate.
 *
 * Erosion: a voxel survives only if its whole window is set and the window is
 * fully in frame (out-of-frame counts as background, so borders erode inward).
 * Dilation: a voxel is set if any in-window voxel is set.
 */
function morph(
  vol: Uint8Array,
  line: Uint8Array,
  W: number,
  H: number,
  D: number,
  r: number,
  dilate: boolean,
): void {
  const S = W * H;
  const full = 2 * r + 1;

  const pass = (len: number, stride: number, start: number) => {
    for (let i = 0; i < len; i++) {
      line[i] = vol[start + i * stride];
    }
    let sum = 0;
    for (let k = 0; k <= r && k < len; k++) {
      sum += line[k];
    }
    for (let i = 0; i < len; i++) {
      let on: boolean;
      if (dilate) {
        on = sum > 0;
      } else {
        on = i - r >= 0 && i + r < len && sum === full;
      }
      vol[start + i * stride] = on ? 1 : 0;
      const removeIdx = i - r;
      if (removeIdx >= 0) {
        sum -= line[removeIdx];
      }
      const addIdx = i + 1 + r;
      if (addIdx < len) {
        sum += line[addIdx];
      }
    }
  };

  // X-axis: lines along columns (stride 1).
  for (let z = 0; z < D; z++) {
    for (let y = 0; y < H; y++) {
      pass(W, 1, z * S + y * W);
    }
  }
  // Y-axis: lines along rows (stride W).
  for (let z = 0; z < D; z++) {
    for (let x = 0; x < W; x++) {
      pass(H, W, z * S + x);
    }
  }
  // Z-axis: lines along frames (stride S).
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      pass(D, S, y * W + x);
    }
  }
}
