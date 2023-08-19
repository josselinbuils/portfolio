import { NormalizedImageFormat } from '@/apps/DICOMViewer/constants';
import { type Frame } from '@/apps/DICOMViewer/models/Frame';
import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { type Renderer } from '../Renderer';
import { getRenderingProperties, validateCamera2D } from '../renderingUtils';
import fragmentShaderSource from './grayscale.frag?raw';
import vertexShaderSource from './vertexShader.vert?raw';

export class WebGLRenderer implements Renderer {
  private readonly gl: WebGLRenderingContext;
  private program?: WebGLProgram;
  private texture?: { id: string; instance: WebGLTexture };
  private glViewportWidth?: number;
  private glViewportHeight?: number;

  constructor(canvas: HTMLCanvasElement) {
    if (canvas.getContext('webgl') instanceof WebGLRenderingContext) {
      this.gl = canvas.getContext('webgl') as WebGLRenderingContext;
    } else if (
      canvas.getContext('experimental-webgl') instanceof WebGLRenderingContext
    ) {
      this.gl = canvas.getContext(
        'experimental-webgl',
      ) as WebGLRenderingContext;
    } else {
      throw new Error('Cannot retrieve WebGL context');
    }
  }

  destroy(): void {
    const { gl } = this;

    if (this.texture !== undefined) {
      gl.deleteTexture(this.texture.instance);
    }
    if (this.program !== undefined) {
      gl.deleteProgram(this.program);
    }

    delete this.program;
    delete this.texture;
  }

  render(viewport: Viewport): void {
    const { gl } = this;
    const { dataset, camera, height, width, windowCenter, windowWidth } =
      viewport;
    const frame = dataset.findClosestFrame(camera.lookPoint);
    const { id, imageFormat, rescaleIntercept, rescaleSlope } = frame;

    if (imageFormat !== NormalizedImageFormat.Int16) {
      throw new Error(`Unsupported image format: ${imageFormat}`);
    }

    validateCamera2D(frame, camera);

    if (this.program === undefined) {
      this.program = this.createProgram();
    }

    if (this.glViewportWidth !== width || this.glViewportHeight !== height) {
      this.gl.viewport(0, 0, width, height);
      this.glViewportWidth = width;
      this.glViewportHeight = height;
    }

    if (this.texture === undefined || this.texture.id !== id) {
      if (this.texture !== undefined) {
        gl.deleteTexture(this.texture.instance);
      }
      const instance = this.createTexture(frame);
      this.texture = { id, instance };
    }

    // Look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');

    // Provide texture coordinates for the rectangle.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Look up uniform locations
    const rescaleInterceptLocation = gl.getUniformLocation(
      this.program,
      'rescaleIntercept',
    );
    const rescaleSlopeLocation = gl.getUniformLocation(
      this.program,
      'rescaleSlope',
    );
    const windowCenterLocation = gl.getUniformLocation(
      this.program,
      'windowCenter',
    );
    const windowWidthLocation = gl.getUniformLocation(
      this.program,
      'windowWidth',
    );

    gl.uniform1f(rescaleInterceptLocation, rescaleIntercept);
    gl.uniform1f(rescaleSlopeLocation, rescaleSlope);
    gl.uniform1f(windowWidthLocation, windowWidth);
    gl.uniform1f(windowCenterLocation, windowCenter);

    const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');

    const renderingProperties = getRenderingProperties(viewport);

    if (renderingProperties === undefined) {
      return;
    }

    const { viewportSpace } = renderingProperties;
    const { imageHeight, imageWidth, imageX0, imageY0 } = viewportSpace;

    // Convert dst pixel coordinates to clip space coordinates
    const clipX = (imageX0 / width) * 2 - 1;
    const clipY = (imageY0 / height) * -2 + 1;
    const clipWidth = (imageWidth / width) * 2;
    const clipHeight = (imageHeight / height) * -2;

    // Build a matrix that will stretch our unit quad to our desired size and location
    gl.uniformMatrix3fv(matrixLocation, false, [
      clipWidth,
      0,
      0,
      0,
      clipHeight,
      0,
      clipX,
      clipY,
      1,
    ]);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private createProgram(): WebGLProgram {
    const { gl } = this;
    const program = gl.createProgram();

    if (program === null) {
      throw new Error('Unable to create program');
    }

    this.program = program;

    const { fragmentShader, vertexShader } = this.createShaders();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
  }

  private createShaders(): {
    fragmentShader: WebGLShader;
    vertexShader: WebGLShader;
  } {
    const { gl } = this;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);

    if (vertexShader === null) {
      throw new Error('Unable to create vertex shader');
    }

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (fragmentShader === null) {
      throw new Error('Unable to create fragment shader');
    }

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    return { fragmentShader, vertexShader };
  }

  private createTexture(frame: Frame): WebGLTexture {
    if (frame.pixelData === undefined) {
      throw new Error('Frame does not contain pixel data');
    }

    const { gl } = this;
    const texture = gl.createTexture();

    if (texture === null) {
      throw new Error('Unable to create texture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters, so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const { columns, rows } = frame;
    const format = gl.LUMINANCE_ALPHA;
    const pixelData = new Uint8Array(
      frame.pixelData.buffer,
      frame.pixelData.byteOffset,
    );

    // Upload the image into the texture.
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      format,
      columns,
      rows,
      0,
      format,
      gl.UNSIGNED_BYTE,
      pixelData,
    );

    return texture;
  }
}
