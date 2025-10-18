import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  XMarkIcon as X,
  CheckIcon as Save,
  ExclamationCircleIcon as AlertCircle,
  UserIcon as User,
  BuildingOffice2Icon as Building2,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  MapPinIcon as MapPin,
  CubeIcon as Package,
  CurrencyDollarIcon as DollarSign,
  CalendarIcon as Calendar,
  TagIcon as Tag,
  DocumentTextIcon as FileText,
  ArrowUpTrayIcon as Upload,
  ArrowPathIcon as Loader2,
  CheckCircleIcon as CheckCircle2
} from '@heroicons/react/24/outline';
import type { Lead, LeadStage, User as UserType } from '../../types';
import { leadService } from '../../lib/leadService';
import { authStore } from '../../stores/authStore';
import { Modal, Button, Input, Select } from '../ui';

const kanbanLeadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  organization: z.string().min(1, 'Organization is required'),
  value: z.number().min(0, 'Value must be positive'),
  currencyType: z.string().min(1, 'Currency is required'),
  sourceChannel: z.string().min(1, 'Source channel is required'),
  labels: z.array(z.string()),
  stage: z.string().optional(),
  
  // Kanban-specific fields
  partNumber: z.string().optional(),
  quantity: z.number().optional(),
  region: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  country: z.string().optional(),
  targetSegment: z.string().optional(),
  targetPrice: z.number().optional(),
  expectedClosureDate: z.string().optional(),
  dealProbability: z.number().min(0).max(100).optional(),
  grossMargin: z.number().optional(),
  grossMarginPercentage: z.number().optional(),
  priceToWin: z.number().optional(),
  
  // Documents
  poDocument: z.string().optional(),
  invoiceDocument: z.string().optional(),
  specialTerms: z.string().optional(),
  customerRequest: z.string().optional(),
  dhlFedexAccount: z.string().optional(),
  awbNumber: z.string().optional(),
});

type KanbanLeadFormData = z.infer<typeof kanbanLeadSchema>;

interface LeadDetailKanbanModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
  users?: UserType[];
}

