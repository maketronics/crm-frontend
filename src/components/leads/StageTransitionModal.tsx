import React, { useState } from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

type Stage = 'LEAD' | 'OPPORTUNITY' | 'QUOTATION_RECEIVED_FROM_SUPPLIER' | 
  'QUOTATION_SHARED_WITH_CUSTOMER' | 'NEGOTIATION_STARTED' | 'PO_RECEIVED' | 'PARTS_DELIVERED';

interface StageTransitionModalProps {
  leadId: string;
  leadTitle: string;
  currentStage: Stage;
  targetStage: Stage;
  missingFields: string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: any) => Promise<void>;
}

export const StageTransitionModal: React.FC<StageTransitionModalProps> = ({
  leadId,
  leadTitle,
  currentStage,
  targetStage,
  missingFields,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add file to formData if present
      const submitData = { ...formData };
      if (file) {
        submitData.file = file;
      }
      
      await onConfirm(submitData);
    } catch (error) {
      console.error('Failed to move lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const renderFormFields = () => {
    switch (targetStage) {
      case 'OPPORTUNITY':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Number *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.partNumber || ''}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="e.g., PN-45892-A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region/Country *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.regionCountry || ''}
                onChange={(e) => handleInputChange('regionCountry', e.target.value)}
                placeholder="e.g., Germany"
              />
            </div>
          </>
        );

      case 'QUOTATION_RECEIVED_FROM_SUPPLIER':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Number *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.partNumber || ''}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.supplierName || ''}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Testing Type *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.testingType || ''}
                onChange={(e) => handleInputChange('testingType', e.target.value)}
              >
                <option value="">Select testing type</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Visual">Visual</option>
                <option value="Functional">Functional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.estimatedDate || ''}
                onChange={(e) => handleInputChange('estimatedDate', e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rohsCompliant"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.rohsCompliant || false}
                onChange={(e) => handleInputChange('rohsCompliant', e.target.checked)}
              />
              <label htmlFor="rohsCompliant" className="ml-2 text-sm text-gray-700">
                RoHS Compliant
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.notesText || ''}
                onChange={(e) => handleInputChange('notesText', e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </>
        );

      case 'QUOTATION_SHARED_WITH_CUSTOMER':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.des || ''}
                onChange={(e) => handleInputChange('des', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.coo || ''}
                onChange={(e) => handleInputChange('coo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Code *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.dc || ''}
                onChange={(e) => handleInputChange('dc', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.qty || ''}
                onChange={(e) => handleInputChange('qty', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.quote || ''}
                onChange={(e) => handleInputChange('quote', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.warranty || ''}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.leadTime || ''}
                onChange={(e) => handleInputChange('leadTime', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value *</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.dealValue || ''}
                onChange={(e) => handleInputChange('dealValue', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Value *</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.totalValue || ''}
                onChange={(e) => handleInputChange('totalValue', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Margin *</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.grossMargin || ''}
                onChange={(e) => handleInputChange('grossMargin', parseFloat(e.target.value))}
              />
            </div>
          </>
        );

      case 'NEGOTIATION_STARTED':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Negotiation Notes
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.notesText || ''}
                onChange={(e) => handleInputChange('notesText', e.target.value)}
                placeholder="Enter negotiation notes..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </>
        );

      case 'PO_RECEIVED':
        return (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Document * (Required)
              </label>
              <input
                type="file"
                required
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Terms & Conditions *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.specialTermsAndConditions || ''}
                onChange={(e) => handleInputChange('specialTermsAndConditions', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DHL/FedEx Account Number *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.dhlFedexAccountNumber || ''}
                onChange={(e) => handleInputChange('dhlFedexAccountNumber', e.target.value)}
              />
            </div>
          </>
        );

      case 'PARTS_DELIVERED':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.qty || ''}
                onChange={(e) => handleInputChange('qty', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit *</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.pricePerUnit || ''}
                onChange={(e) => handleInputChange('pricePerUnit', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Code *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.dc || ''}
                onChange={(e) => handleInputChange('dc', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.leadTime || ''}
                onChange={(e) => handleInputChange('leadTime', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivered At</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.deliveredAt || ''}
                onChange={(e) => handleInputChange('deliveredAt', e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fill Required Information</h2>
            <p className="text-sm text-gray-500 mt-1">
              Moving "{leadTitle}" to {targetStage.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 gap-4">
            {renderFormFields()}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {isSubmitting && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Moving...' : 'Confirm & Move'}
          </button>
        </div>
      </div>
    </div>
  );
};