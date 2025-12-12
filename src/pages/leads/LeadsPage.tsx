import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBar } from '../../components/leads/FilterBar';
import { LeadsTable } from '../../components/leads/LeadsTable';
import { leadApi } from '../../api/leadApi';
import {  Labels } from '../../types/lead.types';
import type { Lead, LeadsListResponse } from '../../types/lead.types';
import { Button } from '../../components/ui';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState<Labels | undefined>();
  const [selectedOwner, setSelectedOwner] = useState<string | undefined>();

  useEffect(() => {
    fetchLeads();
  }, [page, selectedLabel, selectedOwner]);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('LeadsPage: Fetching leads, page:', page, 'label:', selectedLabel, 'owner:', selectedOwner);
      
      const response: LeadsListResponse = await leadApi.getLeads({
        page,
        size: 20,
        label: selectedLabel,
        owner: selectedOwner,
      });
      
      console.log('LeadsPage: Leads fetched successfully:', response);
      
      setLeads(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('LeadsPage: Error fetching leads:', err);
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      console.log('LeadsPage: Deleting lead with ID:', id);
      
      const response = await leadApi.deleteLead(id);
      
      console.log('LeadsPage: Lead deleted successfully:', response);
      
      alert(`Success: ${response.message || 'Lead deleted successfully'}`);
      
      // Refresh the list
      fetchLeads();
    } catch (err: any) {
      console.error('LeadsPage: Error deleting lead:', err);
      alert(`Error: ${err.message || 'Failed to delete lead'}`);
    }
  };

  const handleView = (id: string) => {
    console.log('LeadsPage: Navigating to lead detail:', id);
    navigate(`/leads/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log('LeadsPage: Navigating to edit lead:', id);
    navigate(`/leads/${id}/edit`);
  };

  const handleFilterChange = (filters: { label?: Labels; owner?: string }) => {
    setSelectedLabel(filters.label);
    setSelectedOwner(filters.owner);
    setPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading && leads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalElements} total leads
          </p>
        </div>
        <Button
          onClick={() => navigate('/leads/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create New Lead
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onFilterChange={handleFilterChange}
        selectedLabel={selectedLabel}
        selectedOwner={selectedOwner}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Leads Table */}
      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        onDelete={handleDelete}
        onView={(id) => navigate(`/leads/${id}`)}
        onEdit={(id) => navigate(`/leads/${id}/edit`)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white px-6 py-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Showing page {page + 1} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              variant="secondary"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx;
                } else if (page < 3) {
                  pageNum = idx;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};