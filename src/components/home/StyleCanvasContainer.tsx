
import { useEffect } from "react";
import { StyleCanvas } from "@/components/StyleCanvas";

export const StyleCanvasContainer = () => {
  useEffect(() => {
    for (let i = 0; i < 4; i++) {
      const canvas = document.getElementById(`style-canvas-${i}`) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f9f9f9';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, []);

  return (
    <div className="hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <StyleCanvas key={index} id={`style-canvas-${index}`} styleType={index} />
      ))}
    </div>
  );
};
