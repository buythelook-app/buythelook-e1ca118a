
/**
 * Type definitions for the canvas rendering system
 */

export type ItemType = 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'coat';

export interface CanvasItem {
  id: string;
  image: string;
  type: ItemType;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PositionData {
  x: number;
  y: number;
  width: number;
  height: number;
}
