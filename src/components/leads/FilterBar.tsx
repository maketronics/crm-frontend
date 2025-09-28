import React, { useState } from 'react';
import { Button, Input, Select } from '../ui';
import type { LeadFilters, Lead, User } from '../../types';
import { TagInput } from './TagInput';

interface FilterBarProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
  users: User[];
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED', label: 'Closed' },
];

const sourceChannelOptions = [
  { value: '', label: 'All Sources' },
  { value: 'Website', label: 'Website' },
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Event', label: 'Event' },
  { value: 'Other', label: 'Other' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  users,
}) => {
  // Local state for form inputs before applying
  const [localFilters, setLocalFilters] = useState<LeadFilters>(filters);

  const userOptions = [
    { value: '', label: 'All Users' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  const updateLocalFilter = (key: keyof LeadFilters, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value,
    });
  };

  const applyFilters = () => {
    console.log('FilterBar: Applying filters:', localFilters);
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' &&
    (!Array.isArray(value) || value.length > 0)
  );

  const hasLocalChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
          <Button
            size="sm"
            onClick={applyFilters}
            disabled={!hasLocalChanges}
            className={hasLocalChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Input
          placeholder="Search contact or organization..."
          value={localFilters.search || ''}
          onChange={(e) => updateLocalFilter('search', e.target.value)}
        />

        <Select
          options={statusOptions}
          value={localFilters.status || ''}
          onChange={(e) => updateLocalFilter('status', e.target.value as Lead['status'])}
        />

        <Select
          options={userOptions}
          value={localFilters.assignedTo || ''}
          onChange={(e) => updateLocalFilter('assignedTo', e.target.value)}
        />

        <Select
          options={sourceChannelOptions}
          value={localFilters.sourceChannel || ''}
          onChange={(e) => updateLocalFilter('sourceChannel', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Input
          type="date"
          placeholder="From date"
          label="From Date"
          value={localFilters.startDate || ''}
          onChange={(e) => updateLocalFilter('startDate', e.target.value)}
        />

        <Input
          type="date"
          placeholder="To date"
          label="To Date"
          value={localFilters.endDate || ''}
          onChange={(e) => updateLocalFilter('endDate', e.target.value)}
        />

        <TagInput
          placeholder="Filter by labels..."
          value={localFilters.labels || []}
          onChange={(labels) => updateLocalFilter('labels', labels)}
        />
      </div>
    </div>
  );
};