@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> rescaleSlope: f32;
@group(0) @binding(3) var<uniform> rescaleIntercept: f32;
@group(0) @binding(4) var<uniform> windowWidth: f32;
@group(0) @binding(5) var<uniform> windowCenter: f32;
@group(0) @binding(6) var<uniform> clipX: f32;
@group(0) @binding(7) var<uniform> clipY: f32;
@group(0) @binding(8) var<uniform> clipWidth: f32;
@group(0) @binding(9) var<uniform> clipHeight: f32;

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
  let mmat = mat3x3(clipWidth, 0, 0, 0, clipHeight, 0, clipX, clipY, 1);

  return VertexOutput(
    vec4<f32>(mmat * vec3<f32>(textCoord, 1), 1),
    textCoord
  );
}

@fragment
fn grayscaleFragment(input: VertexOutput) -> @location(0) vec4f {
  let s = textureSample(texture, textureSampler, input.textCoord);

  // Compute pixel raw value
  var intensity = ((s[1] - step(0.5, s[1])) * 255 + s[0] - step(0.5, s[1])) * 255;

  // Apply rescale slope and intercept
  intensity = intensity * rescaleSlope + rescaleIntercept;

  // Apply windowing
  intensity = (intensity - (windowCenter - 0.5)) / (windowWidth - 1) + 0.5;

  // Clamp intensity
  intensity = clamp(intensity, 0, 1);

  return vec4(intensity, intensity, intensity, 1);
}
