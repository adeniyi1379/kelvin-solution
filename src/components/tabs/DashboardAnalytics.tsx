import React, { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  isThisWeek,
  isThisMonth,
  isToday,
  isSameDay,
  isSameWeek,
  isSameMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ReceiptText,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

type FilterKey = "month" | "week" | "today" | "all";

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Today", value: "today" },
  { label: "All Time", value: "all" },
];

const PREV_LABELS: Record<FilterKey, string> = {
  month: "vs last month",
  week: "vs last week",
  today: "vs yesterday",
  all: "all time",
};

const COLORS = {
  revenue: "#10b981",
  debt: "#ef4444",
  service: "#3b82f6",
};

const money = (n: number) => `#${Math.round(n).toLocaleString()}`;

const compact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `#${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `#${(n / 1_000).toFixed(0)}k`;
  return `#${n}`;
};

const pctChange = (current: number, previous: number): number | null => {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
};

interface TooltipEntry {
  name?: string | number;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: { fill?: string };
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color ?? entry.payload?.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {typeof entry.value === "number" ? money(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  delta: number | null;
  deltaGoodWhenUp: boolean;
  caption: string;
}

const KpiCard = ({ title, value, icon, iconClass, delta, deltaGoodWhenUp, caption }: KpiCardProps) => {
  const hasDelta = delta !== null && Number.isFinite(delta);
  const rounded = hasDelta ? Math.abs(delta!).toFixed(1) : null;
  const up = hasDelta && delta! >= 0;
  const good = hasDelta ? (up ? deltaGoodWhenUp : !deltaGoodWhenUp) : true;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {hasDelta && rounded !== null ? (
            <span
              className={`flex items-center gap-0.5 font-medium ${
                good ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {rounded}%
            </span>
          ) : (
            <span className="flex items-center gap-0.5 font-medium text-muted-foreground">
              <Minus className="h-3.5 w-3.5" /> --
            </span>
          )}
          <span className="text-muted-foreground">{caption}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardAnalytics = () => {
  const { transactions } = useData();
  const [filter, setFilter] = useState<FilterKey>("month");

  const inPeriod = (d: Date, which: "current" | "previous") => {
    if (filter === "all") return true;
    const now = new Date();
    if (filter === "month")
      return which === "current"
        ? isThisMonth(d)
        : isSameMonth(d, subMonths(now, 1));
    if (filter === "week")
      return which === "current"
        ? isThisWeek(d, { weekStartsOn: 1 })
        : isSameWeek(d, subWeeks(now, 1), { weekStartsOn: 1 });
    return which === "current" ? isToday(d) : isSameDay(d, subDays(now, 1));
  };

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => inPeriod(new Date(t.date), "current")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, filter]
  );

  const totals = useMemo(() => {
    const sum = (list: typeof transactions, paid: boolean) =>
      list.filter((t) => t.isPaid === paid).reduce((acc, t) => acc + t.amount, 0);
    return {
      revenue: sum(filteredTransactions, true),
      debt: sum(filteredTransactions, false),
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const prevTotals = useMemo(() => {
    if (filter === "all") return { revenue: 0, debt: 0, count: 0 };
    const prev = transactions.filter((t) => inPeriod(new Date(t.date), "previous"));
    const sum = (paid: boolean) =>
      prev.filter((t) => t.isPaid === paid).reduce((acc, t) => acc + t.amount, 0);
    return { revenue: sum(true), debt: sum(false), count: prev.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, filter]);

  const totalValue = totals.revenue + totals.debt;
  const collectionRate = totalValue > 0 ? (totals.revenue / totalValue) * 100 : 0;

  // Timeline data - sorted by real timestamp (label sort is unreliable)
  const timelineData = useMemo(() => {
    const map = new Map<
      string,
      { label: string; ts: number; revenue: number; debt: number }
    >();
    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      const key =
        filter === "month"
          ? format(date, "MMM d")
          : filter === "week"
            ? format(date, "EEE")
            : filter === "today"
              ? format(date, "HH:mm")
              : format(date, "MMM yyyy");
      if (!map.has(key)) map.set(key, { label: key, ts: date.getTime(), revenue: 0, debt: 0 });
      const entry = map.get(key)!;
      if (t.isPaid) entry.revenue += t.amount;
      else entry.debt += t.amount;
    });
    return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
  }, [filteredTransactions, filter]);

  const serviceData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      const key = t.serviceType || "Other";
      map.set(key, (map.get(key) ?? 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredTransactions]);

  const donutData = [
    { name: "Paid", value: totals.revenue },
    { name: "Unpaid", value: totals.debt },
  ].filter((d) => d.value > 0);

  const axisTick = { fill: "currentColor", opacity: 0.55, fontSize: 12 };
  const axisLine = { stroke: "currentColor", opacity: 0.15 };

  const emptyState = (
    <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-muted-foreground">
      No transactions recorded for this period
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Business performance overview &middot; {FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterKey)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={money(totals.revenue)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          iconClass="bg-emerald-100 dark:bg-emerald-950/60"
          delta={pctChange(totals.revenue, prevTotals.revenue)}
          deltaGoodWhenUp
          caption={PREV_LABELS[filter]}
        />
        <KpiCard
          title="Outstanding Debt"
          value={money(totals.debt)}
          icon={<Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />}
          iconClass="bg-red-100 dark:bg-red-950/60"
          delta={pctChange(totals.debt, prevTotals.debt)}
          deltaGoodWhenUp={false}
          caption={PREV_LABELS[filter]}
        />
        <KpiCard
          title="Transactions"
          value={totals.count.toLocaleString()}
          icon={<ReceiptText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          iconClass="bg-blue-100 dark:bg-blue-950/60"
          delta={pctChange(totals.count, prevTotals.count)}
          deltaGoodWhenUp
          caption={PREV_LABELS[filter]}
        />
        <KpiCard
          title="Collection Rate"
          value={`${collectionRate.toFixed(1)}%`}
          icon={<Gauge className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          iconClass="bg-violet-100 dark:bg-violet-950/60"
          delta={null}
          deltaGoodWhenUp
          caption={`${money(totalValue)} total billed`}
        />
      </div>

      {/* Timeline + Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue &amp; Debt Timeline</CardTitle>
            <CardDescription>Cash collected versus credit issued over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {timelineData.length === 0 ? (
              emptyState
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.revenue} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.revenue} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.debt} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.debt} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.12} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} axisLine={axisLine} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={compact} width={56} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={COLORS.revenue}
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="debt"
                    name="Debt"
                    stroke={COLORS.debt}
                    strokeWidth={2}
                    fill="url(#debtGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Split</CardTitle>
            <CardDescription>Paid vs outstanding share</CardDescription>
          </CardHeader>
          <CardContent className="relative h-[320px]">
            {donutData.length === 0 ? (
              emptyState
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="62%"
                      outerRadius="85%"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {donutData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.name === "Paid" ? COLORS.revenue : COLORS.debt}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
                  <span className="text-2xl font-bold tracking-tight">{collectionRate.toFixed(0)}%</span>
                  <span className="text-xs text-muted-foreground">collected</span>
                </div>
                <div className="absolute inset-x-0 bottom-1 flex justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS.revenue }} />
                    Paid {money(totals.revenue)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS.debt }} />
                    Unpaid {money(totals.debt)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Service */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Service</CardTitle>
          <CardDescription>Total billed per service type, top performers first</CardDescription>
        </CardHeader>
        <CardContent style={{ height: Math.max(260, serviceData.length * 44 + 40) }}>
          {serviceData.length === 0 ? (
            emptyState
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.12} strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={axisLine} tickLine={false} tickFormatter={compact} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.05 }} />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS.service} radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