const LABEL_OPTIONS = ['hot', 'warm', 'cold', 'urgent', 'priority'];
const SOURCE_CHANNELS = ['Marketplace', 'NetComponents', 'Cold-calling', 'Face-to-face', 'Others'];
const TARGET_SEGMENTS = ['Broker', 'Independent Distributor', 'OEM', 'EMS', 'ODM', 'Others'];
const REGIONS = ['APAC', 'Americas', 'Europe', 'Middle East', 'Africa'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY'];

const STAGES: { value: LeadStage; label: string }[] = [
  { value: 'qualified', label: 'Qualified' },
  { value: 'quotation_received', label: 'Quotation Received' },
  { value: 'quotation_shared', label: 'Quotation Shared' },
  { value: 'negotiation_started', label: 'Negotiations Started' },
  { value: 'po_received', label: 'PO Received' },
  { value: 'parts_delivered', label: 'Parts Delivered' }
];

export const LeadDetailKanbanModal: React.FC<LeadDetailKanbanModalProps> = ({ 
  lead, 
  isOpen, 
  onClose, 
  onSave,
  users = []
}) => {
  const { user } = authStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'opportunity' | 'documents'>('basic');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control
  } = useForm<KanbanLeadFormData>({
    resolver: zodResolver(kanbanLeadSchema),
  });

  useEffect(() => {
    if (lead) {
      reset({
        title: lead.title,
        contactPerson: lead.contactPerson,
        organization: lead.organization,
        value: lead.value,
        currencyType: lead.currencyType,
        sourceChannel: lead.sourceChannel,
        labels: lead.labels || [],
        stage: lead.stage || 'qualified',
        partNumber: lead.partNumber || '',
        quantity: lead.quantity || 0,
        region: lead.region || '',
        email: lead.email || '',
        phone: lead.phone || '',
        country: lead.country || '',
        targetSegment: lead.targetSegment || '',
        targetPrice: lead.targetPrice || 0,
        expectedClosureDate: lead.expectedClosureDate || '',
        dealProbability: lead.dealProbability || 0,
        grossMargin: lead.grossMargin || 0,
        grossMarginPercentage: lead.grossMarginPercentage || 0,
        priceToWin: lead.priceToWin || 0,
        poDocument: lead.poDocument || '',
        invoiceDocument: lead.invoiceDocument || '',
        specialTerms: lead.specialTerms || '',
        customerRequest: lead.customerRequest || '',
        dhlFedexAccount: lead.dhlFedexAccount || '',
        awbNumber: lead.awbNumber || '',
      });
      setSelectedLabels(lead.labels || []);
    }
  }, [lead, reset]);

  if (!lead) return null;

  const handleLabelToggle = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    setSelectedLabels(newLabels);
    setValue('labels', newLabels);
  };

  const onSubmit = async (data: KanbanLeadFormData) => {
    setIsSaving(true);
    try {
      const updateData: Partial<Lead> = {
      title: data.title,
      contactPerson: data.contactPerson,
      organization: data.organization,
      value: data.value,
      currencyType: data.currencyType,
      sourceChannel: data.sourceChannel,
      labels: selectedLabels,
      stage: data.stage as LeadStage,
      partNumber: data.partNumber || undefined,
      quantity: data.quantity || undefined,
      region: data.region || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      country: data.country || undefined,
      targetSegment: data.targetSegment || undefined,
      targetPrice: data.targetPrice || undefined,
      expectedClosureDate: data.expectedClosureDate || undefined,
      dealProbability: data.dealProbability || undefined,
      grossMargin: data.grossMargin || undefined,
      grossMarginPercentage: data.grossMarginPercentage || undefined,
      priceToWin: data.priceToWin || undefined,
      poDocument: data.poDocument || undefined,
      invoiceDocument: data.invoiceDocument || undefined,
      specialTerms: data.specialTerms || undefined,
      customerRequest: data.customerRequest || undefined,
      dhlFedexAccount: data.dhlFedexAccount || undefined,
      awbNumber: data.awbNumber || undefined,
    };

    const updatedLead = await leadService.updateLead(lead.id, updateData);
    onSave(updatedLead);
    onClose();
  }catch (error: any) {
      console.error('Failed to update lead:', error);
      alert(error.message || 'Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'po' | 'invoice' | 'general') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await leadService.uploadFile(lead.id, file, fileType);
      if (fileType === 'po') {
        setValue('poDocument', result.fileUrl);
      } else if (fileType === 'invoice') {
        setValue('invoiceDocument', result.fileUrl);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{lead.title}</h2>
            <p className="text-sm text-gray-500 mt-1">Lead ID: {lead.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('opportunity')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'opportunity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Opportunity Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents & PO
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Lead Title"
                    {...register('title')}
                    error={errors.title?.message}
                    required
                  />
                  
                  <Select
                    label="Stage"
                    options={STAGES.map(s => ({ value: s.value, label: s.label }))}
                    {...register('stage')}
                    error={errors.stage?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Contact Person"
                      {...register('contactPerson')}
                      error={errors.contactPerson?.message}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Organization"
                    {...register('organization')}
                    error={errors.organization?.message}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  
                  <Input
                    label="Phone"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Country"
                    options={[
                      { value: 'USA', label: 'USA' },
                      { value: 'India', label: 'India' },
                      { value: 'Germany', label: 'Germany' },
                      { value: 'China', label: 'China' },
                      { value: 'Japan', label: 'Japan' },
                      { value: 'UK', label: 'UK' },
                    ]}
                    {...register('country')}
                    placeholder="Select country"
                  />
                  
                  <Select
                    label="Region"
                    options={REGIONS.map(r => ({ value: r, label: r }))}
                    {...register('region')}
                    placeholder="Select region"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Source Channel"
                    options={SOURCE_CHANNELS.map(s => ({ value: s, label: s }))}
                    {...register('sourceChannel')}
                    error={errors.sourceChannel?.message}
                    required
                  />
                  
                  <Select
                    label="Target Segment"
                    options={TARGET_SEGMENTS.map(s => ({ value: s, label: s }))}
                    {...register('targetSegment')}
                    placeholder="Select segment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LABEL_OPTIONS.map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleLabelToggle(label)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedLabels.includes(label)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        {label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Opportunity Details Tab */}
            {activeTab === 'opportunity' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Part Number"
                    {...register('partNumber')}
                    placeholder="e.g., MAX3040EWE+"
                  />
                  
                  <Input
                    label="Quantity"
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                    placeholder="1000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Deal Value"
                    type="number"
                    step="0.01"
                    {...register('value', { valueAsNumber: true })}
                    error={errors.value?.message}
                    required
                  />
                  
                  <Select
                    label="Currency"
                    options={CURRENCIES.map(c => ({ value: c, label: c }))}
                    {...register('currencyType')}
                    error={errors.currencyType?.message}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Target Price"
                    type="number"
                    step="0.01"
                    {...register('targetPrice', { valueAsNumber: true })}
                    placeholder="Optional"
                  />
                  
                  <Input
                    label="Price to Win"
                    type="number"
                    step="0.01"
                    {...register('priceToWin', { valueAsNumber: true })}
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Gross Margin (Value)"
                    type="number"
                    step="0.01"
                    {...register('grossMargin', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  
                  <Input
                    label="Gross Margin (%)"
                    type="number"
                    step="0.01"
                    max="100"
                    {...register('grossMarginPercentage', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Deal Probability (%)"
                    type="number"
                    min="0"
                    max="100"
                    {...register('dealProbability', { valueAsNumber: true })}
                    placeholder="0-100"
                  />
                  
                  <Input
                    label="Expected Closure Date"
                    type="date"
                    {...register('expectedClosureDate')}
                  />
                </div>
              </div>
            )}

            {/* Documents & PO Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Document
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'po')}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {watch('poDocument') && (
                      <a
                        href={watch('poDocument')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Document
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'invoice')}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {watch('invoiceDocument') && (
                      <a
                        href={watch('invoiceDocument')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Terms & Conditions
                  </label>
                  <textarea
                    {...register('specialTerms')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any special terms or conditions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Request
                  </label>
                  <textarea
                    {...register('customerRequest')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer requests..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="DHL/FedEx Account Number"
                    {...register('dhlFedexAccount')}
                    placeholder="Optional"
                  />
                  
                  <Input
                    label="AWB Number"
                    {...register('awbNumber')}
                    placeholder="Air Waybill Number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Created by:</span> {lead.createdBy} on{' '}
              {new Date(lead.createdDate).toLocaleDateString()}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};