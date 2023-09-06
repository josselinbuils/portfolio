@group(0) @binding(0)  var pixelDataTexture: texture_3d<i32>;
@group(0) @binding(1)  var renderingTexture: texture_2d<f32>;
@group(0) @binding(2)  var<storage, read> frames: array<Frame>;
@group(0) @binding(3)  var<storage, read> lut: array<f32>;
@group(0) @binding(4)  var<uniform> camera: Camera;
@group(0) @binding(5)  var<uniform> image: Image;
@group(0) @binding(6)  var<uniform> properties: RenderingProperties;
@group(0) @binding(7)  var<uniform> viewport: Viewport;
@group(0) @binding(8)  var<uniform> volume: Volume;

const MIN_FLOAT_VALUE = -2e31;

struct Camera {
  eyePoint: vec3<f32>,
  direction: vec3<f32>,
}

struct Frame {
  columns: f32,
  imageOrientationX: vec3<f32>,
  imageOrientationY: vec3<f32>,
  imagePosition: vec3<f32>,
  rescaleIntercept: f32,
  rescaleSlope: f32,
  rows: f32,
}

struct Image {
  xAxis: vec3<f32>,
  yAxis: vec3<f32>,
}

struct Viewport {
  worldOrigin: vec3<f32>,
}

struct Volume {
  depthVoxels: f32,
  firstVoxelCenter: vec3<f32>,
  orientationZ: vec3<f32>,
  voxelSpacing: vec3<f32>,
}

struct RenderingProperties {
  clipHeight: f32,
  clipWidth: f32,
  clipX: f32,
  clipY: f32,
  draft: f32,
  leftLimit: f32,
  lightPoint: vec3<f32>,
  rightLimit: f32,
  targetRatio: f32,
}

@vertex
fn vertex(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  let pos = array<vec2<f32>, 6>(
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1),
  );
  let imageAreaMat = mat3x3(
    properties.clipWidth, 0, 0, 0, properties.clipHeight, 0, properties.clipX,
    properties.clipY, 1
  );

  return vec4<f32>(imageAreaMat * vec3<f32>(pos[vertexIndex], 1), 1);
}

@fragment
fn fragmentMIP(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  var pointLPS = getPointLPS(
    viewport.worldOrigin,
    image.xAxis,
    image.yAxis,
    position[0],
    position[1],
  );

  let directionScaled = camera.direction *
    length(volume.voxelSpacing * camera.direction);

  var maxPixelValue = MIN_FLOAT_VALUE;

  for (var i: f32 = 0; i < volume.depthVoxels; i += 1) {
    maxPixelValue = max(maxPixelValue, getLPSPixelValue(pointLPS));
    pointLPS += directionScaled;
  }
  return applyLUT(maxPixelValue, 1);
}

@fragment
fn fragmentMPR(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let pointLPS = getPointLPS(
    viewport.worldOrigin,
    image.xAxis,
    image.yAxis,
    position[0],
    position[1],
  );
  let rawValue = getLPSPixelValue(pointLPS);

  return applyLUT(rawValue, 1);
}

@fragment
fn fragment3D(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  var pointLPS = getPointLPS(
    viewport.worldOrigin,
    image.xAxis,
    image.yAxis,
    position[0],
    position[1],
  );

  let directionScaled = camera.direction *
    length(volume.voxelSpacing * camera.direction);

    let targetValue = properties.leftLimit +
      (properties.rightLimit - properties.leftLimit) / properties.targetRatio;

  for (var i: f32 = 0; i < volume.depthVoxels; i += 1) {
    let rawPixelValue = getLPSPixelValue(pointLPS);

    if (rawPixelValue > targetValue) {
      let textureSize = textureDimensions(renderingTexture);
      let textureValue = textureLoad(
        renderingTexture, vec2<u32>(u32(position[0]) % (textureSize[0] - 1),
        u32(position[1]) % (textureSize[1] - 1)), 0
      );
      let dist = distance(properties.lightPoint, pointLPS);
      let maxValue = properties.rightLimit - properties.leftLimit - 1;
      let value = floor(clamp(
        rawPixelValue - properties.leftLimit, 0, maxValue
      ));
      var alpha = value / maxValue * 0.8 + min(20000 / pow(i, 2), 0.5) +
        min(140000 / pow(dist, 2), 0.4);

      // Bones
      if (properties.targetRatio < 2) {
        alpha -= 0.5;
      }

      return vec4<f32>(
        textureValue[0] * alpha, textureValue[1] * alpha,
        textureValue[2] * alpha, 1
      );
    }
    pointLPS += directionScaled;
  }
  return applyLUT(MIN_FLOAT_VALUE, 0);
}

