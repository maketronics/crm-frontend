import React, { useEffect } from 'react';
import { Button, LoadingSpinner } from '../../components/ui';
import { LeadsTable, FilterBar } from '../../components/leads';
import { leadStore } from '../../stores/leadStore';
import { userStore } from '../../stores/userStore';
import { leadService } from '../../lib/leadService';
import { authService } from '../../lib/authService';
import type { Lead, User, LeadFilters } from '../../types';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    leads,
    totalLeads,
    currentPage,
    totalPages,
    isLoading,
    error,
    filters,
    setLeads,
    updateLead,
    setLoading,
    setError,
    setFilters,
    clearFilters,
  } = leadStore();

  const { users, setUsers: setUsersInStore } = userStore();

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [currentPage, filters]);

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads(page, 10, filters);
      setLeads(response);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authService.getUsers(0, 100);
      setUsersInStore(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAssignLead = async (leadId: string, userId: string) => {
    try {
      const updatedLead = await leadService.assignLeadPatch(leadId, userId);
      updateLead(leadId, updatedLead);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleStatusChange = async (leadId: string, status: Lead['status']) => {
    try {
      const updatedLead = await leadService.updateStatus(leadId, status);
      updateLead(leadId, updatedLead);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this lead? This action cannot be undone.');
    if (confirmed) {
      try {
        await leadService.deleteLead(leadId);
        // Refresh the leads list
        fetchLeads(currentPage);
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleEditLead = (lead: Lead) => {
    navigate(`/leads/edit/${lead.id}`);
  };

  const handleFiltersChange = (newFilters: LeadFilters) => {
    setFilters(newFilters);
  };

  if (isLoading && (!leads || leads.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">
            Manage and track your sales leads
          </p>
        </div>
        <Button onClick={() => navigate('/leads/create')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Lead
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <FilterBar
          filters={filters || {}}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          users={users || []}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="card shadow-sm">
        <LeadsTable
          leads={leads || []}
          users={users || []}
          onAssign={handleAssignLead}
          onStatusChange={handleStatusChange}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
        />

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {leads.length} of {totalLeads} leads
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchLeads(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchLeads(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};