import React, { useEffect } from 'react';
import { Button, LoadingSpinner } from '../../components/ui';
import { LeadsTable, FilterBar } from '../../components/leads';
import { leadStore } from '../../stores/leadStore';
import { userStore } from '../../stores/userStore';
import { leadService } from '../../lib/leadService';
import { authService } from '../../lib/authService';
import type { Lead, User, LeadFilters } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, []); // Only fetch users once on mount

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchLeads(1); // Reset to page 1 when filters change
    }
  }, [filters]);

  // Handle navigation from create page
  useEffect(() => {
    if (location.state?.message) {
      console.log('LeadsPage: Received message from create page:', location.state.message);
      // Refresh leads when coming from create page
      fetchLeads(1);
      // Clear the state to prevent re-fetching on subsequent renders
      navigate('/leads', { replace: true });
    }
  }, [location.state]);

  const fetchLeads = async (page = 1) => {
    console.log('LeadsPage: Fetching leads for page:', page, 'with filters:', filters);
    setLoading(true);
    setError(null);
    try {
      // Get raw response from the API
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: '10',
      });

      // Add filters to query params
      console.log('LeadsPage: Applying filters:', filters);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            console.log(`LeadsPage: Adding filter ${key}=${value}`);
            if (key === 'labels' && Array.isArray(value)) {
              queryParams.set('labels', value.join(','));
            } else {
              queryParams.set(key, value.toString());
            }
          }
        });
      }

      const apiUrl = `/leads?${queryParams}`;
      console.log('LeadsPage: API URL:', apiUrl);

      const { leadApiClient } = await import('../../lib/leadApiClient');
      const response = await leadApiClient.get<any>(apiUrl);
      console.log('LeadsPage: Raw API response:', response);
      setLeads(response);
    } catch (error: any) {
      console.error('LeadsPage: Error fetching leads:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // Only fetch if we don't already have users
    if (users && users.length > 0) {
      console.log('LeadsPage: Users already loaded, skipping fetch');
      return;
    }

    try {
      console.log('LeadsPage: Fetching users for dropdowns...');
      const response = await authService.getUsers(0, 100);
      console.log('LeadsPage: Users fetched successfully:', response);
      setUsersInStore(response);
    } catch (error: any) {
      console.error('LeadsPage: Failed to fetch users:', error);
      // Don't block the leads page if users fail to load
      setUsersInStore({ data: [], total: 0, page: 0, size: 100, totalPages: 0 });
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
    console.log('LeadsPage: Filters changed:', newFilters);
    setFilters(newFilters);
    // Fetch leads with new filters immediately
    fetchLeadsWithFilters(1, newFilters);
  };

  const handleClearFilters = () => {
    console.log('LeadsPage: Clearing all filters');
    clearFilters();
    // Fetch all leads without filters
    fetchLeadsWithFilters(1, {});
  };

  // New function to fetch leads with specific filters
  const fetchLeadsWithFilters = async (page = 1, customFilters?: LeadFilters) => {
    const filtersToUse = customFilters !== undefined ? customFilters : filters;
    console.log('LeadsPage: Fetching leads with custom filters:', filtersToUse);
    setLoading(true);
    setError(null);
    try {
      // Get raw response from the API
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: '10',
      });

      // Add filters to query params
      console.log('LeadsPage: Applying filters:', filtersToUse);
      if (filtersToUse) {
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            console.log(`LeadsPage: Adding filter ${key}=${value}`);
            if (key === 'labels' && Array.isArray(value)) {
              queryParams.set('labels', value.join(','));
            } else {
              queryParams.set(key, value.toString());
            }
          }
        });
      }

      const apiUrl = `/leads?${queryParams}`;
      console.log('LeadsPage: API URL:', apiUrl);

      const { leadApiClient } = await import('../../lib/leadApiClient');
      const response = await leadApiClient.get<any>(apiUrl);
      console.log('LeadsPage: Raw API response:', response);
      setLeads(response);
    } catch (error: any) {
      console.error('LeadsPage: Error fetching leads:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/leads/kanban')}
          >
            <Squares2X2Icon className="h-4 w-4 mr-2" />
            Kanban View
          </Button>
          <Button onClick={() => navigate('/leads/create')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Lead
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <FilterBar
          filters={filters || {}}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
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