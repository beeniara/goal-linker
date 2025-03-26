
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertMessageProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string | null | React.ReactNode;
  className?: string;
}

export function AlertMessageDisplay({ type, title, message, className = 'mb-4' }: AlertMessageProps) {
  if (!message) return null;
  
  let variant: "default" | "destructive" | "warning" | "success" | "info" | null = null;
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
      variant = "warning";
      icon = <AlertTriangle className="h-4 w-4" />;
      defaultTitle = 'Warning';
      break;
    case 'success':
      variant = "success";
      icon = <AlertCircle className="h-4 w-4" />;
      defaultTitle = 'Success';
      break;
    case 'info':
      variant = "info";
      icon = <Info className="h-4 w-4" />;
      defaultTitle = 'Info';
      break;
  }
  
  return (
    <Alert variant={variant} className={customClasses}>
      {icon}
      <AlertTitle>{title || defaultTitle}</AlertTitle>
      <AlertDescription>
        {typeof message === 'string' 
          ? message.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < message.split('\n').length - 1 && <br />}
              </span>
            ))
          : message
        }
      </AlertDescription>
    </Alert>
  );
}
