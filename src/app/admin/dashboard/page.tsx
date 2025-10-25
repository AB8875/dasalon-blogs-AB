"use client";

import { useEffect, useState } from "react";
import { FileText, FolderTree, Users, Eye } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/mongodb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ObjectId } from "mongodb";

interface DashboardStats {
  totalPosts: number;
  totalCategories: number;
  totalUsers: number;
  totalViews: number;
}

// Placeholder chart data
const chartData = [
  { name: "Jan", views: 4000 },
  { name: "Feb", views: 3000 },
  { name: "Mar", views: 5000 },
  { name: "Apr", views: 4500 },
  { name: "May", views: 6000 },
  { name: "Jun", views: 5500 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalViews: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard-stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className=" text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's your blog overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          trend={{ value: "12%", isPositive: true }}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <DashboardCard
          title="Categories"
          value={stats.totalCategories}
          icon={FolderTree}
          trend={{ value: "5%", isPositive: true }}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <DashboardCard
          title="Team Members"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: "2", isPositive: true }}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <DashboardCard
          title="Total Views"
          value={stats.totalViews?.toLocaleString()}
          icon={Eye}
          trend={{ value: "8%", isPositive: true }}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Views Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
