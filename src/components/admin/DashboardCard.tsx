// path: src/components/admin/DashboardCard.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  // 👇 simplified type: only allow icon as component (not ReactNode)
  icon?: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon, // rename for JSX usage
  subtitle,
  trend,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  className,
  ...rest
}) => {
  return (
    <Card
      className={`rounded-2xl shadow-sm border-gray-200 ${className || ""}`}
      {...rest}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`${iconBgColor} ${iconColor} p-3 rounded-xl flex items-center justify-center`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
