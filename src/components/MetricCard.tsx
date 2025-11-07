import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = "default" 
}: MetricCardProps) => {
  const getVariantColor = () => {
    switch (variant) {
      case "success": return "text-success";
      case "warning": return "text-warning";
      case "danger": return "text-destructive";
      default: return "text-primary";
    }
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className={`text-3xl font-bold ${getVariantColor()}`}>{value}</p>
          {trendValue && (
            <p className="text-xs text-muted-foreground mt-2">{trendValue}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-${variant === "default" ? "primary" : variant}/10`}>
            <Icon className={`h-6 w-6 ${getVariantColor()}`} />
          </div>
        )}
      </div>
    </Card>
  );
};
