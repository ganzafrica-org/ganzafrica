import React from "react";

export function KanbanBoard({ columns, onItemMove, onItemClick, className }: any) {
  return (
    <div className={`flex gap-6 overflow-x-auto pb-4 ${className}`}>
      {columns.map((column: any) => (
        <KanbanColumn key={column.id} title={column.title} color={column.color}>
          {column.items.map((item: any) => (
            <KanbanItem key={item.id} onClick={() => onItemClick(item)}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.title}</span>
                  {item.priority && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : item.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
                {item.subtitle && <span className="text-xs text-slate-500">{item.subtitle}</span>}
                {item.progress !== undefined && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </KanbanItem>
          ))}
        </KanbanColumn>
      ))}
    </div>
  );
}

export function KanbanColumn({ title, children, color }: any) {
  return (
    <div
      className="flex flex-col gap-4 min-w-[300px] bg-slate-100/50 p-4 rounded-lg border-t-4"
      style={{ borderTopColor: color }}
    >
      <h3 className="font-semibold text-slate-700 mb-2 flex items-center justify-between">
        {title}
        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
          {React.Children.count(children)}
        </span>
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function KanbanItem({ children, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-md shadow-sm border border-slate-200 hover:border-green-500 transition-colors cursor-pointer"
    >
      {children}
    </div>
  );
}
