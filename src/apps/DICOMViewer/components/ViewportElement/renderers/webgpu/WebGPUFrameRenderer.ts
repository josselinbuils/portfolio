import { NormalizedImageFormat } from '@/apps/DICOMViewer/constants';
import { type VOILUT } from '@/apps/DICOMViewer/interfaces/VOILUT';
import { type Frame } from '@/apps/DICOMViewer/models/Frame';
import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { loadVOILUT } from '@/apps/DICOMViewer/utils/loadVOILUT';
import { type Renderer } from '../Renderer';
import { getDefaultVOILUT } from '../js/utils/getDefaultVOILUT';
import { getRenderingProperties, validateCamera2D } from '../renderingUtils';
import shaders from './frameShaders.wgsl?raw';

export class WebGPUFrameRenderer implements Renderer {
  private context?: GPUCanvasContext;
  private device?: GPUDevice;
  private lut?: VOILUT;
  private pipeline?: GPURenderPipeline;
  private texture?: { id: string; instance: GPUTexture };
  private unsubscribeToViewportUpdates?: () => void;

  constructor(private canvas: HTMLCanvasElement) {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported on this browser.');
    }
  }

  destroy(): void {
    this.device?.destroy();
    this.texture?.instance.destroy();
    this.unsubscribeToViewportUpdates?.();
    delete this.context;
    delete this.device;
    delete this.pipeline;
    delete this.texture;
  }

  async init(viewport: Viewport): Promise<void> {
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      throw new Error('No appropriate GPUAdapter found.');
    }

    this.device = await adapter.requestDevice();

    const context = this.canvas.getContext('webgpu');

    if (context === null) {
      throw new Error('Unable to get WebGPU context.');
    }

    context.configure({
      device: this.device,
      format: 'bgra8unorm',
    });

    this.context = context;

    const shaderModule = this.device.createShaderModule({
      label: 'Shaders',
      code: shaders,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: (
        [
          { texture: { sampleType: 'sint' } },
          { buffer: { type: 'read-only-storage' } },
          { buffer: { type: 'uniform' } },
        ] satisfies Omit<GPUBindGroupLayoutEntry, 'binding' | 'visibility'>[]
      ).map((props, binding) => ({
        ...props,
        binding,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
      })),
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'Render pipeline',
      fragment: {
        module: shaderModule,
        entryPoint: 'fragment',
        targets: [{ format: 'bgra8unorm' }],
      },
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vertex',
      },
    });

    this.unsubscribeToViewportUpdates = viewport.onUpdate.subscribe((key) => {
      if (key === 'lutComponents') {
        delete this.lut;
      }
    });
  }

  async render(viewport: Viewport): Promise<void> {
    if (
      this.context === undefined ||
      this.device === undefined ||
      this.pipeline === undefined
    ) {
      return;
    }

    const { dataset, camera, height, width, windowCenter, windowWidth } =
      viewport;
    const frame = dataset.findClosestFrame(camera.lookPoint);
    const { columns, id, imageFormat, rescaleIntercept, rescaleSlope, rows } =
      frame;

    if (imageFormat !== NormalizedImageFormat.Int16) {
      throw new Error(`Unsupported image format: ${imageFormat}`);
    }

    validateCamera2D(frame, camera);

    if (this.texture === undefined || this.texture.id !== id) {
      this.texture?.instance.destroy();
      this.texture = {
        id,
        instance: this.createTexture(frame),
      };
    }

    if (this.lut === undefined || this.lut.windowWidth !== windowWidth) {
      this.lut =
        viewport.lutComponents !== undefined
          ? loadVOILUT(viewport.lutComponents, windowWidth)
          : getDefaultVOILUT(windowWidth);
    }

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

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        this.texture.instance.createView(),
        this.createBufferResource(
          new Float32Array(this.lut?.table.flat() ?? []),
          GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        ),
        this.createBufferResource(
          new Float32Array([
            clipHeight,
            clipWidth,
            clipX,
            clipY,
            columns,
            rescaleIntercept,
            rescaleSlope,
            rows,
            windowCenter,
            windowWidth,
          ]),
        ),
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

  private createBufferResource(
    source: BufferSource,
    usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  ): GPUBufferBinding {
    if (this.device === undefined) {
      throw new Error('No device');
    }

    const buffer = this.device.createBuffer({ size: source.byteLength, usage });

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
      format: 'r16sint',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    this.device.queue.writeTexture(
      { texture },
      pixelData,
      { bytesPerRow: columns * Int16Array.BYTES_PER_ELEMENT },
      { width: columns, height: rows },
    );

    return texture;
  }
}
