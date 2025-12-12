import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '../ui';
import { 
  Labels, 
  Stage, 
  getLeadName,
  getLeadPhone,
  getLeadEmail,
  getLeadTargetSegment,
  getLeadQuotationLink
} from '../../types/lead.types';
import type{ CreateLeadRequest, Lead } from '../../types/lead.types';
import { authStore } from '../../stores/authStore';

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
  const [existingFileUrls, setExistingFileUrls] = useState<string[]>([]);
  const user = authStore((state) => state.user);
  const isEditMode = mode === 'edit';

  // Helper function to extract form data from Lead (handles nested structure)
  const extractFormData = (lead: Lead): Partial<LeadFormData> => {
    return {
      contactPerson: lead.contactPerson,
      organization: lead.organization,
      title: lead.title,
      value: lead.value,
      currency: lead.currency,
      label: lead.label,
      owner: lead.owner,
      sourceChannel: lead.sourceChannel,
      sourceChannelId: lead.sourceChannelId,
      sourceOrigin: lead.sourceOrigin,
      expectedCloseDate: lead.expectedCloseDate,
      phone: getLeadPhone(lead),
      name: getLeadName(lead),
      targetSegment: getLeadTargetSegment(lead) || '',
      email: getLeadEmail(lead) || '',
      quotationLink: getLeadQuotationLink(lead) || '',
      notesText: lead.notes?.text || lead.notesText || '',
      stage: lead.stage,
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData ? extractFormData(initialData) : {
      currency: 'USD',
      label: Labels.WARM,
      stage: Stage.LEAD,
      targetSegment: '',
      email: '',
      quotationLink: '',
      notesText: '',
      owner: user?.username || '',
    },
  });

  // Load existing files when in edit mode
  useEffect(() => {
    if (isEditMode && initialData?.notes?.fileUrls) {
      setExistingFileUrls(initialData.notes.fileUrls);
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
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
      const formData = extractFormData(initialData);
      reset(formData);
      setSelectedFile(null);
      if (initialData.notes?.fileUrls) {
        setExistingFileUrls(initialData.notes.fileUrls);
      }
    } else {
      reset();
      setSelectedFile(null);
      setExistingFileUrls([]);
    }
  };

  const handleFormError = (errors: any) => {
    console.log('LeadForm: Form validation failed:', errors);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
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

            {/* Display existing files in edit mode */}
            {isEditMode && existingFileUrls.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Files
                </label>
                <div className="space-y-2">
                  {existingFileUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View File {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEditMode ? 'Upload New File (Optional)' : 'Attach File (Optional)'}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
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
                <span className="font-medium">Lead ID:</span>{' '}
                {initialData.id}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {initialData.leadCreated
                  ? new Date(initialData.leadCreated).toLocaleString()
                  : 'Unknown'}
              </div>
              {initialData.updatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(initialData.updatedAt).toLocaleString()}
                </div>
              )}
              <div>
                <span className="font-medium">Current Stage:</span>{' '}
                {initialData.stage}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t sticky bottom-0 bg-white">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isSubmitting || isFormSubmitting}
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