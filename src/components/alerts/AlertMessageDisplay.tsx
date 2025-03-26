
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertMessageProps {
  type: 'error' | 'warning' | 'info';
  title?: string;
  message: string | null;
  className?: string;
}

export function AlertMessageDisplay({ type, title, message, className = 'mb-4' }: AlertMessageProps) {
  if (!message) return null;
  
  let variant: "default" | "destructive" | null = null;
  let customClasses = className;
  let icon = null;
  let defaultTitle = '';
  
  switch (type) {
    case 'error':
      variant = "destructive";
      icon = <AlertCircle className="h-4 w-4" />;
      defaultTitle = 'Error';
      break;
    case 'warning':
      customClasses += ' border-yellow-500 bg-yellow-50 text-yellow-800';
      icon = <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      defaultTitle = 'Warning';
      break;
    case 'info':
      customClasses += ' border-blue-500 bg-blue-50 text-blue-800';
      icon = <Info className="h-4 w-4 text-blue-600" />;
      defaultTitle = 'Info';
      break;
  }
  
  return (
    <Alert variant={variant} className={customClasses}>
      {icon}
      <AlertTitle>{title || defaultTitle}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
