@group(0) @binding(0) var texture: texture_2d<i32>;
@group(0) @binding(1) var<storage, read> lut: array<f32>;
@group(0) @binding(2) var<uniform> properties: RenderingProperties;

struct RenderingProperties {
  clipHeight: f32,
  clipWidth: f32,
  clipX: f32,
  clipY: f32,
  columns: f32,
  rescaleIntercept: f32,
  rescaleSlope: f32,
  rows: f32,
  windowCenter: f32,
  windowWidth: f32,
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
  let rawValue = getClipPixelValue(input.rawPosition) * properties.rescaleSlope + properties.rescaleIntercept;
  let leftLimit = properties.windowCenter - properties.windowWidth / 2;
  let lutIndex = u32(floor(clamp(rawValue - leftLimit, 0, properties.windowWidth - 1)) * 3);

  return vec4(lut[lutIndex] / 255, lut[lutIndex + 1] / 255, lut[lutIndex + 2] / 255, 1);
}

// See https://helloacm.com/cc-function-to-compute-the-bilinear-interpolation/
fn bilinearInterpolate(c00: f32, c01: f32, c10: f32, c11: f32, x0: f32, x1: f32, y0: f32, y1: f32, x: f32, y: f32) -> f32 {
  return 1 / ((x1 - x0) *  (y1 - y0)) * (c00 * (x1 - x) * (y1 - y) + c10 * (x - x0) * (y1 - y) + c01 * (x1 - x) * (y - y0) + c11 * (x - x0) * (y - y0));
}

// -1 < x < 1
// -1 < y < 1
fn getClipPixelValue(clipPosition: vec2<f32>) -> f32 {
  let x = clipPosition.x * properties.columns;
  let y = clipPosition.y * properties.rows;

  let x0 = floor(x);
  let y0 = floor(y);

  let x1 = ceil(x);
  let y1 = ceil(y);

  if (x1 == x0 || y1 == y0) {
    let c0 = getPixelValue(x0, y0);
    let c1 = getPixelValue(x1, y1);

    return linearInterpolate(c0, c1, x % 1 + y % 1);
  }

  let c00 = getPixelValue(x0, y0);
  let c10 = getPixelValue(x1, y0);
  let c01 = getPixelValue(x0, y1);
  let c11 = getPixelValue(x1, y1);

  return bilinearInterpolate(c00, c01, c10, c11, x0, x1, y0, y1, x, y);
}

fn getPixelValue(x: f32, y: f32) -> f32 {
  return f32(textureLoad(texture, vec2(u32(x), u32(y)), 0)[0]);
}

fn linearInterpolate(c0: f32, c1: f32, dist: f32) -> f32 {
  return c0 + (c1 - c0) * dist;
}