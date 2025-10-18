import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import type { Lead, LeadStage } from '../../types';
import { Modal, Button, Input, Select } from '../ui';

interface StageTransitionModalProps {
  lead: Lead;
  targetStage: LeadStage;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedData: Partial<Lead>) => void;
  missingFields: string[];
}

const STAGE_REQUIREMENTS = {
  lead: {
    title: 'Lead/Qualified Stage',
    description: 'Basic lead information',
    fields: ['title', 'contactPerson', 'organization']
  },
  opportunity: {
    title: 'Move to Opportunity',
    description: 'Please fill in the required fields to move this lead to Opportunity stage',
    fields: ['partNumber', 'quantity', 'region']
  },
  quotation_received: {
    title: 'Move to Quotation Received',
    description: 'No additional fields required - quotation will be created automatically',
    fields: []
  },
  quotation_shared: {
    title: 'Move to Quotation Shared',
    description: 'Please fill in the deal details to share quotation with customer',
    fields: ['value', 'grossMargin', 'dealProbability', 'expectedClosureDate', 'priceToWin']
  },
  negotiation_started: {
    title: 'Move to Negotiation',
    description: 'Please provide negotiation details',
    fields: ['poDocument', 'invoiceDocument']
  },
  po_received: {
    title: 'Move to PO Received',
    description: 'Please provide shipping and testing details',
    fields: ['awbNumber', 'leadTimeToLab', 'testingTime', 'readyToShip']
  },
  parts_delivered: {
    title: 'Move to Parts Delivered',
    description: 'Confirm delivery details',
    fields: ['awbNumber']
  }
};

const REGIONS = ['APAC', 'Americas', 'Europe', 'Middle East', 'Africa'];

