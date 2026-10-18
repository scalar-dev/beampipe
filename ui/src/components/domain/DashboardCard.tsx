import { ReactNode } from "react";
import { cn } from "cn";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardCard = ({
  title,
  action,
  span = 1,
  className,
  contentClassName,
  children,
  ...otherProps
}: {
  title?: ReactNode;
  action?: ReactNode;
  span?: 1 | 2;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  "data-cy"?: string;
}) => (
  <Card
    className={cn("h-[28rem]", span === 2 && "md:col-span-2", className)}
    {...otherProps}
  >
    {(title || action) && (
      <CardHeader>
        {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
    )}
    <CardContent className={cn("flex min-h-0 flex-1 flex-col overflow-auto", contentClassName)}>
      {children}
    </CardContent>
  </Card>
);
