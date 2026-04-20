//pageWrapper.tsx
import React from "react";

interface PageWrapperProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}
export const PageWrapper = ({ title, action, children }: PageWrapperProps) => (
  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
      <h2 className="text-xl font-bold text-bisu-blue-DEFAULT">{title}</h2>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1 p-6 overflow-auto">{children}</div>
  </div>
);
