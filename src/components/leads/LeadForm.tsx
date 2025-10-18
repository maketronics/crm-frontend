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
  assignedTo: z.union([z.string(), z.number()]).optional().transform((val) =>
    val ? String(val) : undefined
  ),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'CLOSED']).optional(),
  file: z.any().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSubmit: (data: CreateLeadRequest) => Promise<void>;
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
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('LeadForm: File selected:', file.name);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    console.log('LeadForm: Form data submitted:', data);
    console.log('LeadForm: Current user:', user);
    console.log('LeadForm: Labels:', labels);
    console.log('LeadForm: Selected file:', selectedFile);

    setIsFormSubmitting(true);

    const submitData: CreateLeadRequest = {
      contactPerson: data.contactPerson,
      organization: data.organization,
      title: data.title,
      value: data.value,
      currencyType: data.currencyType,
      sourceChannel: data.sourceChannel,
      labels: labels,
      assignedTo: data.assignedTo || undefined,
      status: data.status || 'PENDING',
      createdBy: user?.id || user?.name || 'current-user',
      file: selectedFile || undefined,
    };

    console.log('LeadForm: Final submit data:', submitData);

    try {
      await onSubmit(submitData);

      if (!isEditMode) {
        reset();
        setLabels([]);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('LeadForm: Error during submission:', error);
    } finally {
      setIsFormSubmitting(false);
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
      });
      setLabels(initialData.labels || []);
      setSelectedFile(null);
    } else {
      reset();
      setLabels([]);
      setSelectedFile(null);
    }
  };

  const handleFormError = (errors: any) => {
    console.log('LeadForm: Form validation failed:', errors);
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {isEditMode ? 'Edit Lead' : 'Create New Lead'}
      </h2>

      <form
        onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
        className="space-y-6"
      >
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach File (Optional)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Choose File
            </label>
            {selectedFile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            {initialData?.fileUrl && !selectedFile && (
              <a
                href={initialData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View existing file
              </a>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
          </p>
        </div>

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
          <Button
            type="submit"
            isLoading={isSubmitting || isFormSubmitting}
          >
            {isEditMode ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};