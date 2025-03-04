import React from 'react';
import { AccessCodeActivity } from '../../types/accessCode';
import { 
  CalendarIcon, 
  PersonIcon, 
  InfoCircledIcon,
  PlusCircledIcon,
  MinusCircledIcon,
  UpdateIcon,
  CheckCircledIcon
} from '@radix-ui/react-icons';

interface ActivityLogProps {
  activities: AccessCodeActivity[];
  isLoading?: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  isLoading = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionLabel = (action: AccessCodeActivity['action']) => {
    switch (action) {
      case 'CREATED':
        return 'Created';
      case 'USED':
        return 'Used';
      case 'DISABLED':
        return 'Disabled';
      case 'RENEWED':
        return 'Renewed';
      default:
        return action;
    }
  };

  const getActionColor = (action: AccessCodeActivity['action']) => {
    switch (action) {
      case 'CREATED':
        return 'text-green-600';
      case 'USED':
        return 'text-blue-600';
      case 'DISABLED':
        return 'text-red-600';
      case 'RENEWED':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActionIcon = (action: AccessCodeActivity['action']) => {
    switch (action) {
      case 'CREATED':
        return <PlusCircledIcon className="h-4 w-4" />;
      case 'USED':
        return <CheckCircledIcon className="h-4 w-4" />;
      case 'DISABLED':
        return <MinusCircledIcon className="h-4 w-4" />;
      case 'RENEWED':
        return <UpdateIcon className="h-4 w-4" />;
      default:
        return <InfoCircledIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActionColor(activity.action).replace('text-', 'bg-').replace('600', '100')}`}>
            <span className={getActionColor(activity.action)}>
              {getActionIcon(activity.action)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${getActionColor(activity.action)}`}>
                {getActionLabel(activity.action)}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDate(activity.timestamp)}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-gray-700">
              Code: {activity.code}
            </p>
            {activity.userId && (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <PersonIcon className="h-3 w-3" />
                {activity.userId}
              </p>
            )}
            {activity.details && (
              <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                <InfoCircledIcon className="h-3 w-3" />
                {activity.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog; 