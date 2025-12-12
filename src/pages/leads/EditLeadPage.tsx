import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadForm } from '../../components/leads/LeadForm';
import { leadApi } from '../../api/leadApi';
import type{ CreateLeadRequest, Lead } from '../../types/lead.types';

export const EditLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<Lead | null>(null);

  // Fetch lead data on mount
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) {
        setError('Lead ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        console.log('EditLeadPage: Fetching lead with ID:', id);
        const lead = await leadApi.getLeadById(id);
        console.log('EditLeadPage: Lead fetched successfully:', lead);
        setLeadData(lead);
      } catch (err: any) {
        console.error('EditLeadPage: Error fetching lead:', err);
        setError(err.message || 'Failed to fetch lead');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleSubmit = async (data: CreateLeadRequest) => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('EditLeadPage: Updating lead with ID:', id, 'Data:', data);
      
      const response = await leadApi.updateLead(id, data);
      
      console.log('EditLeadPage: Lead updated successfully:', response);
      
      // Show success message
      alert(`Success: ${response.message || 'Lead updated successfully'}`);
      
      // Navigate back to leads list or detail page
      navigate('/leads');
    } catch (err: any) {
      console.error('EditLeadPage: Error updating lead:', err);
      setError(err.message || 'Failed to update lead');
      
      // Show error message
      alert(`Error: ${err.message || 'Failed to update lead'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State (no lead data)
  if (error && !leadData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error loading lead</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/leads')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Back to Leads
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/leads')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Leads
          </button>
        </div>

        {/* Error Banner (submission error) */}
        {error && leadData && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error updating lead</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lead Form */}
        {leadData && (
          <LeadForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={leadData}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
};