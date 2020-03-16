export const RGB_FRAGMENT_SHADER_SRC = `
  precision mediump float;

  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  void main() {
    vec4 texture = texture2D(u_image, v_texCoord);
    gl_FragColor = vec4(texture.r, texture.g, texture.b, 1.0);
  }
`;
