import React, { useState } from 'react';
import { Labels } from '../../types/lead.types';
import { Select, Input } from '../ui';

interface FilterBarProps {
  onFilterChange: (filters: { label?: Labels; owner?: string }) => void;
  selectedLabel?: Labels;
  selectedOwner?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  selectedLabel,
  selectedOwner,
}) => {
  const [localLabel, setLocalLabel] = useState<string>(selectedLabel || '');
  const [localOwner, setLocalOwner] = useState<string>(selectedOwner || '');

  const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLocalLabel(value);
    onFilterChange({
      label: value ? (value as Labels) : undefined,
      owner: localOwner || undefined,
    });
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalOwner(value);
    onFilterChange({
      label: localLabel ? (localLabel as Labels) : undefined,
      owner: value || undefined,
    });
  };

  const handleClearFilters = () => {
    setLocalLabel('');
    setLocalOwner('');
    onFilterChange({});
  };

  const hasActiveFilters = localLabel || localOwner;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Label Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <select
              value={localLabel}
              onChange={handleLabelChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Labels</option>
              <option value={Labels.HOT}>HOT</option>
              <option value={Labels.WARM}>WARM</option>
              <option value={Labels.COLD}>COLD</option>
            </select>
          </div>

          {/* Owner Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <input
              type="text"
              value={localOwner}
              onChange={handleOwnerChange}
              placeholder="Filter by owner..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {localLabel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Label: {localLabel}
              <button
                onClick={() => {
                  setLocalLabel('');
                  onFilterChange({ owner: localOwner || undefined });
                }}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
          {localOwner && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Owner: {localOwner}
              <button
                onClick={() => {
                  setLocalOwner('');
                  onFilterChange({ label: localLabel ? (localLabel as Labels) : undefined });
                }}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};