export const StageTransitionModal: React.FC<StageTransitionModalProps> = ({
  lead,
  targetStage,
  isOpen,
  onClose,
  onConfirm,
  missingFields
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const stageInfo = STAGE_REQUIREMENTS[targetStage];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Opportunity fields
      partNumber: lead.partNumber || '',
      quantity: lead.quantity || 0,
      region: lead.region || '',

      // Quotation shared fields
      value: lead.value || 0,
      grossMargin: lead.grossMargin || 0,
      dealProbability: lead.dealProbability || 0,
      expectedClosureDate: lead.expectedClosureDate || '',
      priceToWin: lead.priceToWin || 0,

      // Negotiation fields
      poDocument: lead.poDocument || '',
      invoiceDocument: lead.invoiceDocument || '',
      specialTerms: lead.specialTerms || '',
      customerRequest: lead.customerRequest || '',
      dhlFedexAccount: lead.dhlFedexAccount || '',

      // PO Received fields
      awbNumber: lead.awbNumber || '',
      leadTimeToLab: lead.leadTimeToLab || 0,
      testingTime: lead.testingTime || 0,
      readyToShip: lead.readyToShip || 0,
    }
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);

    // Filter only the fields that were actually filled or are required for this stage
    const updatedData: Partial<Lead> = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      // Include if: not empty string, not zero (unless it's a valid zero), not null
      if (value !== '' && value !== null && !(typeof value === 'number' && value === 0 && !stageInfo.fields.includes(key as keyof Lead))) {
        (updatedData as any)[key] = value;
      }
    });

    console.log('📝 Form submitted with data:', updatedData);

    try {
      await onConfirm(updatedData);
    } catch (error) {
      console.error('❌ Error in form submit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFieldsByStage = () => {
    switch (targetStage) {
      case 'lead':
        return (
          <div className="text-sm text-gray-600">
            <p>This is the initial stage. All required fields are already filled.</p>
          </div>
        );

      case 'opportunity':
        return (
          <div className="space-y-4">
            <Input
              label="Part Number"
              {...register('partNumber', { required: 'Part number is required' })}
              error={errors.partNumber?.message}
              placeholder="e.g., MAX3040EWE+"
            />
            <Input
              label="Quantity"
              type="number"
              {...register('quantity', {
                required: 'Quantity is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Quantity must be at least 1' }
              })}
              error={errors.quantity?.message}
              placeholder="e.g., 1000"
            />
            <Select
              label="Region"
              options={REGIONS.map(r => ({ value: r, label: r }))}
              {...register('region', { required: 'Region is required' })}
              error={errors.region?.message}
              placeholder="Select region"
            />
          </div>
        );

      case 'quotation_received':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✓ No additional fields required. The quotation record will be created automatically based on the opportunity data.
            </p>
          </div>
        );

      case 'quotation_shared':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Deal Value"
                type="number"
                step="0.01"
                {...register('value', {
                  required: 'Deal value is required',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Value must be positive' }
                })}
                error={errors.value?.message}
                placeholder="0.00"
              />
              <Input
                label="Gross Margin (%)"
                type="number"
                step="0.01"
                {...register('grossMargin', {
                  required: 'Gross margin is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' },
                  max: { value: 100, message: 'Cannot exceed 100%' }
                })}
                error={errors.grossMargin?.message}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Deal Probability (%)"
                type="number"
                {...register('dealProbability', {
                  required: 'Deal probability is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be between 0-100' },
                  max: { value: 100, message: 'Must be between 0-100' }
                })}
                error={errors.dealProbability?.message}
                placeholder="0-100"
              />
              <Input
                label="Expected Closure Date"
                type="date"
                {...register('expectedClosureDate', { required: 'Expected closure date is required' })}
                error={errors.expectedClosureDate?.message}
              />
            </div>
            <Input
              label="Price to Win Order"
              type="number"
              step="0.01"
              {...register('priceToWin', {
                required: 'Price to win is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be positive' }
              })}
              error={errors.priceToWin?.message}
              placeholder="0.00"
            />
          </div>
        );

      case 'negotiation_started':
        return (
          <div className="space-y-4">
            <Input
              label="PO Document URL"
              {...register('poDocument', { required: 'PO document is required' })}
              error={errors.poDocument?.message}
              placeholder="https://example.com/po123.pdf"
            />
            <Input
              label="Invoice Document URL"
              {...register('invoiceDocument', { required: 'Invoice document is required' })}
              error={errors.invoiceDocument?.message}
              placeholder="https://example.com/invoice123.pdf"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Request (Optional)
              </label>
              <textarea
                {...register('customerRequest')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer requests..."
              />
            </div>
            <Input
              label="DHL/FedEx Account Number (Optional)"
              {...register('dhlFedexAccount')}
              placeholder="DHL1234567"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Terms & Conditions (Optional)
              </label>
              <textarea
                {...register('specialTerms')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any special terms..."
              />
            </div>
          </div>
        );

      case 'po_received':
        return (
          <div className="space-y-4">
            <Input
              label="AWB Number"
              {...register('awbNumber', { required: 'AWB number is required' })}
              error={errors.awbNumber?.message}
              placeholder="AWB987654321"
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Lead Time to Lab (days)"
                type="number"
                {...register('leadTimeToLab', {
                  required: 'Lead time is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' }
                })}
                error={errors.leadTimeToLab?.message}
                placeholder="3"
              />
              <Input
                label="Testing Time (days)"
                type="number"
                {...register('testingTime', {
                  required: 'Testing time is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' }
                })}
                error={errors.testingTime?.message}
                placeholder="2"
              />
              <Input
                label="Ready to Ship (days)"
                type="number"
                {...register('readyToShip', {
                  required: 'Ready to ship time is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' }
                })}
                error={errors.readyToShip?.message}
                placeholder="1"
              />
            </div>
          </div>
        );

      case 'parts_delivered':
        return (
          <div className="space-y-4">
            <Input
              label="AWB Number"
              {...register('awbNumber', { required: 'AWB number is required' })}
              error={errors.awbNumber?.message}
              placeholder="AWB987654321"
            />
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckIcon className="w-5 h-5" />
                This is the final stage. Once moved, the deal will be marked as delivered.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No additional fields required for this stage.
          </div>
        );
    }
  };

  // Check if stage requires no fields or all fields are already filled
  const hasNoRequiredFields = stageInfo.fields.length === 0;
  const canProceedDirectly = hasNoRequiredFields && missingFields.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={stageInfo.title} size="lg">
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">{stageInfo.description}</p>
            {missingFields.length > 0 && (
              <p className="text-xs text-blue-700 mt-1">
                Missing fields: <span className="font-semibold">{missingFields.join(', ')}</span>
              </p>
            )}
          </div>
        </div>

        {/* ADD THIS: Dependency Check Warning */}
        {targetStage === 'quotation_shared' && !lead.quotationSupplierId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                ⚠️ Warning: Missing Quotation Supplier ID
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This lead doesn't have a supplier quotation record. Please ensure the lead went through "Quotation Received" stage first.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {renderFieldsByStage()}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {canProceedDirectly ? 'Confirm Move' : 'Save & Move'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};