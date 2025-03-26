
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface ProjectHeaderProps {
  title: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title,
  description,
  status,
  startDate,
  endDate
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
      </div>
      <CardDescription className="text-base">{description}</CardDescription>
      
      <div className="flex items-center text-sm text-muted-foreground">
        <span className="mr-2">
          {startDate ? formatDate(startDate) : 'No start date'}
        </span>
        <span className="mx-2">→</span>
        <span>
          {endDate ? formatDate(endDate) : 'No end date'}
        </span>
      </div>
    </div>
  );
};
