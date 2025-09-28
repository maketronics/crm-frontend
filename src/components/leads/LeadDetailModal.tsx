import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from '../ui';
import type { Lead, User } from '../../types';
import { EyeIcon } from '@heroicons/react/24/outline';

interface LeadDetailModalProps {
  lead: Lead;
  assignedUser?: User;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  assignedUser,
  isOpen,
  onClose,
}) => {
  console.log('LeadDetailModal: Rendered with lead:', lead);
  console.log('LeadDetailModal: assignedUser prop:', assignedUser);
  console.log('LeadDetailModal: lead.assignedTo:', lead.assignedTo);

  const navigate = useNavigate();

  const handleViewFullDetails = () => {
    navigate(`/leads/${lead.id}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lead Preview" size="lg">
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
              {lead.sourceChannel.replace('_', ' ')}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assigned To
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {assignedUser ? assignedUser.name : 'Unassigned'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <span
              className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
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
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created by:</span>{' '}
              {lead.createdBy}
            </div>
            <div>
              <span className="font-medium">Created date:</span>{' '}
              {new Date(lead.createdDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={handleViewFullDetails}>
            <EyeIcon className="h-4 w-4 mr-2" />
            View Full Details
          </Button>
        </div>
      </div>
    </Modal>
  );
};