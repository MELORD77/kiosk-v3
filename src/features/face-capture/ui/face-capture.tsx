import { ActiveFaceCapture } from './active-face-capture';

export interface FaceCaptureProps {
  active: boolean;
  signal?: AbortSignal;
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export function FaceCapture({ active, ...props }: FaceCaptureProps) {
  if (!active) return null;
  return <ActiveFaceCapture {...props} />;
}
