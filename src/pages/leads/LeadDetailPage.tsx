import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leadService } from '../../lib/leadService';
import { userStore } from '../../stores/userStore';
import type { Lead } from '../../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, LoadingSpinner } from '../../components/ui';
import { CommentsSection } from '../../components/leads';

export const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { users } = userStore();

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

  if (error || !lead) {
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
            <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">
            {error || 'Lead not found'}
          </p>
        </div>
      </div>
    );
  }

  const assignedUser = lead.assignedTo
    ? users.find(u =>
        u.id === lead.assignedTo ||
        u.id === String(lead.assignedTo) ||
        String(u.id) === lead.assignedTo ||
        String(u.id) === String(lead.assignedTo)
      )
    : undefined;

  // Debug logging
  console.log('LeadDetailPage: lead.assignedTo:', lead.assignedTo, 'type:', typeof lead.assignedTo);
  console.log('LeadDetailPage: users:', users.map(u => ({ id: u.id, name: u.name, type: typeof u.id })));
  console.log('LeadDetailPage: assignedUser found:', assignedUser);

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
            <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
            <p className="text-gray-600">
              {lead.contactPerson} • {lead.organization}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/leads/edit/${lead.id}`)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Lead
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Information */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Lead Information
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{lead.contactPerson}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{lead.organization}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <p className="mt-1 text-sm text-gray-900">{lead.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Value
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: lead.currencyType,
                    }).format(lead.value)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Source Channel
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {lead.sourceChannel}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Labels
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {lead.labels.length > 0 ? (
                    lead.labels.map((label) => (
                      <span
                        key={label}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No labels</p>
                  )}
                </div>
              </div>

              {lead.fileUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Attached File
                  </label>
                  <div className="mt-1">
                    <a
                      href={lead.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card p-6 mt-6">
            <CommentsSection leadId={lead.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Assignment */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status & Assignment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`mt-1 inline-block px-3 py-1 text-sm rounded-full ${
                    lead.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : lead.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {lead.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {assignedUser ? assignedUser.name : 'Unassigned'}
                </p>
                {assignedUser && (
                  <p className="text-xs text-gray-500">{assignedUser.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Audit Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created By
                </label>
                <p className="mt-1 text-sm text-gray-900">{lead.createdBy}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(lead.createdDate).toLocaleDateString()} at{' '}
                  {new Date(lead.createdDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};