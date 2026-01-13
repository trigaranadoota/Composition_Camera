
export type OverlayOrientation = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface CameraConfig {
  facingMode: 'user' | 'environment';
  showSpiral: boolean;
  showGrid: boolean;
  orientation: OverlayOrientation;
  timerSetting: 0 | 3 | 5 | 10;
  zoom: number;
}
