/** A full viewport-sized segment per demo prevents premature panel changes. */
export const DEMO_SEGMENT_MIN_PX = 720;
export const DEMO_SEGMENT_VIEWPORT_RATIO = 0.9;
export function getDemoSegmentDistance(viewportHeight: number): number {
  return Math.max(DEMO_SEGMENT_MIN_PX, viewportHeight * DEMO_SEGMENT_VIEWPORT_RATIO);
}
export function getDemoPanelIndex(progress: number, panelCount: number): number {
  return Math.max(0, Math.min(panelCount - 1, Math.floor(progress * panelCount)));
}
