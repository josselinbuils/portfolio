@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> properties: RenderingProperties;
@group(0) @binding(3) var<storage, read> lut: array<f32>;

struct RenderingProperties {
  clipHeight: f32,
  clipWidth: f32,
  clipX: f32,
  clipY: f32,
  rescaleIntercept: f32,
  rescaleSlope: f32,
  windowCenter: f32,
  windowWidth: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) textCoord: vec2<f32>,
}

@vertex
fn vertex(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  let pos = array<vec2<f32>, 6>(
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1),
  );
  let textCoord = pos[vertexIndex];
  let mmat = mat3x3(properties.clipWidth, 0, 0, 0, properties.clipHeight, 0, properties.clipX, properties.clipY, 1);

  return VertexOutput(
    vec4<f32>(mmat * vec3<f32>(textCoord, 1), 1),
    textCoord
  );
}

@fragment
fn grayscaleFragment(input: VertexOutput) -> @location(0) vec4f {
  let texSample = textureSample(texture, textureSampler, input.textCoord);
  let rawValue = ((texSample[1] - step(0.5, texSample[1])) * 255 + texSample[0] - step(0.5, texSample[1])) * 255 * properties.rescaleSlope + properties.rescaleIntercept;
  let leftLimit = properties.windowCenter - properties.windowWidth / 2;
  let lutIndex = u32(floor(clamp(rawValue - leftLimit, 0, properties.windowWidth - 1)) * 3);
  return vec4(lut[lutIndex] / 255, lut[lutIndex + 1] / 255, lut[lutIndex + 2] / 255, 1);
}

@fragment
fn rgbFragment(input: VertexOutput) -> @location(0) vec4f {
  return textureSample(texture, textureSampler, input.textCoord);
}
