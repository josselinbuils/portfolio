import { ViewType } from '@/apps/DICOMViewer/constants';
import { type LUTComponent } from '@/apps/DICOMViewer/interfaces/LUTComponent';
import { type VOILUT } from '@/apps/DICOMViewer/interfaces/VOILUT';
import { type Dataset } from '@/apps/DICOMViewer/models/Dataset';
import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { changePointSpace } from '@/apps/DICOMViewer/utils/changePointSpace';
import { loadVOILUT } from '@/apps/DICOMViewer/utils/loadVOILUT';
import { V } from '@/apps/DICOMViewer/utils/math/Vector';
import { type Renderer } from '../Renderer';
import { type ViewportSpaceCoordinates } from '../RenderingProperties';
import { getDefaultVOILUT } from '../js/utils/getDefaultVOILUT';
import { getRenderingProperties } from '../renderingUtils';
import shaders from './volumeShaders.wgsl?raw';

const skinLUTComponents: LUTComponent[] = [
  { id: '0', start: 10, end: 135, color: [235, 190, 180] },
];

export class WebGPUVolumeRenderer implements Renderer {
  private context?: GPUCanvasContext;
  private device?: GPUDevice;
  private lut?: VOILUT;
  private pipeline?: GPURenderPipeline;
  private texture?: GPUTexture;
  private unsubscribeToViewportUpdates?: () => void;

  // TODO create Image CoordinateSpace class
  private static getImageWorldBasis(viewport: Viewport): number[][] {
    const { camera, dataset } = viewport;
    const cameraBasis = camera.getWorldBasis();
    const horizontalVoxelSpacing = Math.abs(
      V(dataset.voxelSpacing).dot(cameraBasis[0]),
    );
    const verticalVoxelSpacing = Math.abs(
      V(dataset.voxelSpacing).dot(cameraBasis[1]),
    );

    return [
      V(cameraBasis[0]).mul(horizontalVoxelSpacing),
      V(cameraBasis[1]).mul(verticalVoxelSpacing),
    ];
  }

  private static getImageWorldOrigin(
    viewport: Viewport,
    viewportSpace: ViewportSpaceCoordinates,
  ): number[] {
    const { dataset } = viewport;
    return changePointSpace(
      [viewportSpace.imageX0, viewportSpace.imageY0, 0],
      viewport,
      dataset,
    );
  }

