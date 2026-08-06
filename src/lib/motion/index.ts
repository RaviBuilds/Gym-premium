/**
 * The motion camera system — one virtual camera, one depth vocabulary, one hook.
 *
 * Import from here rather than reaching into individual files, so the surface
 * area sections depend on stays small:
 *
 *   <MotionCameraProvider>          mounted once, in the root layout
 *   useCameraLayer(depth, opts)     the only scroll hook a section needs
 *   <CameraLayer depth="...">       the wrapper form (components/motion)
 *   DEPTH_LAYERS                    the depth token table
 *
 * Background on why this replaced the previous parallax hooks is in
 * camera-tokens.ts and use-camera-layer.ts.
 */

export {
  CAMERA_SPRING,
  DEPTH_LAYERS,
  MOTION_INTENSITY,
  VELOCITY_REFERENCE,
  VELOCITY_SPRING,
  resolveAmplitude,
} from "./camera-tokens";
export type { DepthLayer, DepthToken, MotionIntensityTier } from "./camera-tokens";

export { MotionCameraProvider, useMotionCamera } from "./MotionCameraProvider";
export type { MotionCameraState } from "./MotionCameraProvider";

export { useCameraLayer } from "./use-camera-layer";
export type { UseCameraLayerOptions, UseCameraLayerResult } from "./use-camera-layer";
