import React from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends { id: number | string }>({
  columns,
  data,
  loading,
  emptyText = "No records found.",
  onRowClick,
}: TableProps<T>) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
        }}
      >
        {/* Header */}
        <thead>
          <tr style={{ backgroundColor: "#1A3A8F" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.01em",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#9ca3af",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #e5e7eb",
                      borderTopColor: "#1A3A8F",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Loading...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#9ca3af",
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                style={{
                  backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb",
                  borderTop: "1px solid #f3f4f6",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (onRowClick)
                    e.currentTarget.style.backgroundColor = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    i % 2 === 0 ? "#ffffff" : "#f9fafb";
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "12px 16px",
                      color: "#1f2937",
                      verticalAlign: "middle",
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
