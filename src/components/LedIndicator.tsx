interface LedIndicatorProps {
  label: string;
  status: "up" | "down" | "flat";
}

export const LedIndicator = ({ label, status }: LedIndicatorProps) => {
  const getDotColor = () => {
    switch (status) {
      case "up":
        return "bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]";
      case "down":
        return "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]";
      case "flat":
        return "bg-muted-foreground/40 shadow-[0_0_4px_rgba(0,0,0,0.3)_inset]";
      default:
        return "bg-muted-foreground/40";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/10 border border-border rounded-xl">
      <div className={`w-2.5 h-2.5 rounded-full ${getDotColor()} transition-all duration-300`} />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};
