import React from 'react';
import { Modal } from '../ui';
import type { User } from '../../types';

interface UserDetailModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <p className="mt-1 text-sm text-gray-900">{user.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <p className="mt-1 text-sm text-gray-900">{user.mobileNumber}</p>
        </div>

        {user.password && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">
                {user.password}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(user.password!)}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Copy password"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <p className="mt-1 text-sm text-gray-900">{user.title}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Roles
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Permissions
          </label>
          <div className="mt-1 flex flex-wrap gap-1">
            {user.permissions.map((permission) => (
              <span
                key={permission}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {permission.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <span
            className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
              user.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Created At
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Updated
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {user.createdBy && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Created By
            </label>
            <p className="mt-1 text-sm text-gray-900">{user.createdBy}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};