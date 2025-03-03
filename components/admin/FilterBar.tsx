'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { CodeFilters, CodeType } from '@/types/accessCode';

interface FilterBarProps {
  filters: CodeFilters;
  onFilterChange: (filters: CodeFilters) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as CodeFilters['status'],
    });
  };

  const handleTypeChange = (type: string) => {
    const currentTypes = [...filters.type];
    const typeValue = type as CodeType;
    
    if (currentTypes.includes(typeValue)) {
      onFilterChange({
        ...filters,
        type: currentTypes.filter(t => t !== typeValue),
      });
    } else {
      onFilterChange({
        ...filters,
        type: [...currentTypes, typeValue],
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status-filter" className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-2/3">
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            id="search-filter"
            type="text"
            placeholder="Search by code or email..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleTypeChange('ADMIN')}
            className={`bg-white border-gray-300 ${filters.type.includes('ADMIN') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Admin
          </Button>
          <Button
            variant="outline"
            onClick={() => handleTypeChange('REFERRAL')}
            className={`bg-white border-gray-300 ${filters.type.includes('REFERRAL') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Referral
          </Button>
          <Button
            variant="outline"
            onClick={() => handleTypeChange('TEMPORARY')}
            className={`bg-white border-gray-300 ${filters.type.includes('TEMPORARY') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Temporary
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onReset}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar; 