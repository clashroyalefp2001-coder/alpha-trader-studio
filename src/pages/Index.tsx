import { useState } from "react";
import { Activity, TrendingUp, BarChart3, DollarSign, Users, Settings } from "lucide-react";
import { GaugeChart } from "@/components/GaugeChart";
import { MetricCard } from "@/components/MetricCard";
import { ActivityChart } from "@/components/ActivityChart";
import { StatusChart } from "@/components/StatusChart";
import { BarComparisonChart } from "@/components/BarComparisonChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [timeRange, setTimeRange] = useState("week");

  // Mock data for charts
  const activityData = [
    { date: "16.07", value: 2400 },
    { date: "17.07", value: 3200 },
    { date: "18.07", value: 2800 },
    { date: "19.07", value: 4800 },
    { date: "20.07", value: 3400 },
    { date: "21.07", value: 3800 },
    { date: "22.07", value: 2600 },
  ];

  const statusData = [
    { name: "Active", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Processing", value: 32, color: "hsl(var(--success))" },
    { name: "Pending", value: 11, color: "hsl(var(--warning))" },
    { name: "Failed", value: 2, color: "hsl(var(--destructive))" },
  ];

  const comparisonData = [
    { name: "Mon", current: 720, previous: 580 },
    { name: "Tue", current: 520, previous: 680 },
    { name: "Wed", current: 820, previous: 750 },
    { name: "Thu", current: 680, previous: 620 },
    { name: "Fri", current: 780, previous: 710 },
    { name: "Sat", current: 380, previous: 420 },
    { name: "Sun", current: 420, previous: 350 },
  ];

  const barConfig = [
    { dataKey: "current", color: "hsl(var(--success))", name: "Current Week" },
    { dataKey: "previous", color: "hsl(var(--muted))", name: "Last Week" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Trading Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("ru-RU", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Time Range Selector */}
        <div className="mb-8">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Trades"
            value="981"
            icon={Activity}
            variant="default"
            trendValue="+12.5% from last week"
          />
          <MetricCard
            title="Success Rate"
            value="87.3%"
            icon={TrendingUp}
            variant="success"
            trendValue="+3.2% improvement"
          />
          <MetricCard
            title="Active Positions"
            value="23"
            icon={BarChart3}
            variant="warning"
            trendValue="5 pending orders"
          />
          <MetricCard
            title="Total Profit"
            value="$12,847"
            icon={DollarSign}
            variant="success"
            trendValue="+8.1% this month"
          />
        </div>

        {/* Gauges Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <GaugeChart value={6} max={10} label="Performance Score" />
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <GaugeChart value={8} max={10} label="Risk Level" status="good" />
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <GaugeChart value={79} max={100} label="Capacity Utilization" />
          </div>
        </div>

        {/* Activity Chart */}
        <div className="mb-8">
          <ActivityChart data={activityData} title="Trading Activity" />
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart
            data={statusData}
            title="Order Status Distribution"
            total={195}
            centerLabel="Total Orders"
          />
          <BarComparisonChart
            data={comparisonData}
            title="Weekly Performance Comparison"
            bars={barConfig}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
