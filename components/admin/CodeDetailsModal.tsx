import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AccessCode, AccessCodeActivity } from '../../types/accessCode';
import { getAccessCodeById, disableAccessCode, renewAccessCode } from '../../actions/access-codes';
import { useToast } from '../../hooks/use-toast';

interface CodeDetailsModalProps {
  codeId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeUpdated: () => void;
}

const CodeDetailsModal: React.FC<CodeDetailsModalProps> = ({
  codeId,
  isOpen,
  onOpenChange,
  onCodeUpdated,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [accessCode, setAccessCode] = useState<AccessCode | null>(null);
  const [activities, setActivities] = useState<AccessCodeActivity[]>([]);

  useEffect(() => {
    if (isOpen && codeId) {
      fetchCodeDetails();
    } else {
      setAccessCode(null);
      setActivities([]);
    }
  }, [isOpen, codeId]);

  const fetchCodeDetails = async () => {
    if (!codeId) return;
    
    try {
      setIsLoading(true);
      const data = await getAccessCodeById(codeId);
      setAccessCode(data.accessCode);
      setActivities(data.activities);
    } catch (error) {
      console.error('Error fetching code details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load access code details',
        variant: 'destructive',
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableCode = async () => {
    if (!accessCode) return;
    
    try {
      await disableAccessCode(accessCode.id);
      
      toast({
        title: 'Success',
        description: 'Access code disabled',
      });
      
      // Refresh data
      fetchCodeDetails();
      onCodeUpdated();
    } catch (error) {
      console.error('Error disabling code:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable access code',
        variant: 'destructive',
      });
    }
  };

  const handleRenewCode = async () => {
    if (!accessCode) return;
    
    try {
      await renewAccessCode(accessCode.id, {});
      
      toast({
        title: 'Success',
        description: 'Access code renewed',
      });
      
      // Refresh data
      fetchCodeDetails();
      onCodeUpdated();
    } catch (error) {
      console.error('Error renewing code:', error);
      toast({
        title: 'Error',
        description: 'Failed to renew access code',
        variant: 'destructive',
      });
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Access Code Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="h-64 rounded-lg bg-muted/50 animate-pulse" />
        ) : accessCode ? (
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
                  onClick={handleDisableCode}
                >
                  Disable Code
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleRenewCode}
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
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Access code not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CodeDetailsModal; 