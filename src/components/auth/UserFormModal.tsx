import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '../ui';
import type { CreateUserRequest, User } from '../../types';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  title: z.string().min(1, 'Title is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest) => void;
}

const roleOptions = [
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'VIEWER', label: 'Viewer' },
];

const permissionOptions = [
  { value: 'CREATE_USER', label: 'Create User' },
  { value: 'READ_USER', label: 'Read User' },
  { value: 'UPDATE_USER', label: 'Update User' },
  { value: 'DELETE_USER', label: 'Delete User' },
  { value: 'MANAGE_USER_ROLES', label: 'Manage User Roles' },
  { value: 'VIEW_AUDIT_LOGS', label: 'View Audit Logs' },
  { value: 'MANAGE_SYSTEM_SETTINGS', label: 'Manage System Settings' },
  { value: 'UPDATE_OWN_PROFILE', label: 'Update Own Profile' },
  { value: 'CHANGE_OWN_PASSWORD', label: 'Change Own Password' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'REFRESH_TOKEN', label: 'Refresh Token' },
  { value: 'LOGOUT', label: 'Logout' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          title: user.title,
          roles: user.roles,
          permissions: user.permissions,
        }
      : {
          roles: [],
          permissions: [],
        },
  });

  const selectedRoles = watch('roles') || [];
  const selectedPermissions = watch('permissions') || [];

  const handleRoleChange = (role: string) => {
    const currentRoles = selectedRoles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    setValue('roles', newRoles);
  };

  const handlePermissionChange = (permission: string) => {
    const currentPermissions = selectedPermissions;
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];

    setValue('permissions', newPermissions);
  };

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit User' : 'Create New User'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Mobile Number"
          {...register('mobileNumber')}
          error={errors.mobileNumber?.message}
        />

        <Input
          label="Job Title"
          {...register('title')}
          error={errors.title?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles
          </label>
          <div className="space-y-2">
            {roleOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(option.value)}
                  onChange={() => handleRoleChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.roles && (
            <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permissions
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {permissionOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(option.value)}
                  onChange={() => handlePermissionChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.permissions && (
            <p className="mt-1 text-sm text-red-600">{errors.permissions.message}</p>
          )}
        </div>

        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              A secure password will be auto-generated and sent to the user's email.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};