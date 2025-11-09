interface KpiTileProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

export const KpiTile = ({ label, value, valueColor }: KpiTileProps) => {
  return (
    <div className="bg-muted/10 rounded-2xl p-3 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </div>
      <div className={`text-2xl font-bold ${valueColor || 'text-foreground'}`}>
        {value}
      </div>
    </div>
  );
};
