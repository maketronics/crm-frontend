import React, { useState } from 'react';
import { Table, Button } from '../ui';
import type { User } from '../../types';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { UserFormModal } from './UserFormModal';
import { UserDetailModal } from './UserDetailModal';
import { ConfirmDialog } from './ConfirmDialog';

interface UserListTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  users,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const columns = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'title',
      header: 'Title',
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span
              key={role}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (user: User) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setIsDetailModalOpen(true);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setIsEditModalOpen(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(user.id, !user.isActive)}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserToDelete(user)}
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        data={users}
        columns={columns}
        emptyMessage="No users found"
      />

      {selectedUser && (
        <>
          <UserDetailModal
            user={selectedUser}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedUser(null);
            }}
          />

          <UserFormModal
            user={selectedUser}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSubmit={(userData) => {
              onEdit({ ...selectedUser, ...userData });
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
          />
        </>
      )}

      {userToDelete && (
        <ConfirmDialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => {
            onDelete(userToDelete.id);
            setUserToDelete(null);
          }}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`}
        />
      )}
    </>
  );
};