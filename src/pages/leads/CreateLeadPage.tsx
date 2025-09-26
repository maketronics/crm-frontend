import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadForm } from '../../components/leads';
import { leadStore } from '../../stores/leadStore';
import { leadService } from '../../lib/leadService';
import type { CreateLeadRequest } from '../../types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui';

export const CreateLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { addLead } = leadStore();

  const handleSubmit = async (data: CreateLeadRequest) => {
    try {
      const newLead = await leadService.createLead(data);
      addLead(newLead);
      navigate('/leads', {
        state: { message: 'Lead created successfully', leadId: newLead.id },
      });
    } catch (error: any) {
      throw error;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
          <p className="text-gray-600">
            Add a new lead to your pipeline
          </p>
        </div>
      </div>

      <LeadForm onSubmit={handleSubmit} />
    </div>
  );
};