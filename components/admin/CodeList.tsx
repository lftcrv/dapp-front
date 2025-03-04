import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AccessCode, PaginationState, SortOptions } from '../../types/accessCode';
import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons';

interface CodeListProps {
  codes: AccessCode[];
  onDisable: (id: string) => Promise<void>;
  onRenew: (id: string) => Promise<void>;
  onViewDetails: (id: string) => void;
  isLoading?: boolean;
  sorting?: SortOptions;
  onSortChange?: (field: string) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const CodeList: React.FC<CodeListProps> = ({
  codes,
  onDisable,
  onRenew,
  onViewDetails,
  isLoading = false,
  sorting,
  onSortChange,
  pagination,
  onPageChange,
  onPageSizeChange,
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

  const renderSortIcon = (field: string) => {
    if (!sorting || sorting.field !== field) return null;
    return sorting.direction === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
      <ChevronDownIcon className="h-4 w-4 ml-1" />;
  };

  const handleSort = (field: string) => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  const renderSortableHeader = (field: string, label: string) => {
    return (
      <div 
        className={`flex items-center ${onSortChange ? 'cursor-pointer hover:text-primary' : ''}`}
        onClick={() => onSortChange && handleSort(field)}
      >
        {label}
        {renderSortIcon(field)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Access Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (codes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Access Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            No access codes found. Try adjusting your filters or generate a new code.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{renderSortableHeader('code', 'Code')}</TableHead>
              <TableHead>{renderSortableHeader('type', 'Type')}</TableHead>
              <TableHead>{renderSortableHeader('createdAt', 'Created')}</TableHead>
              <TableHead>{renderSortableHeader('expiresAt', 'Expires')}</TableHead>
              <TableHead>{renderSortableHeader('currentUses', 'Uses')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => (
              <TableRow key={code.id}>
                <TableCell className="font-mono">{code.code}</TableCell>
                <TableCell>
                  <Badge variant="outline">{code.type}</Badge>
                </TableCell>
                <TableCell>{formatDate(code.createdAt)}</TableCell>
                <TableCell>{formatDate(code.expiresAt)}</TableCell>
                <TableCell>
                  {code.currentUses}{code.maxUses ? `/${code.maxUses}` : ''}
                </TableCell>
                <TableCell>{getStatusBadge(code)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(code.id)}
                    >
                      Details
                    </Button>
                    {code.isActive ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDisable(code.id)}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onRenew(code.id)}
                      >
                        Renew
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {codes.length} of {pagination.total} codes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize) || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
            {onPageSizeChange && (
              <select
                className="ml-2 p-1 text-sm border rounded"
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeList; 