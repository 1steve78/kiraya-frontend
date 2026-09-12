import React, { ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`w-full py-16 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center mb-4 text-slate-400">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6 text-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
