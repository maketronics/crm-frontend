import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '../ui';
import type { Lead } from '../../types';
import { authStore } from '../../stores/authStore';

// Enums matching API
export enum Labels {
  HOT = 'HOT',
  WARM = 'WARM',
  COLD = 'COLD'
}

export enum Stage {
  LEAD = 'LEAD',
  QUOTATION_RECEIVED_FROM_SUPPLIER = 'QUOTATION_RECEIVED_FROM_SUPPLIER',
  QUOTATION_SHARED_WITH_CUSTOMER = 'QUOTATION_SHARED_WITH_CUSTOMER',
  NEGOTIATION_STARTED = 'NEGOTIATION_STARTED',
  PO_RECEIVED = 'PO_RECEIVED',
  PARTS_DELIVERED = 'PARTS_DELIVERED',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST'
}

// Updated schema matching API exactly
const leadSchema = z.object({
  contactPerson: z.string().min(1, 'Contact person is required'),
  organization: z.string().min(1, 'Organization is required'),
  title: z.string().min(1, 'Title is required'),
  value: z.number().optional(),
  currency: z.string().min(1, 'Currency is required'),
  label: z.nativeEnum(Labels),
  owner: z.string().min(1, 'Owner is required'),
  sourceChannel: z.string().min(1, 'Source channel is required'),
  sourceChannelId: z.string().min(1, 'Source channel ID is required'),
  sourceOrigin: z.string().min(1, 'Source origin is required'),
  expectedCloseDate: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  name: z.string().min(1, 'Name is required'),
  targetSegment: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  quotationLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  notesText: z.string().optional(),
  stage: z.nativeEnum(Stage).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export interface CreateLeadRequest extends LeadFormData {
  notesFile?: File;
}

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

const labelOptions = [
  { value: Labels.HOT, label: 'HOT' },
  { value: Labels.WARM, label: 'WARM' },
  { value: Labels.COLD, label: 'COLD' },
];

const stageOptions = [
  { value: Stage.LEAD, label: 'Lead' },
  { value: Stage.QUOTATION_RECEIVED_FROM_SUPPLIER, label: 'Quotation Received from Supplier' },
  { value: Stage.QUOTATION_SHARED_WITH_CUSTOMER, label: 'Quotation Shared with Customer' },
  { value: Stage.NEGOTIATION_STARTED, label: 'Negotiation Started' },
  { value: Stage.PO_RECEIVED, label: 'PO Received' },
  { value: Stage.PARTS_DELIVERED, label: 'Parts Delivered' },
  { value: Stage.CLOSED_WON, label: 'Closed Won' },
  { value: Stage.CLOSED_LOST, label: 'Closed Lost' },
];

export const LeadForm: React.FC<LeadFormProps> = ({
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = 'create',
}) => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const user = authStore((state) => state.user);
  const isEditMode = mode === 'edit';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData ? {
      contactPerson: (initialData as any).contactPerson,
      organization: (initialData as any).organization,
      title: (initialData as any).title,
      value: (initialData as any).value,
      currency: (initialData as any).currency,
      label: (initialData as any).label,
      owner: (initialData as any).owner,
      sourceChannel: (initialData as any).sourceChannel,
      sourceChannelId: (initialData as any).sourceChannelId,
      sourceOrigin: (initialData as any).sourceOrigin,
      expectedCloseDate: (initialData as any).expectedCloseDate,
      phone: (initialData as any).phone,
      name: (initialData as any).name,
      targetSegment: (initialData as any).targetSegment || '',
      email: (initialData as any).email || '',
      quotationLink: (initialData as any).quotationLink || '',
      notesText: (initialData as any).notesText || '',
      stage: (initialData as any).stage as Stage,
    } : {
      currency: 'USD',
      label: Labels.WARM,
      stage: Stage.LEAD,
      targetSegment: '',
      email: '',
      quotationLink: '',
      notesText: '',
    },
  });

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
    console.log('LeadForm: Selected file:', selectedFile);

    setIsFormSubmitting(true);

    const submitData: CreateLeadRequest = {
      ...data,
      notesFile: selectedFile || undefined,
    };

    console.log('LeadForm: Final submit data:', submitData);

    try {
      await onSubmit(submitData);

      if (!isEditMode) {
        reset();
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
        contactPerson: (initialData as any).contactPerson,
        organization: (initialData as any).organization,
        title: (initialData as any).title,
        value: (initialData as any).value,
        currency: (initialData as any).currency,
        label: (initialData as any).label,
        owner: (initialData as any).owner,
        sourceChannel: (initialData as any).sourceChannel,
        sourceChannelId: (initialData as any).sourceChannelId,
        sourceOrigin: (initialData as any).sourceOrigin,
        expectedCloseDate: (initialData as any).expectedCloseDate,
        phone: (initialData as any).phone,
        name: (initialData as any).name,
        targetSegment: (initialData as any).targetSegment || '',
        email: (initialData as any).email || '',
        quotationLink: (initialData as any).quotationLink || '',
        notesText: (initialData as any).notesText || '',
        stage: (initialData as any).stage as Stage,
      });
      setSelectedFile(null);
    } else {
      reset();
      setSelectedFile(null);
    }
  };

  const handleFormError = (errors: any) => {
    console.log('LeadForm: Form validation failed:', errors);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">
      {isEditMode ? 'Edit Lead' : 'Create New Lead'}
    </h2>
    <form 
      onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
      className="space-y-6"
    >
        {/* Contact Information Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Contact Person"
              placeholder="John Doe"
              {...register('contactPerson')}
              error={errors.contactPerson?.message}
              required
            />

            <Input
              label="Name"
              placeholder="Full Name"
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <Input
              label="Organization"
              placeholder="Acme Corp"
              {...register('organization')}
              error={errors.organization?.message}
              required
            />

            <Input
              label="Phone"
              placeholder="+1 234 567 8900"
              {...register('phone')}
              error={errors.phone?.message}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Target Segment"
              placeholder="Enterprise, SMB, etc."
              {...register('targetSegment')}
              error={errors.targetSegment?.message}
            />
          </div>
        </div>

        {/* Lead Details Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">
            Lead Details
          </h3>
          <div className="space-y-6">
            <Input
              label="Title"
              placeholder="Website Redesign Project"
              {...register('title')}
              error={errors.title?.message}
              required
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
                {...register('currency')}
                error={errors.currency?.message}
                required
              />

              <Select
                label="Label"
                options={labelOptions}
                {...register('label')}
                error={errors.label?.message}
                required
              />

              <Input
                label="Owner"
                placeholder="Owner name or ID"
                {...register('owner')}
                error={errors.owner?.message}
                required
              />

              <Input
                label="Expected Close Date"
                type="date"
                {...register('expectedCloseDate')}
                error={errors.expectedCloseDate?.message}
              />

              <Select
                label="Stage"
                options={stageOptions}
                {...register('stage')}
                error={errors.stage?.message}
              />
            </div>
          </div>
        </div>

        {/* Source Information Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">
            Source Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Source Channel"
              options={sourceChannelOptions}
              placeholder="Select source channel"
              {...register('sourceChannel')}
              error={errors.sourceChannel?.message}
              required
            />

            <Input
              label="Source Channel ID"
              placeholder="Channel identifier"
              {...register('sourceChannelId')}
              error={errors.sourceChannelId?.message}
              required
            />

            <Input
              label="Source Origin"
              placeholder="Origin details"
              {...register('sourceOrigin')}
              error={errors.sourceOrigin?.message}
              required
            />

            <Input
              label="Quotation Link"
              type="url"
              placeholder="https://example.com/quote"
              {...register('quotationLink')}
              error={errors.quotationLink?.message}
            />
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">
            Additional Notes
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notesText')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional notes..."
              />
              {errors.notesText && (
                <p className="mt-1 text-sm text-red-600">{errors.notesText.message}</p>
              )}
            </div>

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
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        {isEditMode && initialData && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {initialData.createdBy || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Created date:</span>{' '}
                {initialData.createdDate
                  ? new Date(initialData.createdDate).toLocaleDateString()
                  : 'Unknown'
                }
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
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