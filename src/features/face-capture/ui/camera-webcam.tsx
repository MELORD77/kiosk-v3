import Webcam from 'react-webcam';

export class CameraWebcam extends Webcam {
  private mountGeneration = 0;

  override componentDidMount() {
    const generation = ++this.mountGeneration;
    // StrictMode replays mounting before this runs; start only the surviving mount.
    queueMicrotask(() => {
      if (generation === this.mountGeneration) super.componentDidMount();
    });
  }

  override componentWillUnmount() {
    this.mountGeneration += 1;
    super.componentWillUnmount();
  }
}
