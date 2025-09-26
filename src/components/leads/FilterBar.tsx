import React from 'react';
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
  const userOptions = [
    { value: '', label: 'All Users' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  const updateFilter = (key: keyof LeadFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' &&
    (!Array.isArray(value) || value.length > 0)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Input
          placeholder="Search contact or organization..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
        />

        <Select
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value as Lead['status'])}
        />

        <Select
          options={userOptions}
          value={filters.assignedTo || ''}
          onChange={(e) => updateFilter('assignedTo', e.target.value)}
        />

        <Select
          options={sourceChannelOptions}
          value={filters.sourceChannel || ''}
          onChange={(e) => updateFilter('sourceChannel', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Input
          type="date"
          placeholder="From date"
          value={filters.startDate || ''}
          onChange={(e) => updateFilter('startDate', e.target.value)}
        />

        <Input
          type="date"
          placeholder="To date"
          value={filters.endDate || ''}
          onChange={(e) => updateFilter('endDate', e.target.value)}
        />

        <TagInput
          placeholder="Filter by labels..."
          value={filters.labels || []}
          onChange={(labels) => updateFilter('labels', labels)}
        />
      </div>
    </div>
  );
};