// src/components/SimpleAlert.tsx
'use client';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export function Alert({ 
  variant = 'default', 
  children, 
  className = '' 
}: AlertProps) {
  const baseStyles = "p-4 rounded-lg";
  const variantStyles = variant === 'destructive' 
    ? "bg-red-50 text-red-700 border border-red-200" 
    : "bg-blue-50 text-blue-700 border border-blue-200";

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}