
import { useEffect, useRef, useState } from "react";
import { setupCanvas } from "@/utils/canvas";
import { renderCanvasItems } from "@/utils/canvas/itemRendererUtils";
import { type CanvasItem } from "@/types/canvasTypes";

interface UseCanvasRendererProps {
  items: CanvasItem[];
  width: number;
  height: number;
}

interface UseCanvasRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
}

export const useCanvasRenderer = ({
  items,
  width,
  height
}: UseCanvasRendererProps): UseCanvasRendererResult => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupCanvas(canvas, width, height);
    if (!ctx) {
      setError("Canvas context could not be created");
      setIsLoading(false);
      return;
    }

    // Render all items on the canvas
    renderCanvasItems({
      ctx,
      items,
      width,
      height,
      onComplete: () => setIsLoading(false),
      onError: (errorMessage) => {
        setError(errorMessage);
        setIsLoading(false);
      }
    });
    
  }, [items, width, height]);

  return {
    canvasRef,
    isLoading,
    error
  };
};
