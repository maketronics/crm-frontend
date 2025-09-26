import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadForm } from '../../components/leads';
import { leadService } from '../../lib/leadService';
import { leadStore } from '../../stores/leadStore';
import type { CreateLeadRequest, Lead } from '../../types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, LoadingSpinner } from '../../components/ui';

export const EditLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateLead } = leadStore();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
  }, [id]);

  const fetchLead = async (leadId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const leadData = await leadService.getLeadById(leadId);
      setLead(leadData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CreateLeadRequest) => {
    if (!id) return;

    try {
      const updatedLead = await leadService.updateLead(id, data);
      updateLead(id, updatedLead);
      navigate('/leads', {
        state: { message: 'Lead updated successfully', leadId: updatedLead.id },
      });
    } catch (error: any) {
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!id || !lead) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the lead "${lead.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await leadService.deleteLead(id);
        navigate('/leads', {
          state: { message: 'Lead deleted successfully' },
        });
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/leads')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading lead: {error}</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/leads')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-600">Lead not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/leads')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
            <p className="text-gray-600">
              Update lead information for {lead.contactPerson}
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          onClick={handleDelete}
          className="ml-4"
        >
          Delete Lead
        </Button>
      </div>

      <LeadForm
        onSubmit={handleSubmit}
        initialData={lead}
        mode="edit"
      />
    </div>
  );
};