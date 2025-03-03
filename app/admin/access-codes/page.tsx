'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '../../../hooks/use-toast';
import DashboardLayout from '../../../components/admin/DashboardLayout';
import StatsGrid from '../../../components/admin/StatsGrid';
import CodeGenerator from '../../../components/admin/CodeGenerator';
import CodeList from '../../../components/admin/CodeList';
import FilterBar from '../../../components/admin/FilterBar';
import ActivityLog from '../../../components/admin/ActivityLog';
import CodeDetailsModal from '../../../components/admin/CodeDetailsModal';
import {
  generateAccessCode,
  getAccessCodeStats,
  getAccessCodes,
  disableAccessCode,
  renewAccessCode,
  getRecentActivities,
} from '../../../actions/access-codes';
import {
  AccessCode,
  AccessCodeActivity,
  AccessCodeDashboard,
  CodeFilters,
  GenerationParams,
  SortOptions,
  PaginationState,
} from '../../../types/accessCode';
import { Button } from '../../../components/ui/button';
import {
  ReloadIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';

// Dashboard data interface to match the structure we need for the UI
interface DashboardUIData {
  stats: AccessCodeDashboard['stats'];
  recentActivity: AccessCodeActivity[];
  byType: Record<string, number>;
  usageHistory: Array<{ date: string; count: number }>;
}

export default function AccessCodeDashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasEndpointWarnings, setHasEndpointWarnings] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardUIData>({
    stats: {
      totalCodes: 0,
      activeCodes: 0,
      usedCodes: 0,
      expiringCodes: 0,
    },
    recentActivity: [],
    byType: {},
    usageHistory: [],
  });

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [filters, setFilters] = useState<CodeFilters>({
    status: 'all',
    type: [],
    search: '',
  });

  const [sorting, setSorting] = useState<SortOptions>({
    field: 'createdAt',
    direction: 'desc',
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal state
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setHasEndpointWarnings(false);

      let hasWarnings = false;

      // Fetch stats from the real endpoint
      console.log('Fetching dashboard stats...');
      const stats = await getAccessCodeStats();
      console.log('Fetched stats:', stats);

      // Check if we got empty stats (which might indicate a 404)
      if (
        stats.totalCodes === 0 &&
        stats.activeCodes === 0 &&
        stats.usedCodes === 0 &&
        Object.keys(stats.byType).length === 0
      ) {
        console.warn('Stats endpoint might be missing - got empty data');
        hasWarnings = true;
      }

      // Fetch recent activities from the real endpoint
      console.log('Fetching recent activities...');
      const activities = await getRecentActivities(5);
      console.log('Fetched activities:', activities);

      if (activities.length === 0) {
        console.warn('Activities endpoint might be missing - got empty data');
        hasWarnings = true;
      }

      // Fetch codes with filters from the real endpoint
      console.log('Fetching access codes with filters:', filters);
      const codesResponse = await getAccessCodes(
        {
          status: filters.status !== 'all' ? filters.status : undefined,
          type: filters.type.length > 0 ? filters.type : undefined,
          search: filters.search || undefined,
        },
        {
          field: sorting.field,
          direction: sorting.direction,
        },
        {
          page: pagination.page,
          pageSize: pagination.pageSize,
        },
      );
      console.log('Fetched codes:', codesResponse);

      if (
        codesResponse.codes.length === 0 &&
        pagination.page === 1 &&
        !filters.search
      ) {
        console.warn('Codes endpoint might be missing - got empty data');
        hasWarnings = true;
      }

      setHasEndpointWarnings(hasWarnings);

      // Update state with real data
      setDashboardData({
        stats: {
          totalCodes: stats.totalCodes,
          activeCodes: stats.activeCodes,
          usedCodes: stats.usedCodes,
          expiringCodes: stats.expiringCodes,
        },
        recentActivity: activities,
        byType: stats.byType || {},
        usageHistory: stats.usageHistory || [],
      });

      setCodes(codesResponse.codes);
      setPagination((prev) => ({ ...prev, total: codesResponse.total }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsError(true);
      toast({
        title: 'Error',
        description:
          'Failed to load dashboard data. Please ensure the backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters, sorting, pagination.page, pagination.pageSize]);

  const handleGenerateCode = async (params: GenerationParams) => {
    try {
      setIsGenerating(true);
      console.log('Generating access code with params:', params);
      const result = await generateAccessCode(params);
      
      // Check if we received an array of codes (batch generation)
      if (Array.isArray(result)) {
        console.log(`Generated ${result.length} new codes`);
        
        toast({
          title: 'Success',
          description: `${result.length} access codes generated successfully`,
        });
      } else {
        // Single code generation
        console.log('Generated new code:', result);
        
        toast({
          title: 'Success',
          description: `Access code generated: ${result.code}`,
        });
      }

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Error',
        description:
          'Failed to generate access code. Please check backend connection.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDisableCode = async (id: string) => {
    try {
      console.log('Disabling access code:', id);
      await disableAccessCode(id);

      toast({
        title: 'Success',
        description: 'Access code disabled successfully',
      });

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error disabling code:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable access code',
        variant: 'destructive',
      });
    }
  };

  const handleRenewCode = async (id: string) => {
    try {
      console.log('Renewing access code:', id);
      await renewAccessCode(id, {});

      toast({
        title: 'Success',
        description: 'Access code renewed successfully',
      });

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error renewing code:', error);
      toast({
        title: 'Error',
        description: 'Failed to renew access code',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedCodeId(id);
    setIsDetailsModalOpen(true);
  };

  const handleFilterChange = (newFilters: CodeFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      type: [],
      search: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field: string) => {
    setSorting((prev) => {
      // Only allow sorting by valid fields
      const validField = [
        'createdAt',
        'expiresAt',
        'currentUses',
        'type',
      ].includes(field)
        ? (field as SortOptions['field'])
        : prev.field;

      return {
        field: validField,
        direction:
          prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
      };
    });
  };

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">
        Unable to load dashboard data
      </h3>
      <p className="text-red-600 mb-4">
        There was a problem connecting to the backend service. Please check that
        the server is running.
      </p>
      <Button
        variant="outline"
        onClick={fetchDashboardData}
        className="bg-white border-red-300 text-red-700 hover:bg-red-50"
      >
        <ReloadIcon className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );

  const renderEndpointWarning = () => (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
      <div className="flex gap-3">
        <InfoCircledIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800 mb-1">
            Some API endpoints may be missing
          </h3>
          <p className="text-amber-700 text-sm">
            The dashboard is running with limited functionality because some API
            endpoints were not found. You can still generate and manage access
            codes, but some statistics or features may be unavailable.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Access Code Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {!isLoading &&
                !isError &&
                `${codes.length} of ${pagination.total} codes`}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              {isLoading ? (
                <ReloadIcon className="h-3 w-3 animate-spin" />
              ) : (
                <ReloadIcon className="h-3 w-3" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {hasEndpointWarnings && renderEndpointWarning()}

        {isError ? (
          renderErrorState()
        ) : (
          <>
            <StatsGrid stats={dashboardData.stats} isLoading={isLoading} />

            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">
                    Generate New Code
                  </h2>
                </div>
                <div className="p-5">
                  <CodeGenerator
                    onGenerate={handleGenerateCode}
                    isLoading={isGenerating}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-800">
                    Recent Activity
                  </h2>
                  <span className="text-xs text-gray-500">
                    {dashboardData.recentActivity.length > 0
                      ? `Last updated: ${new Date().toLocaleTimeString()}`
                      : 'No recent activity'}
                  </span>
                </div>
                <div className="p-5">
                  <ActivityLog
                    activities={dashboardData.recentActivity}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">
                  Access Codes
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Page {pagination.page} of{' '}
                    {Math.ceil(pagination.total / pagination.pageSize) || 1}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <FilterBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />

                <div className="mt-4">
                  <CodeList
                    codes={codes}
                    onDisable={handleDisableCode}
                    onRenew={handleRenewCode}
                    onViewDetails={handleViewDetails}
                    isLoading={isLoading}
                    sorting={sorting}
                    onSortChange={handleSortChange}
                    pagination={pagination}
                    onPageChange={(page: number) =>
                      setPagination((prev) => ({ ...prev, page }))
                    }
                    onPageSizeChange={(pageSize: number) =>
                      setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
                    }
                  />
                </div>
              </div>
            </div>

            <CodeDetailsModal
              codeId={selectedCodeId}
              isOpen={isDetailsModalOpen}
              onOpenChange={setIsDetailsModalOpen}
              onCodeUpdated={fetchDashboardData}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
