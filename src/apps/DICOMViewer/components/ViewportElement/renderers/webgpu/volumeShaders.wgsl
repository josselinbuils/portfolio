@group(0) @binding(0) var texture: texture_3d<i32>;
@group(0) @binding(1) var<storage, read> lut: array<f32>;
@group(0) @binding(2) var<storage, read> frames: array<Frame>;
@group(0) @binding(3) var<uniform> properties: RenderingProperties;
@group(0) @binding(4) var<uniform> volume: Volume;

struct Frame {
  columns: f32,
  imageOrientationX: vec3<f32>,
  imageOrientationY: vec3<f32>,
  imagePosition: vec3<f32>,
  rescaleIntercept: f32,
  rescaleSlope: f32,
  rows: f32,
}

struct Volume {
  dimensionsVoxels: vec3<f32>,
  firstVoxelCenter: vec3<f32>,
  orientationX: vec3<f32>,
  orientationY: vec3<f32>,
  orientationZ: vec3<f32>,
  voxelSpacing: vec3<f32>,
}

struct RenderingProperties {
  clipHeight: f32,
  clipWidth: f32,
  clipX: f32,
  clipY: f32,
  imageHeight: f32,
  imageWidth: f32,
  imageWorldOrigin: vec3<f32>,
  imageX0: f32,
  imageX1: f32,
  imageY0: f32,
  imageY1: f32,
  leftLimit: f32,
  rightLimit: f32,
  viewportSpaceImageX0: f32,
  viewportSpaceImageY0: f32,
  xAxis: vec3<f32>,
  yAxis: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) rawPosition: vec2<f32>,
}

@vertex
fn vertex(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let pos = array<vec2<f32>, 6>(
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1),
  );
  let rawPosition = pos[vertexIndex];
  let imageAreaMat = mat3x3(properties.clipWidth, 0, 0, 0, properties.clipHeight, 0, properties.clipX, properties.clipY, 1);

  return VertexOutput(
    vec4<f32>(imageAreaMat * vec3<f32>(rawPosition, 1), 1),
    rawPosition
  );
}

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let rawValue = getClipPixelValue(input.rawPosition);
  let lutIndex = u32(floor(clamp(rawValue - properties.leftLimit, 0, properties.rightLimit - properties.leftLimit - 1)) * 3);

  return vec4(lut[lutIndex] / 255, lut[lutIndex + 1] / 255, lut[lutIndex + 2] / 255, 1);
}

// See https://helloacm.com/cc-function-to-compute-the-bilinear-interpolation/
fn bilinearInterpolate(c00: f32, c01: f32, c10: f32, c11: f32, x0: f32, x1: f32, y0: f32, y1: f32, x: f32, y: f32) -> f32 {
  return 1 / ((x1 - x0) *  (y1 - y0)) * (c00 * (x1 - x) * (y1 - y) + c10 * (x - x0) * (y1 - y) + c01 * (x1 - x) * (y - y0) + c11 * (x - x0) * (y - y0));
}

// -1 < x < 1
// -1 < y < 1
fn getClipPixelValue(clipPosition: vec2<f32>) -> f32 {
  let x = clipPosition[0] * properties.imageWidth;
  let y = clipPosition[1] * properties.imageHeight;

  let pointLPS = getPointLPS(
    properties.imageWorldOrigin,
    properties.xAxis,
    properties.yAxis,
    x - min(properties.viewportSpaceImageX0, 0), // WTF min is needed?
    y - min(properties.viewportSpaceImageY0, 0),
  );

  return getRawValue(pointLPS);
}

fn getPixelValue(x: f32, y: f32, z:f32) -> f32 {
  return f32(textureLoad(texture, vec3(u32(x), u32(y), u32(z)), 0)[0]);
}

fn getPointLPS(
  imageWorldOrigin: vec3<f32>,
  xAxis: vec3<f32>,
  yAxis: vec3<f32>,
  x: f32,
  y: f32,
) -> vec3<f32> {
  return imageWorldOrigin + xAxis * x + yAxis * y;
}

fn getRawValue(pointLPS: vec3<f32>) -> f32 {
  let frameIndexVector = (pointLPS - volume.firstVoxelCenter) / volume.voxelSpacing * volume.orientationZ;
  let frameIndex = round(frameIndexVector[0] + frameIndexVector[1] + frameIndexVector[2]);

  let frame = frames[u32(frameIndex)];
  let imagePositionToPoint = (pointLPS - frame.imagePosition) / volume.voxelSpacing;

  let xVector = imagePositionToPoint * frame.imageOrientationX;
  let x = xVector[0] + xVector[1] + xVector[2];

  let yVector = imagePositionToPoint * frame.imageOrientationY;
  let y = yVector[0] + yVector[1] + yVector[2];

  let x0 = floor(x);
  let y0 = floor(y);

  let x1 = ceil(x);
  let y1 = ceil(y);

  if (
    x0 >= 0 && x0 < frame.columns &&
    x1 >= 0 && x1 < frame.columns &&
    y0 >= 0 && y0 < frame.rows &&
    y1 >= 0 && y1 < frame.rows
  ) {
    if (x1 == x0 || y1 == y0) {
      let c0 = getPixelValue(x0, y0, frameIndex);
      let c1 = getPixelValue(x1, y1, frameIndex);

      return linearInterpolate(c0, c1, x % 1 + y % 1) * frame.rescaleSlope + frame.rescaleIntercept;
    }

    let c00 = getPixelValue(x0, y0, frameIndex);
    let c10 = getPixelValue(x1, y0, frameIndex);
    let c01 = getPixelValue(x0, y1, frameIndex);
    let c11 = getPixelValue(x1, y1, frameIndex);

    return bilinearInterpolate(c00, c01, c10, c11, x0, x1, y0, y1, x, y) * frame.rescaleSlope + frame.rescaleIntercept;
  }
  return -2e31; // max f32 value
}

fn linearInterpolate(c0: f32, c1: f32, dist: f32) -> f32 {
  return c0 + (c1 - c0) * dist;
}