// 0 < baseAlpha < 1
fn applyLUT(rawValue: f32, baseAlpha: f32) -> vec4<f32> {
  let lutIndex = u32(floor(clamp(
    rawValue - properties.leftLimit, 0,
    properties.rightLimit - properties.leftLimit - 1
  )) * 3);

  var alpha: f32 = 0;

  if (rawValue > MIN_FLOAT_VALUE) {
    alpha = baseAlpha;
  }
  return vec4(
    lut[lutIndex] / 255 * alpha, lut[lutIndex + 1] / 255 * alpha,
    lut[lutIndex + 2] / 255 * alpha, 1
  );
}

// See https://helloacm.com/cc-function-to-compute-the-bilinear-interpolation/
fn bilinearInterpolate(
  c00: f32, c01: f32, c10: f32, c11: f32, x0: f32, x1: f32, y0: f32, y1: f32,
  x: f32, y: f32
) -> f32 {
  return 1 / (
    (x1 - x0) * (y1 - y0)) * (c00 * (x1 - x) * (y1 - y) + c10 * (x - x0) *
      (y1 - y) + c01 * (x1 - x) * (y - y0) + c11 * (x - x0) * (y - y0)
  );
}

fn getLPSPixelValue(pointLPS: vec3<f32>) -> f32 {
  let frameIndexVector = (pointLPS - volume.firstVoxelCenter) /
    volume.voxelSpacing * volume.orientationZ;

  let frameIndex = frameIndexVector[0] + frameIndexVector[1] +
    frameIndexVector[2];

  let frameIndex0 = floor(frameIndex);
  let frameIndex1 = ceil(frameIndex);

  if (properties.draft == 1) {
    return getRawValue(pointLPS, round(frameIndex));
  }

  if (frameIndex0 == frameIndex1) {
    return getRawValue(pointLPS, frameIndex);
  }

  let rawValue1 = getRawValue(pointLPS, frameIndex0);
  let rawValue2 = getRawValue(pointLPS, frameIndex1);

  if (rawValue1 == MIN_FLOAT_VALUE) {
    return rawValue2;
  }
  if (rawValue2 == MIN_FLOAT_VALUE) {
    return rawValue1;
  }
  return linearInterpolate(rawValue1, rawValue2, frameIndex % 1);
}

fn getPixelValue(x: f32, y: f32, z:f32) -> f32 {
  return f32(textureLoad(pixelDataTexture, vec3(u32(x), u32(y), u32(z)), 0)[0]);
}

fn getPointLPS(
  worldOrigin: vec3<f32>, xAxis: vec3<f32>, yAxis: vec3<f32>, x: f32,
  y: f32,
) -> vec3<f32> {
  return worldOrigin + xAxis * x + yAxis * y;
}

fn getRawValue(pointLPS: vec3<f32>, frameIndex: f32) -> f32 {
  let frameIndexUnsigned = u32(frameIndex);

  if (frameIndex < 0 || frameIndexUnsigned >= arrayLength(&frames)) {
    return MIN_FLOAT_VALUE;
  }

  let frame = frames[frameIndexUnsigned];

  let imagePositionToPoint = (pointLPS - frame.imagePosition) /
    volume.voxelSpacing;

  let xVector = imagePositionToPoint * frame.imageOrientationX;
  let x = xVector[0] + xVector[1] + xVector[2];

  let yVector = imagePositionToPoint * frame.imageOrientationY;
  let y = yVector[0] + yVector[1] + yVector[2];

  let x0 = floor(x);
  let y0 = floor(y);

  let x1 = ceil(x);
  let y1 = ceil(y);

  if (
    x0 >= 0 && x0 < frame.columns &&
    x1 >= 0 && x1 < frame.columns &&
    y0 >= 0 && y0 < frame.rows &&
    y1 >= 0 && y1 < frame.rows
  ) {
    if (properties.draft == 1) {
      return getPixelValue(round(x), round(y), frameIndex) *
        frame.rescaleSlope + frame.rescaleIntercept;
    }

    if (x1 == x0 || y1 == y0) {
      let c0 = getPixelValue(x0, y0, frameIndex);
      let c1 = getPixelValue(x1, y1, frameIndex);

      return linearInterpolate(c0, c1, x % 1 + y % 1) * frame.rescaleSlope +
        frame.rescaleIntercept;
    }

    let c00 = getPixelValue(x0, y0, frameIndex);
    let c10 = getPixelValue(x1, y0, frameIndex);
    let c01 = getPixelValue(x0, y1, frameIndex);
    let c11 = getPixelValue(x1, y1, frameIndex);

    return bilinearInterpolate(c00, c01, c10, c11, x0, x1, y0, y1, x, y) *
      frame.rescaleSlope + frame.rescaleIntercept;
  }
  return MIN_FLOAT_VALUE;
}

fn linearInterpolate(c0: f32, c1: f32, dist: f32) -> f32 {
  return c0 + (c1 - c0) * dist;
}
