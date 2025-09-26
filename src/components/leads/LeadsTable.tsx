import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button } from '../ui';
import type { Lead, User } from '../../types';
import { PencilIcon, EyeIcon, UserIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LeadDetailModal } from './LeadDetailModal';
import { AssignModal } from './AssignModal';
import { StatusPill } from './StatusPill';

interface LeadsTableProps {
  leads: Lead[];
  users: User[];
  onAssign: (leadId: string, userId: string) => void;
  onStatusChange: (leadId: string, status: Lead['status']) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  users,
  onAssign,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const columns = [
    {
      key: 'contactPerson',
      header: 'Contact Person',
    },
    {
      key: 'organization',
      header: 'Organization',
    },
    {
      key: 'title',
      header: 'Title',
      render: (lead: Lead) => (
        <div className="max-w-xs truncate" title={lead.title}>
          {lead.title}
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      render: (lead: Lead) => (
        <span className="font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: lead.currencyType,
          }).format(lead.value)}
        </span>
      ),
    },
    {
      key: 'labels',
      header: 'Labels',
      render: (lead: Lead) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {lead.labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
            >
              {label}
            </span>
          ))}
          {lead.labels.length > 2 && (
            <span
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              title={lead.labels.slice(2).join(', ')}
            >
              +{lead.labels.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (lead: Lead) => (
        <span className="text-sm">
          {lead.assignedTo ? getUserName(lead.assignedTo) : 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: Lead) => (
        <StatusPill
          status={lead.status}
          onChange={(status) => onStatusChange(lead.id, status)}
        />
      ),
    },
    {
      key: 'createdDate',
      header: 'Created',
      render: (lead: Lead) => (
        <span className="text-sm text-gray-600">
          {new Date(lead.createdDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lead: Lead) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/leads/${lead.id}`)}
            title="View details"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLead(lead);
              setIsAssignModalOpen(true);
            }}
            title="Assign lead"
          >
            <UserIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lead)}
            title="Edit lead"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(lead.id)}
            title="Delete lead"
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        data={leads}
        columns={columns}
        emptyMessage="No leads found"
      />

      {selectedLead && (
        <>
          <LeadDetailModal
            lead={selectedLead}
            assignedUser={
              selectedLead.assignedTo
                ? users.find((u) => u.id === selectedLead.assignedTo)
                : undefined
            }
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedLead(null);
            }}
          />

          <AssignModal
            lead={selectedLead}
            users={users}
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedLead(null);
            }}
            onAssign={(userId) => {
              onAssign(selectedLead.id, userId);
              setIsAssignModalOpen(false);
              setSelectedLead(null);
            }}
          />
        </>
      )}
    </>
  );
};