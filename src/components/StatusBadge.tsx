import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "LONG" | "SHORT" | "FLAT" | "OFFLINE";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case "LONG":
        return "bg-success/15 text-success border-success/30 hover:bg-success/20";
      case "SHORT":
        return "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20";
      case "FLAT":
        return "bg-muted/30 text-muted-foreground border-border hover:bg-muted/40";
      case "OFFLINE":
        return "bg-muted/20 text-muted-foreground border-border";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-extrabold px-4 py-2 text-sm tracking-wider ${getVariant()}`}
    >
      {status}
    </Badge>
  );
};
