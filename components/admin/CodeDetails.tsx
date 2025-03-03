import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AccessCode, AccessCodeActivity } from '../../types/accessCode';

interface CodeDetailsProps {
  accessCode: AccessCode;
  activities: AccessCodeActivity[];
  onDisable: (id: string) => Promise<void>;
  onRenew: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const CodeDetails: React.FC<CodeDetailsProps> = ({
  accessCode,
  activities,
  onDisable,
  onRenew,
  isLoading = false,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (code: AccessCode) => {
    if (!code.isActive) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return <Badge variant="outline">Expired</Badge>;
    }
    
    if (code.maxUses && code.currentUses >= code.maxUses) {
      return <Badge variant="outline">Fully Used</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Access Code Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg bg-muted/50 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Access Code Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Code</h3>
              <p className="font-mono text-xl">{accessCode.code}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Status</h3>
              <div className="mt-1">{getStatusBadge(accessCode)}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <p>{accessCode.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p>{formatDate(accessCode.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Expires</h3>
              <p>{formatDate(accessCode.expiresAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Uses</h3>
              <p>
                {accessCode.currentUses}
                {accessCode.maxUses ? ` / ${accessCode.maxUses}` : ' (unlimited)'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
              <p>{accessCode.createdBy || 'System'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {accessCode.isActive ? (
              <Button
                variant="destructive"
                onClick={() => onDisable(accessCode.id)}
              >
                Disable Code
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => onRenew(accessCode.id)}
              >
                Renew Code
              </Button>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Activity History</h3>
            {activities.length === 0 ? (
              <p className="text-muted-foreground">No activity recorded</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {activity.action}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    {activity.userId && (
                      <p className="mt-1 text-sm">
                        User: {activity.userId}
                      </p>
                    )}
                    {activity.details && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activity.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeDetails; 