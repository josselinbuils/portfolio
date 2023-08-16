import { type Frame } from '@/apps/DICOMViewer/models/Frame';
import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { type Renderer } from '../Renderer';
import { getRenderingProperties, validateCamera2D } from '../renderingUtils';
import shader from './shaders.wgsl?raw';

export class WebGPUFrameRenderer implements Renderer {
  private context?: GPUCanvasContext;
  private device?: GPUDevice;
  private pipeline?: GPURenderPipeline;
  private texture?: { id: string; instance: GPUTexture };

  constructor(private canvas: HTMLCanvasElement) {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported on this browser.');
    }
  }

  destroy(): void {
    this.device?.destroy();
    this.texture?.instance.destroy();
    delete this.context;
    delete this.device;
    delete this.pipeline;
    delete this.texture;
  }

  async render(viewport: Viewport): Promise<void> {
    const { dataset, camera, height, width, windowCenter, windowWidth } =
      viewport;
    const frame = dataset.findClosestFrame(camera.lookPoint);
    const { id, rescaleIntercept, rescaleSlope } = frame;

    validateCamera2D(frame, camera);

    if (this.device === undefined) {
      const adapter = await navigator.gpu.requestAdapter();

      if (!adapter) {
        throw new Error('No appropriate GPUAdapter found.');
      }

      this.device = await adapter.requestDevice();
    }

    if (this.context === undefined) {
      const context = this.canvas.getContext('webgpu');

      if (context === null) {
        throw new Error('Unable to get WebGPU context.');
      }

      context.configure({
        device: this.device,
        format: navigator.gpu.getPreferredCanvasFormat(),
      });

      this.context = context;
    }

    if (this.pipeline === undefined) {
      const shaderModule = this.device.createShaderModule({
        label: 'Shader',
        code: shader,
      });

      this.pipeline = this.device.createRenderPipeline({
        label: 'Render pipeline',
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vertex',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'grayscaleFragment',
          targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
        },
      });
    }

    if (this.texture === undefined || this.texture.id !== id) {
      this.texture?.instance.destroy();
      this.texture = {
        id,
        instance: this.createTexture(frame),
      };
    }

    const renderingProperties = getRenderingProperties(viewport);

    if (renderingProperties === undefined) {
      return;
    }

    const { viewportSpace } = renderingProperties;
    const { imageHeight, imageWidth, imageX0, imageY0 } = viewportSpace;
    const sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    // Convert dst pixel coordinates to clip space coordinates
    const clipX = (imageX0 / width) * 2 - 1;
    const clipY = (imageY0 / height) * -2 + 1;
    const clipWidth = (imageWidth / width) * 2;
    const clipHeight = (imageHeight / height) * -2;

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        sampler,
        this.texture.instance.createView(),
        this.createBufferResource(new Float32Array([rescaleSlope])),
        this.createBufferResource(new Float32Array([rescaleIntercept])),
        this.createBufferResource(new Float32Array([windowWidth])),
        this.createBufferResource(new Float32Array([windowCenter])),
        this.createBufferResource(new Float32Array([clipX])),
        this.createBufferResource(new Float32Array([clipY])),
        this.createBufferResource(new Float32Array([clipWidth])),
        this.createBufferResource(new Float32Array([clipHeight])),
      ].map((resource, binding) => ({ binding, resource })),
    });

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          loadOp: 'clear',
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private createBufferResource(source: BufferSource): GPUBufferBinding {
    if (this.device === undefined) {
      throw new Error('No device');
    }

    const buffer = this.device.createBuffer({
      size: source.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(buffer, 0, source);

    return { buffer };
  }

  private createTexture(frame: Frame): GPUTexture {
    if (this.device === undefined) {
      throw new Error('No device');
    }
    if (frame.pixelData === undefined) {
      throw new Error('Frame does not contain pixel data');
    }

    const { columns, pixelData, rows } = frame;

    const texture = this.device.createTexture({
      dimension: '2d',
      size: [columns, rows],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const int32PixelData = new Int32Array(pixelData);

    this.device.queue.writeTexture(
      { texture },
      new Uint8Array(int32PixelData.buffer, int32PixelData.byteOffset),
      { bytesPerRow: columns * Int32Array.BYTES_PER_ELEMENT },
      { width: columns, height: rows },
    );

    return texture;
  }
}