  constructor(private canvas: HTMLCanvasElement) {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported on this browser.');
    }
  }

  destroy(): void {
    this.device?.destroy();
    this.texture?.destroy();
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
          { texture: { sampleType: 'sint', viewDimension: '3d' } },
          { buffer: { type: 'read-only-storage' } },
          { buffer: { type: 'read-only-storage' } },
          { buffer: { type: 'uniform' } },
          { buffer: { type: 'uniform' } },
        ] satisfies Omit<GPUBindGroupLayoutEntry, 'binding' | 'visibility'>[]
      ).map((props, binding) => ({
        ...props,
        binding,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
      })),
    });

    const is3D = [ViewType.VolumeBones, ViewType.VolumeSkin].includes(
      viewport.viewType,
    );

    this.pipeline = this.device.createRenderPipeline({
      label: 'Render pipeline',
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vertex',
      },
      fragment: {
        module: shaderModule,
        entryPoint: is3D ? 'fragment3D' : 'fragmentMPR',
        targets: [{ format: 'bgra8unorm' }],
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

    const { camera, dataset, height, width, windowWidth } = viewport;

    if (this.texture === undefined) {
      this.texture = this.createTexture(dataset);
    }

    if (this.lut === undefined || this.lut.windowWidth !== windowWidth) {
      if (viewport.lutComponents !== undefined) {
        this.lut = loadVOILUT(viewport.lutComponents, windowWidth);
      } else if (viewport.viewType === ViewType.VolumeSkin) {
        this.lut = loadVOILUT(skinLUTComponents, windowWidth);
      } else {
        this.lut = getDefaultVOILUT(windowWidth);
      }
    }

    const renderingProperties = getRenderingProperties(viewport);

    if (renderingProperties === undefined) {
      return;
    }

    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace,
    } = renderingProperties;

    const { imageHeight, imageWidth, imageX0, imageX1, imageY0, imageY1 } =
      boundedViewportSpace;

    const { displayHeight, displayWidth } = imageSpace;
    const viewportSpaceImageX0 = viewportSpace.imageX0;
    const viewportSpaceImageY0 = viewportSpace.imageY0;
    const imageWorldOrigin = WebGPUVolumeRenderer.getImageWorldOrigin(
      viewport,
      viewportSpace,
    );
    let [xAxis, yAxis] = WebGPUVolumeRenderer.getImageWorldBasis(viewport);

    const { dimensionsVoxels, firstVoxelCenter, orientation, voxelSpacing } =
      dataset.volume!;

    xAxis = V(xAxis).mul(displayWidth / imageWidth);
    yAxis = V(yAxis).mul(displayHeight / imageHeight);

    // 3D rendering properties
    const basis = camera.getWorldBasis();
    const direction = basis[2];
    const targetRatio = viewport.viewType === ViewType.VolumeBones ? 1.1 : 100;
    const targetValue = leftLimit + (rightLimit - leftLimit) / targetRatio;

    // Convert dst pixel coordinates to clip space coordinates
    const clipX = (imageX0 / width) * 2 - 1;
    const clipY = (imageY0 / height) * -2 + 1;
    const clipWidth = (imageWidth / width) * 2;
    const clipHeight = (imageHeight / height) * -2;

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        this.texture.createView(),
        this.createBufferResource(
          new Float32Array(this.lut?.table.flat() ?? []),
          GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        ),
        this.createBufferResource(
          new Float32Array(
            dataset.frames
              .map((frame) =>
                align([
                  frame.columns,
                  frame.imageOrientation[0],
                  frame.imageOrientation[1],
                  frame.imagePosition,
                  frame.rescaleIntercept,
                  frame.rescaleSlope,
                  frame.rows,
                ]),
              )
              .flat(),
          ),
          GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        ),
        this.createBufferResource(
          new Float32Array(
            align([
              clipHeight,
              clipWidth,
              clipX,
              clipY,
              direction,
              viewport.draft ? 1 : 0,
              imageHeight,
              imageWidth,
              imageWorldOrigin,
              imageX0,
              imageX1,
              imageY0,
              imageY1,
              leftLimit,
              rightLimit,
              targetValue,
              viewportSpaceImageX0,
              viewportSpaceImageY0,
              xAxis,
              yAxis,
            ]),
          ),
        ),
        this.createBufferResource(
          new Float32Array(
            align([
              dimensionsVoxels,
              firstVoxelCenter,
              orientation[0],
              orientation[1],
              orientation[2],
              voxelSpacing,
            ]),
          ),
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

  private createTexture(dataset: Dataset): GPUTexture {
    if (this.device === undefined) {
      throw new Error('No device');
    }

    const { dimensionsVoxels } = dataset.volume!;

    const pixelDataMerged = new Int16Array(
      dimensionsVoxels[0] * dimensionsVoxels[1] * dimensionsVoxels[2],
    );

    dataset.frames.forEach(({ pixelData }, index) => {
      if (pixelData === undefined) {
        throw new Error(`Frame ${index} does not contain pixel data.`);
      }
      pixelDataMerged.set(pixelData, index * pixelData.length);
    });

    const texture = this.device.createTexture({
      dimension: '3d',
      size: dimensionsVoxels,
      format: 'r16sint',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    this.device.queue.writeTexture(
      { texture },
      pixelDataMerged,
      {
        bytesPerRow: dimensionsVoxels[0] * Int16Array.BYTES_PER_ELEMENT,
        rowsPerImage: dimensionsVoxels[1],
      },
      {
        depthOrArrayLayers: dimensionsVoxels[2],
        height: dimensionsVoxels[1],
        width: dimensionsVoxels[0],
      },
    );

    return texture;
  }
}

/*
 * See https://www.w3.org/TR/WGSL/#address-space-layout-constraints.
 *
 * Type      Align    Size
 * f32           4       4
 * i32           4       4
 * u32           4       4
 * vec2          8       8
 * vec3         16      12
 * vec4         16      16
 * mat2x2        8      16
 * mat3x3       16      48
 * mat4x4       16      64
 */
function align(input: (number | number[])[]): number[] {
  const aligned: number[] = [];

  for (const entry of input) {
    if (typeof entry === 'number') {
      aligned.push(entry);
    } else if (entry?.length === 3) {
      while (aligned.length % 4 > 0) {
        aligned.push(0);
      }
      aligned.push(...entry);
    } else {
      throw new Error(`Unmanaged entry type: ${entry}.`);
    }
  }
  while (aligned.length % 4 > 0) {
    aligned.push(0);
  }
  return aligned;
}
