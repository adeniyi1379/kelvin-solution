import React, { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { format, isThisWeek, isThisMonth, isToday, parseISO } from "date-fns";

const FILTERS = [
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Today", value: "today" },
];

const DashboardAnalytics = () => {
  const { transactions } = useData();
  const [filter, setFilter] = useState("month");

  // Filter transactions based on dropdown
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      if (filter === "month") return isThisMonth(date);
      if (filter === "week") return isThisWeek(date, { weekStartsOn: 1 });
      if (filter === "today") return isToday(date);
      return true;
    });
  }, [transactions, filter]);

  // Calculate totals
  const totalTransactions = filteredTransactions.length;
  const totalDebt = filteredTransactions
    .filter((t) => !t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = filteredTransactions
    .filter((t) => t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  // Timeline chart data
  const timelineData = useMemo(() => {
    const groupBy = filter === "month" ? "date" : "day";
    const map = new Map();
    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      let key = "";
      if (filter === "month") key = format(date, "MMM d");
      if (filter === "week") key = format(date, "EEE");
      if (filter === "today") key = format(date, "HH:mm");
      if (!map.has(key)) map.set(key, { label: key, revenue: 0, debt: 0 });
      if (t.isPaid) map.get(key).revenue += t.amount;
      else map.get(key).debt += t.amount;
    });
    // Sort by date
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  }, [filteredTransactions, filter]);

  // Product/Service revenue bar chart
  const barData = useMemo(() => {
    const map = new Map();
    filteredTransactions.forEach((t) => {
      const key = t.serviceType || "Other";
      if (!map.has(key)) map.set(key, { name: key, revenue: 0 });
      if (t.isPaid) map.get(key).revenue += t.amount;
    });
    return Array.from(map.values());
  }, [filteredTransactions]);

  return (
    <div>
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-none">
          <CardContent className="py-6 flex flex-col items-center">
            <span className="text-gray-500">Total Revenue</span>
            <span className="text-2xl font-bold text-green-600">#{totalRevenue.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardContent className="py-6 flex flex-col items-center">
            <span className="text-gray-500">Total Debt</span>
            <span className="text-2xl font-bold text-red-600">#{totalDebt.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardContent className="py-6 flex flex-col items-center">
            <span className="text-gray-500">Total Transactions</span>
            <span className="text-2xl font-bold">{totalTransactions.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Dropdown */}
      <div className="flex justify-end mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded shadow mb-8 p-4">
        <h3 className="font-semibold mb-2">Revenue & Debt Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" />
            <Line type="monotone" dataKey="debt" stroke="#ef4444" name="Debt" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product/Service Bar Chart */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Revenue by Service</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardAnalytics;