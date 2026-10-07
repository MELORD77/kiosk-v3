import type * as FaceApi from 'face-api.js';

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

let modelPromise: Promise<typeof FaceApi> | undefined;

function loadDetector() {
  modelPromise ??= import('face-api.js')
    .then(async (faceApi) => {
      await faceApi.nets.tinyFaceDetector.loadFromUri(
        `${import.meta.env.BASE_URL}models/face-api`,
      );
      return faceApi;
    })
    .catch((error: unknown) => {
      modelPromise = undefined;
      throw error;
    });
  return modelPromise;
}

export async function loadFaceModel() {
  await loadDetector();
}

export async function detectFaces(canvas: HTMLCanvasElement) {
  const faceApi = await loadDetector();
  const detections = await faceApi.detectAllFaces(
    canvas,
    new faceApi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.4,
    }),
  );
  return detections.map(({ box }): FaceBox => {
    const x = Math.max(0, Math.min(1, box.x / canvas.width));
    const y = Math.max(0, Math.min(1, box.y / canvas.height));
    return {
      x,
      y,
      width: Math.max(0, Math.min(1 - x, box.width / canvas.width)),
      height: Math.max(0, Math.min(1 - y, box.height / canvas.height)),
    };
  });
}
