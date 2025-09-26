import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '../ui';
import type { CreateLeadRequest, Lead } from '../../types';
import { TagInput } from './TagInput';
import { UserSelect } from './UserSelect';
import { authStore } from '../../stores/authStore';

const leadSchema = z.object({
  contactPerson: z.string().min(1, 'Contact person is required'),
  organization: z.string().min(1, 'Organization is required'),
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be a positive number'),
  currencyType: z.string().min(1, 'Currency is required'),
  labels: z.array(z.string()),
  sourceChannel: z.string().min(1, 'Source channel is required'),
  assignedTo: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'CLOSED']).optional(),
  fileUrl: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSubmit: (data: CreateLeadRequest) => void;
  isSubmitting?: boolean;
  initialData?: Lead;
  mode?: 'create' | 'edit';
}

const sourceChannelOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Event', label: 'Event' },
  { value: 'Other', label: 'Other' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'INR', label: 'INR' },
];

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED', label: 'Closed' },
];

export const LeadForm: React.FC<LeadFormProps> = ({
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = 'create',
}) => {
  const [labels, setLabels] = useState<string[]>(initialData?.labels || []);
  const user = authStore((state) => state.user);
  const isEditMode = mode === 'edit';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData ? {
      contactPerson: initialData.contactPerson,
      organization: initialData.organization,
      title: initialData.title,
      value: initialData.value,
      currencyType: initialData.currencyType,
      labels: initialData.labels,
      sourceChannel: initialData.sourceChannel,
      assignedTo: initialData.assignedTo || '',
      status: initialData.status,
      fileUrl: initialData.fileUrl || '',
    } : {
      currencyType: 'USD',
      status: 'PENDING',
      labels: [],
    },
  });

  // Update labels when initialData changes
  useEffect(() => {
    if (initialData?.labels) {
      setLabels(initialData.labels);
    }
  }, [initialData]);

  const handleFormSubmit = (data: LeadFormData) => {
    const submitData: CreateLeadRequest = {
      ...data,
      labels,
      createdBy: user?.id || user?.name || 'current-user',
    };

    onSubmit(submitData);

    if (!isEditMode) {
      reset();
      setLabels([]);
    }
  };

  const handleReset = () => {
    if (isEditMode && initialData) {
      reset({
        contactPerson: initialData.contactPerson,
        organization: initialData.organization,
        title: initialData.title,
        value: initialData.value,
        currencyType: initialData.currencyType,
        sourceChannel: initialData.sourceChannel,
        assignedTo: initialData.assignedTo || '',
        status: initialData.status,
        fileUrl: initialData.fileUrl || '',
      });
      setLabels(initialData.labels || []);
    } else {
      reset();
      setLabels([]);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {isEditMode ? 'Edit Lead' : 'Create New Lead'}
      </h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Contact Person"
            placeholder="John Doe"
            {...register('contactPerson')}
            error={errors.contactPerson?.message}
          />

          <Input
            label="Organization"
            placeholder="Acme Corp"
            {...register('organization')}
            error={errors.organization?.message}
          />
        </div>

        <Input
          label="Title"
          placeholder="Website Redesign Project"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Value"
            type="number"
            step="0.01"
            placeholder="10000"
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
          />

          <Select
            label="Currency"
            options={currencyOptions}
            {...register('currencyType')}
            error={errors.currencyType?.message}
          />
        </div>

        <Select
          label="Source Channel"
          options={sourceChannelOptions}
          placeholder="Select source channel"
          {...register('sourceChannel')}
          error={errors.sourceChannel?.message}
        />

        <TagInput
          label="Labels"
          value={labels}
          onChange={setLabels}
          placeholder="Add labels..."
        />

        <UserSelect
          label="Assign To"
          value={watch('assignedTo') || ''}
          onChange={(userId) => setValue('assignedTo', userId)}
        />

        {isEditMode && (
          <Select
            label="Status"
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
          />
        )}

        <Input
          label="File URL (Optional)"
          placeholder="https://example.com/file.pdf"
          {...register('fileUrl')}
          error={errors.fileUrl?.message}
        />

        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">
                {isEditMode ? 'Created by:' : 'Will be created by:'}
              </span>{' '}
              {isEditMode && initialData ? initialData.createdBy : (user?.name || 'Current User')}
            </div>
            <div>
              <span className="font-medium">
                {isEditMode ? 'Created date:' : 'Will be created on:'}
              </span>{' '}
              {isEditMode && initialData
                ? new Date(initialData.createdDate).toLocaleDateString()
                : new Date().toLocaleDateString()
              }
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            {isEditMode ? 'Reset Changes' : 'Reset'}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};