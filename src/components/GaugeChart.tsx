import { useEffect, useState } from "react";

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  size?: number;
  status?: "good" | "warning" | "danger";
}

export const GaugeChart = ({ value, max, label, size = 180, status }: GaugeChartProps) => {
  const [rotation, setRotation] = useState(-90);
  const percentage = (value / max) * 100;
  
  useEffect(() => {
    const targetRotation = -90 + (percentage / 100) * 180;
    setTimeout(() => setRotation(targetRotation), 100);
  }, [percentage]);

  const getGradient = () => {
    if (status === "good") return "from-success to-chart-1";
    if (status === "warning") return "from-destructive via-warning to-success";
    if (status === "danger") return "from-destructive to-warning";
    return "from-destructive via-warning to-success";
  };

  const getStatusColor = () => {
    if (percentage < 40) return "hsl(var(--destructive))";
    if (percentage < 70) return "hsl(var(--warning))";
    return "hsl(var(--success))";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        <svg
          width={size}
          height={size * 0.6}
          viewBox={`0 0 ${size} ${size * 0.6}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="50%" stopColor="hsl(var(--warning))" />
              <stop offset="100%" stopColor="hsl(var(--success))" />
            </linearGradient>
          </defs>
          
          <path
            d={`M ${size * 0.1} ${size * 0.55} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.55}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={size * 0.08}
            strokeLinecap="round"
          />
          
          <path
            d={`M ${size * 0.1} ${size * 0.55} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.55}`}
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth={size * 0.08}
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * (size * 1.256)} ${size * 1.256}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        <div
          className="absolute left-1/2 bottom-0 origin-bottom transition-transform duration-1000 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            width: size * 0.02,
            height: size * 0.35,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: size * 0.08,
              height: size * 0.08,
              backgroundColor: getStatusColor(),
              boxShadow: `0 0 ${size * 0.1}px ${getStatusColor()}`,
            }}
          />
        </div>

        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: getStatusColor() }}>
              {value}
              <span className="text-lg text-muted-foreground">/{max}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
};
