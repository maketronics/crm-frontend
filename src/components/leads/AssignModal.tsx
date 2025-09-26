import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import type { Lead, User } from '../../types';
import { UserSelect } from './UserSelect';

interface AssignModalProps {
  lead: Lead;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  lead,
  users,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(lead.assignedTo || '');

  const handleAssign = () => {
    onAssign(selectedUserId);
  };

  const currentlyAssigned = users.find((user) => user.id === lead.assignedTo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Lead Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Contact:</span> {lead.contactPerson}
            </p>
            <p>
              <span className="font-medium">Organization:</span> {lead.organization}
            </p>
            <p>
              <span className="font-medium">Title:</span> {lead.title}
            </p>
          </div>
        </div>

        {currentlyAssigned && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Currently assigned to:</span>{' '}
            {currentlyAssigned.name}
          </div>
        )}

        <div>
          <UserSelect
            label="Assign to User"
            value={selectedUserId}
            onChange={setSelectedUserId}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>
            Assign Lead
          </Button>
        </div>
      </div>
    </Modal>
  );
};