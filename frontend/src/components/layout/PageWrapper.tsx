import React from "react";

interface PageWrapperProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageWrapper = ({ title, action, children }: PageWrapperProps) => (
  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
    {/* Header bar */}
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-xm">
      {/*Title wrapped with blue border + yellow text */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg px-4 py-1.5 Border border-bisu-blue bg-bisu-blue">
          <h2 className="text-lg font-extrabold text-bisu-yellow tracking-tight m-0">
            {title}
          </h2>
        </div>
      </div>

      {action && <div>{action}</div>}
    </div>

    {/* Page content */}
    <div className="flex-1 p-6 overflow-auto">{children}</div>
  </div>
);
