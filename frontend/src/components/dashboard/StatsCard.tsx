import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "yellow" | "purple" | "green" | "red";
  subtitle?: string;
}

const colors = {
  blue: {
    bg: "bg-bisu-blue-light/10",
    icon: "text-bisu-blue-DEFAULT",
    border: "border-bisu-blue-light/30",
  },
  yellow: {
    bg: "bg-bisu-yellow-light/20",
    icon: "text-bisu-gold",
    border: "border-bisu-yellow-DEFAULT/30",
  },
  purple: {
    bg: "bg-bisu-purple-light/10",
    icon: "text-bisu-purple-DEFAULT",
    border: "border-bisu-purple-light/30",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-200",
  },
  red: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-200" },
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatsCardProps) => {
  const c = colors[color];
  return (
    <div
      className={`bg-white rounded-xl p-5 border shadow-card flex items-center gap-4 ${c.border}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} flex-shrink-0`}
      >
        <Icon size={24} className={c.icon} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
