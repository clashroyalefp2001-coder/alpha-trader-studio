import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { LedIndicator } from "@/components/LedIndicator";
import { KpiTile } from "@/components/KpiTile";
import { SparklineChart } from "@/components/SparklineChart";

interface Instrument {
  ticker: string;
  name: string;
  has_archive?: boolean;
}

interface StrategyParams {
  hyst_k_lr: number;
  hyst_k_macd: number;
  macd_strong_k: number;
  threshold: number;
  weights: {
    w_renko: number;
    w_lr: number;
    w_macd: number;
    w_cross: number;
    w_zero: number;
  };
}

const defaultInstruments: Instrument[] = [
  { ticker: "SBER", name: "Сбербанк", has_archive: true },
  { ticker: "GAZP", name: "Газпром", has_archive: false },
  { ticker: "LKOH", name: "Лукойл", has_archive: false },
];

const Index = () => {
  const [instruments, setInstruments] = useState<Instrument[]>(defaultInstruments);
  const [selectedTicker, setSelectedTicker] = useState<string>("SBER");
  const [wsStatus, setWsStatus] = useState<string>("Подключение...");
  const [recommendation, setRecommendation] = useState<"LONG" | "SHORT" | "FLAT" | "OFFLINE">("OFFLINE");
  
  // Dashboard data
  const [ticker, setTicker] = useState<string>("—");
  const [time, setTime] = useState<string>("—");
  const [last, setLast] = useState<string>("—");
  const [score, setScore] = useState<string>("—");
  const [confidence, setConfidence] = useState<string>("—");
  const [brick, setBrick] = useState<string>("—");
  const [nextUp, setNextUp] = useState<string>("—");
  const [nextDn, setNextDn] = useState<string>("—");
  const [renkoSig, setRenkoSig] = useState<string>("—");
  const [seriesDir, setSeriesDir] = useState<string>("0 / —");
  
  // LED indicators
  const [ledRenko, setLedRenko] = useState<"up" | "down" | "flat">("flat");
  const [ledLR, setLedLR] = useState<"up" | "down" | "flat">("flat");
  const [ledMACD, setLedMACD] = useState<"up" | "down" | "flat">("flat");
  
  // Info boxes
  const [lrInfo, setLrInfo] = useState<string>("—");
  const [macdInfo, setMacdInfo] = useState<string>("—");
  const [reasons, setReasons] = useState<string>("—");
  
  // Score history
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  
  // Strategy parameters
  const [params, setParams] = useState<StrategyParams>({
    hyst_k_lr: 2.0,
    hyst_k_macd: 3.0,
    macd_strong_k: 1.0,
    threshold: 1.0,
    weights: {
      w_renko: 1.2,
      w_lr: 0.8,
      w_macd: 0.8,
      w_cross: 0.2,
      w_zero: 0.2,
    },
  });

  const fmt = (x: number | null | undefined, n: number = 2): string => {
    if (x === null || x === undefined) return "—";
    return Number(x).toFixed(n);
  };

  const sendCmd = useCallback((ws: WebSocket | null, name: string, cmdParams: any = {}) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "cmd", name, ...cmdParams }));
  }, []);

  useEffect(() => {
    const endpoints = ["ws://127.0.0.1:8788", "ws://localhost:8788"];
    let epIdx = 0;
    let ws: WebSocket | null = null;

    const connectWS = () => {
      ws = new WebSocket(endpoints[epIdx]);

      ws.onopen = () => {
        setWsStatus("WS CONNECTED");
        sendCmd(ws, "list_instruments");
      };

      ws.onclose = () => {
        setRecommendation("OFFLINE");
        setWsStatus("WS CLOSED");
      };

      ws.onerror = () => {
        setWsStatus("WS ERROR");
        if (epIdx + 1 < endpoints.length) {
          epIdx += 1;
          setTimeout(connectWS, 300);
        }
      };

      ws.onmessage = (e) => {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }

        if (msg.type === "hello") return;
        
        if (msg.type === "instruments") {
          const items = msg.items || [];
          if (items.length > 0) {
            setInstruments(items);
          }
          return;
        }

        if (msg.type === "params") {
          const p = msg.params || {};
          const w = p.weights || {};
          setParams({
            hyst_k_lr: p.hyst_k_lr ?? 2.0,
            hyst_k_macd: p.hyst_k_macd ?? 3.0,
            macd_strong_k: p.macd_strong_k ?? 1.0,
            threshold: p.threshold ?? 1.0,
            weights: {
              w_renko: w.w_renko ?? 1.2,
              w_lr: w.w_lr ?? 0.8,
              w_macd: w.w_macd ?? 0.8,
              w_cross: w.w_cross ?? 0.2,
              w_zero: w.w_zero ?? 0.2,
            },
          });
          return;
        }

        if (msg.type === "status") {
          setWsStatus(msg.msg);
          return;
        }

        if (msg.type === "backfill_done") {
          setWsStatus(`Архив загружен: ${msg.count} строк`);
          return;
        }

        if (msg.type !== "snapshot") return;

        const d = msg.data;
        setTicker(d.ticker);
        setTime(d.time);
        setLast(fmt(d.last));
        setBrick(fmt(d.brick));
        setScore((d.score >= 0 ? "+" : "") + fmt(d.score, 2));
        setConfidence((d.confidence != null ? d.confidence : 0) + "%");
        setNextUp(fmt(d.next_up));
        setNextDn(fmt(d.next_dn));
        setRenkoSig(d.renko?.signal || "—");
        setSeriesDir(((d.renko?.series) || 0) + " / " + (d.renko?.dir || "—"));

        const r = d.recommendation || "FLAT";
        setRecommendation(r);

        // LED indicators
        let renkoMode: "up" | "down" | "flat" = "flat";
        if (d.renko?.signal === "LONG") renkoMode = "up";
        else if (d.renko?.signal === "SHORT") renkoMode = "down";
        setLedRenko(renkoMode);

        const lr = d.lr || {};
        const slope = lr.slope || 0;
        let lrMode: "up" | "down" | "flat" = "flat";
        if (lr.relation === "ABOVE" && slope > 0) lrMode = "up";
        else if (lr.relation === "BELOW" && slope < 0) lrMode = "down";
        setLedLR(lrMode);

        const m = d.macd || {};
        let macdMode: "up" | "down" | "flat" = "flat";
        if (m.hist > 0 && m.macd > m.signal_val) macdMode = "up";
        else if (m.hist < 0 && m.macd < m.signal_val) macdMode = "down";
        setLedMACD(macdMode);

        setLrInfo(
          `${lr.relation || "—"}, slope=${(lr.slope ?? 0).toFixed(6)}, lr_last=${fmt(lr.lr_last, 4)}, Δ=${fmt(lr.delta, 4)}, eps=${fmt(lr.eps_lr, 4)}`
        );
        setMacdInfo(
          `macd=${fmt(m.macd, 6)}, signal=${fmt(m.signal_val, 6)}, hist=${fmt(m.hist, 6)}, eps=${fmt(m.eps_macd, 6)}`
        );
        setReasons(d.reasons && d.reasons.length ? d.reasons.join(", ") : "—");

        // Score history
        setScoreHistory((prev) => {
          const newHistory = [...prev, d.score || 0];
          if (newHistory.length > 200) newHistory.shift();
          return newHistory;
        });
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, [sendCmd]);

  const handleSwitchTicker = () => {
    setWsStatus("Переключаем тикер…");
    // Will be implemented with WebSocket
  };

  const handleLoadArchive = () => {
    setWsStatus("Гружу архив…");
    // Will be implemented with WebSocket
  };

  const handleApplyParams = () => {
    setWsStatus("Применяю параметры…");
    // Will be implemented with WebSocket
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Dashboard Card */}
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Инструмент / Время
              </div>
              <div className="text-3xl font-extrabold text-foreground">{ticker}</div>
              <div className="text-sm text-muted-foreground mt-1">{time}</div>
            </div>
            <StatusBadge status={recommendation} />
          </div>

          {/* Ticker Selector */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <div className="text-xs text-muted-foreground uppercase">Инструмент:</div>
            <Select value={selectedTicker} onValueChange={setSelectedTicker}>
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((inst) => (
                  <SelectItem key={inst.ticker} value={inst.ticker}>
                    {inst.ticker} — {inst.name}
                    {inst.has_archive && " (архив)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSwitchTicker} variant="outline">
              Переключить
            </Button>
            <Button onClick={handleLoadArchive} variant="outline">
              Загрузить архив
            </Button>
            <span className="text-xs text-muted-foreground">{wsStatus}</span>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <KpiTile label="Last" value={last} />
            <KpiTile label="Score" value={score} />
            <KpiTile label="Confidence" value={confidence} />
            <KpiTile label="Brick" value={brick} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KpiTile label="Next ↑" value={nextUp} valueColor="text-success" />
            <KpiTile label="Next ↓" value={nextDn} valueColor="text-destructive" />
            <KpiTile label="Renko" value={renkoSig} />
            <KpiTile label="Series / Dir" value={seriesDir} />
          </div>

          {/* LED Indicators & Sparkline */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <LedIndicator label="RENKO" status={ledRenko} />
              <LedIndicator label="LR" status={ledLR} />
              <LedIndicator label="MACD" status={ledMACD} />
            </div>
            <div className="flex-1 max-w-[520px] w-full">
              <SparklineChart data={scoreHistory} title="Score (последние значения)" />
            </div>
          </div>

          {/* Parameters */}
          <div className="border-t border-border pt-6">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Параметры (на лету)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="hyst_k_lr" className="text-xs text-muted-foreground">
                  hyst_k_lr
                </Label>
                <Input
                  id="hyst_k_lr"
                  type="number"
                  step="0.1"
                  value={params.hyst_k_lr}
                  onChange={(e) =>
                    setParams({ ...params, hyst_k_lr: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hyst_k_macd" className="text-xs text-muted-foreground">
                  hyst_k_macd
                </Label>
                <Input
                  id="hyst_k_macd"
                  type="number"
                  step="0.1"
                  value={params.hyst_k_macd}
                  onChange={(e) =>
                    setParams({ ...params, hyst_k_macd: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="macd_strong_k" className="text-xs text-muted-foreground">
                  macd_strong_k
                </Label>
                <Input
                  id="macd_strong_k"
                  type="number"
                  step="0.1"
                  value={params.macd_strong_k}
                  onChange={(e) =>
                    setParams({ ...params, macd_strong_k: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="threshold" className="text-xs text-muted-foreground">
                  threshold
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.1"
                  value={params.threshold}
                  onChange={(e) =>
                    setParams({ ...params, threshold: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w_renko" className="text-xs text-muted-foreground">
                  w_renko
                </Label>
                <Input
                  id="w_renko"
                  type="number"
                  step="0.1"
                  value={params.weights.w_renko}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      weights: { ...params.weights, w_renko: Number(e.target.value) },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w_lr" className="text-xs text-muted-foreground">
                  w_lr
                </Label>
                <Input
                  id="w_lr"
                  type="number"
                  step="0.1"
                  value={params.weights.w_lr}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      weights: { ...params.weights, w_lr: Number(e.target.value) },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w_macd" className="text-xs text-muted-foreground">
                  w_macd
                </Label>
                <Input
                  id="w_macd"
                  type="number"
                  step="0.1"
                  value={params.weights.w_macd}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      weights: { ...params.weights, w_macd: Number(e.target.value) },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w_cross" className="text-xs text-muted-foreground">
                  w_cross
                </Label>
                <Input
                  id="w_cross"
                  type="number"
                  step="0.1"
                  value={params.weights.w_cross}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      weights: { ...params.weights, w_cross: Number(e.target.value) },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w_zero" className="text-xs text-muted-foreground">
                  w_zero
                </Label>
                <Input
                  id="w_zero"
                  type="number"
                  step="0.1"
                  value={params.weights.w_zero}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      weights: { ...params.weights, w_zero: Number(e.target.value) },
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleApplyParams}>Применить параметры</Button>
          </div>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              LR(окно)
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed mb-6">
              {lrInfo}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              MACD(15/50/25)
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed mb-4">
              {macdInfo}
            </div>
            <div className="text-xs text-muted-foreground pt-4 border-t border-border">
              eps_lr / eps_macd влияют на чувствительность к шуму.
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Причины решения
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {reasons}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
