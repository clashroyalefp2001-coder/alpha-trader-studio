import { useEffect, useRef } from "react";

interface SparklineChartProps {
  data: number[];
  title: string;
}

export const SparklineChart = ({ data, title }: SparklineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    
    ctx.clearRect(0, 0, W, H);
    
    if (!data.length) return;

    let min = Math.min(...data);
    let max = Math.max(...data);
    
    if (min === max) {
      min -= 1;
      max += 1;
    }

    const pad = 6;
    const n = data.length;

    // Zero line
    const y0 = (0 - min) / (max - min);
    const y0pix = H - (pad + y0 * (H - 2 * pad));
    ctx.beginPath();
    ctx.moveTo(0, y0pix);
    ctx.lineTo(W, y0pix);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.stroke();

    // Line chart
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad + (i * (W - 2 * pad)) / Math.max(1, n - 1);
      const yv = (data[i] - min) / (max - min);
      const y = H - (pad + yv * (H - 2 * pad));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsl(189, 94%, 43%)";
    ctx.stroke();
  }, [data]);

  return (
    <div className="bg-muted/10 rounded-xl p-3 border border-border/50">
      <div className="text-xs text-muted-foreground mb-2">{title}</div>
      <canvas ref={canvasRef} width={520} height={80} className="w-full" />
    </div>
  );
};
