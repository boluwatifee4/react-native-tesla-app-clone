import { AppViewMode } from '../types/tesla';

export const HEADER_HEIGHT = 78;
export const MINI_CANVAS_HEIGHT = 300;
export const FULL_VIEW_CANVAS_FRACTION = 0.74;
export const SHEET_EXPANDED_TOP_FRACTION = 0.34;

export const isFullViewMode = (mode: AppViewMode): boolean =>
  mode === 'controls' || mode === 'climate';

export const fullViewCanvasHeight = (windowH: number): number =>
  Math.round(windowH * FULL_VIEW_CANVAS_FRACTION);

export const canvasHeightFor = (mode: AppViewMode, windowH: number): number =>
  isFullViewMode(mode) ? fullViewCanvasHeight(windowH) : MINI_CANVAS_HEIGHT;
