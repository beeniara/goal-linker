
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning: 
          "border-orange-500/50 text-orange-500 dark:border-orange-500 [&>svg]:text-orange-500",
        success: 
          "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500",
        info: 
          "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
    icon?: React.ReactNode;
  }

const Alert = React.forwardRef<
  HTMLDivElement,
  AlertProps
>(({ className, variant, icon, ...props }, ref) => {
  // Default icons based on variant
  const defaultIcon = React.useMemo(() => {
    if (!icon) {
      switch (variant) {
        case "destructive":
          return <AlertCircle className="h-4 w-4" />;
        case "warning":
          return <AlertTriangle className="h-4 w-4" />;
        case "success":
          return <CheckCircle className="h-4 w-4" />;
        case "info":
          return <Info className="h-4 w-4" />;
        default:
          return null;
      }
    }
    return icon;
  }, [icon, variant]);

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {defaultIcon}
      {props.children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
