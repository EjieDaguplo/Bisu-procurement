import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "yellow" | "purple" | "green" | "red";
  subtitle?: string;
}

const palette = {
  blue: { bg: "#eff6ff", icon: "#1A3A8F", border: "#bfdbfe" },
  yellow: { bg: "#fffbeb", icon: "#E8A000", border: "#fde68a" },
  purple: { bg: "#f5f3ff", icon: "#5B2D8E", border: "#ddd6fe" },
  green: { bg: "#f0fdf4", icon: "#15803d", border: "#bbf7d0" },
  red: { bg: "#fef2f2", icon: "#b91c1c", border: "#fecaca" },
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatsCardProps) => {
  const c = palette[color];
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        border: `1px solid ${c.border}`,
        boxShadow: "0 2px 12px rgba(26,58,143,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: c.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={24} color={c.icon} />
      </div>
      <div>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            fontWeight: 500,
            margin: "0 0 2px 0",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1f2937",
            margin: 0,
          }}
        >
          {value}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#9ca3af",
              margin: "2px 0 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
