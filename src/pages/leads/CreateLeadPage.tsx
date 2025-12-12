import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadForm } from '../../components/leads/LeadForm';
import { leadApi } from '../../api/leadApi';
import type{ CreateLeadRequest } from '../../types/lead.types';

export const CreateLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateLeadRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('CreateLeadPage: Submitting lead data:', data);
      
      const response = await leadApi.createLead(data);
      
      console.log('CreateLeadPage: Lead created successfully:', response);
      
      // Show success message
      alert(`Success: ${response.message || 'Lead created successfully'}`);
      
      // Navigate back to leads list
      navigate('/leads');
    } catch (err: any) {
      console.error('CreateLeadPage: Error creating lead:', err);
      setError(err.message || 'Failed to create lead');
      
      // Show error message
      alert(`Error: ${err.message || 'Failed to create lead'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error creating lead</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lead Form */}
        <LeadForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </div>
  );
};