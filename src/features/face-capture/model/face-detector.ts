import type * as FaceApi from 'face-api.js';

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
      scoreThreshold: 0.5,
    }),
  );
  return detections.length;
}
