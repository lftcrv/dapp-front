'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '../../../../hooks/use-toast';
import DashboardLayout from '../../../../components/admin/DashboardLayout';
import AnalyticsCharts from '../../../../components/admin/AnalyticsCharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { getAccessCodeStats } from '../../../../actions/access-codes';
import { Button } from '../../../../components/ui/button';
import { ReloadIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';

export default function AccessCodeAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hasEndpointWarnings, setHasEndpointWarnings] = useState(false);
  const [stats, setStats] = useState<{
    totalCodes: number;
    activeCodes: number;
    usedCodes: number;
    expiringCodes: number;
    byType: Record<string, number>;
    usageHistory: Array<{ date: string; count: number }>;
  }>({
    totalCodes: 0,
    activeCodes: 0,
    usedCodes: 0,
    expiringCodes: 0,
    byType: {},
    usageHistory: []
  });

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setHasEndpointWarnings(false);
      
      // Fetch stats from the real endpoint
      console.log('Fetching analytics data...');
      const statsData = await getAccessCodeStats();
      console.log('Fetched analytics data:', statsData);
      
      // Check if we got empty stats (which might indicate a 404)
      if (statsData.totalCodes === 0 && 
          statsData.activeCodes === 0 && 
          statsData.usedCodes === 0 && 
          Object.keys(statsData.byType).length === 0) {
        console.warn('Stats endpoint might be missing - got empty data');
        setHasEndpointWarnings(true);
      }
      
      // Set the complete stats data
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setIsError(true);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please ensure the backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">Unable to load analytics data</h3>
      <p className="text-red-600 mb-4">
        There was a problem connecting to the backend service. Please check that the server is running.
      </p>
      <Button 
        variant="outline" 
        onClick={fetchAnalyticsData}
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
          <h3 className="font-medium text-amber-800 mb-1">Analytics data may be incomplete</h3>
          <p className="text-amber-700 text-sm">
            The analytics page is running with limited functionality because the stats endpoint returned empty data. 
            This could be because the endpoint is not available or there is no data to display yet.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Code Analytics</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? <ReloadIcon className="h-3 w-3 animate-spin" /> : <ReloadIcon className="h-3 w-3" />}
            Refresh Data
          </Button>
        </div>
        
        {hasEndpointWarnings && renderEndpointWarning()}
        
        {isError ? (
          renderErrorState()
        ) : (
          <>
            {/* Main stats cards */}
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoading ? 
                      <div className="h-8 w-16 animate-pulse bg-gray-200 rounded" /> : 
                      stats.totalCodes.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {isLoading ? 
                      <div className="h-8 w-16 animate-pulse bg-gray-200 rounded" /> : 
                      stats.activeCodes.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Used Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? 
                      <div className="h-8 w-16 animate-pulse bg-gray-200 rounded" /> : 
                      stats.usedCodes.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Expiring Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {isLoading ? 
                      <div className="h-8 w-16 animate-pulse bg-gray-200 rounded" /> : 
                      stats.expiringCodes.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Type distribution cards */}
            {Object.keys(stats.byType).length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Code Distribution by Type</h2>
                </div>
                <div className="p-5">
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse bg-gray-200 rounded-lg"></div>
                      ))
                    ) : (
                      Object.entries(stats.byType).map(([type, count]) => (
                        <Card key={type} className="border border-gray-200 bg-gray-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">{type} Codes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{count}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {((count / stats.totalCodes) * 100).toFixed(1)}% of total
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Charts */}
            {stats.usageHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Usage Trends</h2>
                </div>
                <div className="p-5">
                  <AnalyticsCharts
                    usageHistory={stats.usageHistory}
                    typeDistribution={stats.byType}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
            
            {/* Insights */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Usage Insights</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Average Uses Per Code:</span>
                      <span className="font-bold text-gray-900">
                        {isLoading ? 
                          <div className="h-6 w-12 animate-pulse bg-gray-200 rounded" /> : 
                          (stats.usedCodes / (stats.totalCodes || 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Active Rate:</span>
                      <span className="font-bold text-gray-900">
                        {isLoading ? 
                          <div className="h-6 w-16 animate-pulse bg-gray-200 rounded" /> : 
                          `${((stats.activeCodes / (stats.totalCodes || 1)) * 100).toFixed(1)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Most Active Day:</span>
                      <span className="font-bold text-gray-900">
                        {isLoading ? 
                          <div className="h-6 w-24 animate-pulse bg-gray-200 rounded" /> : 
                          stats.usageHistory.length > 0 ? 
                            new Date(stats.usageHistory.reduce((a, b) => a.count > b.count ? a : b).date).toLocaleDateString() : 
                            'No data'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Recommendations</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <p className="text-gray-600">Based on your usage patterns:</p>
                    <ul className="space-y-3">
                      {!isLoading && Object.entries(stats.byType).length > 0 && (
                        <li className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                            <span className="text-blue-600 text-xs">1</span>
                          </div>
                          <span>
                            Consider generating more {
                              Object.entries(stats.byType)
                                .sort((a, b) => a[1] - b[1])[0]?.[0] || 'TEMPORARY'
                            } codes
                          </span>
                        </li>
                      )}
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 text-xs">2</span>
                        </div>
                        <span>Review expired codes to maintain security</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 text-xs">3</span>
                        </div>
                        <span>Monitor usage patterns for unusual activity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 