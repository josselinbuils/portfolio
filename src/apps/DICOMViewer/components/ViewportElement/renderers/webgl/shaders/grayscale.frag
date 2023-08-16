precision mediump float;

uniform float rescaleSlope;
uniform float rescaleIntercept;
uniform float windowWidth;
uniform float windowCenter;

uniform sampler2D u_image;
varying vec2 v_texCoord;

void main() {
  vec4 texture = texture2D(u_image, v_texCoord);

  // Compute pixel raw value
  float intensity =
    ((texture.a - step(0.5, texture.a)) * 255.0 +
      texture.r -
      step(0.5, texture.a)) *
    255.0;

  // Apply rescale slope and intercept
  intensity = intensity * rescaleSlope + rescaleIntercept;

  // Apply windowing
  intensity = (intensity - (windowCenter - 0.5)) / (windowWidth - 1.0) + 0.5;

  // Clamp intensity
  intensity = clamp(intensity, 0.0, 1.0);

  gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
}
