import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function Loading({ fullScreen = false, text = 'Loading...', className = '' }: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-[#006e2f]" />
      <p className="text-sm font-medium animate-pulse">{text}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">{content}</div>;
  }

  return <div className="w-full py-12 flex items-center justify-center">{content}</div>;
}
