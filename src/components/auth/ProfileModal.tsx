import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '../ui';
import { authService } from '../../lib/authService';
import { authStore } from '../../stores/authStore';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  title: z.string().min(1, 'Title is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUser } = authStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user ? {
      name: user.name,
      mobileNumber: user.mobileNumber,
      title: user.title,
    } : undefined,
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      onClose();
      reset();
    } catch (error: any) {
      console.error('Profile update error:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Profile"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Email"
          value={user.email}
          disabled
          className="bg-gray-50"
          helperText="Email cannot be changed"
        />

        <Input
          label="Mobile Number"
          {...register('mobileNumber')}
          error={errors.mobileNumber?.message}
        />

        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles
          </label>
          <div className="flex flex-wrap gap-2">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No roles assigned</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Roles are managed by administrators
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            Update Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};