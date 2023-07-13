import { NormalizedImageFormat } from '@/apps/DICOMViewer/constants';
import GRAYSCALE_FRAGMENT_SHADER_SRC from './shaders/grayscale.frag?raw';
import RGB_FRAGMENT_SHADER_SRC from './shaders/rgb.frag?raw';

export function getTextureFormat(
  gl: WebGLRenderingContext,
  imageFormat: NormalizedImageFormat,
): GLenum {
  switch (imageFormat) {
    case NormalizedImageFormat.Int16:
      return gl.LUMINANCE_ALPHA;

    case NormalizedImageFormat.RGB:
      return gl.RGB;

    default:
      throw new Error(`Unknown image format: ${imageFormat}`);
  }
}

export function getFragmentShaderSrc(
  imageFormat: NormalizedImageFormat,
): string {
  switch (imageFormat) {
    case NormalizedImageFormat.Int16:
      return GRAYSCALE_FRAGMENT_SHADER_SRC;

    case NormalizedImageFormat.RGB:
      return RGB_FRAGMENT_SHADER_SRC;

    default:
      throw new Error(`Unknown image format: ${imageFormat}`);
  }
}
