import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface StageTransitionModalProps {
  leadId: string;
  leadTitle: string;
  currentStage: string;
  targetStage: string;
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
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getStageDisplayName = (stage: string) => {
    const names: Record<string, string> = {
      'OPPORTUNITY': 'Opportunity',
      'QUOTATION_RECEIVED_FROM_SUPPLIER': 'Quotation Received from Supplier',
      'QUOTATION_SHARED_WITH_CUSTOMER': 'Quotation Shared with Customer',
      'NEGOTIATION_STARTED': 'Negotiation Started',
      'PO_RECEIVED': 'PO Received',
      'PARTS_DELIVERED': 'Parts Delivered'
    };
    return names[stage] || stage;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
      setFormData((prev: any) => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Merge files into formData
      const submitData = { ...formData, ...files };
      await onConfirm(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to move lead to next stage');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldInput = (field: string) => {
    // Opportunity fields
    if (targetStage === 'OPPORTUNITY') {
      switch (field) {
        case 'partNumber':
          return (
            <input
              type="text"
              value={formData.partNumber || ''}
              onChange={(e) => handleInputChange('partNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., PN-45892-A"
              required
            />
          );
        case 'quantity':
          return (
            <input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 150"
              required
            />
          );
        case 'regionCountry':
          return (
            <input
              type="text"
              value={formData.regionCountry || ''}
              onChange={(e) => handleInputChange('regionCountry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Germany"
              required
            />
          );
      }
    }

    // Quotation Supplier fields
    if (targetStage === 'QUOTATION_RECEIVED_FROM_SUPPLIER') {
      switch (field) {
        case 'partNumber':
          return (
            <input
              type="text"
              value={formData.partNumber || ''}
              onChange={(e) => handleInputChange('partNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'supplierName':
          return (
            <input
              type="text"
              value={formData.supplierName || ''}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'manufacturer':
          return (
            <input
              type="text"
              value={formData.manufacturer || ''}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'quantity':
          return (
            <input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'amount':
          return (
            <input
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'testingType':
          return (
            <input
              type="text"
              value={formData.testingType || ''}
              onChange={(e) => handleInputChange('testingType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Electrical"
              required
            />
          );
      }
    }

    // Quotation Customer fields
    if (targetStage === 'QUOTATION_SHARED_WITH_CUSTOMER') {
      switch (field) {
        case 'model':
        case 'brand':
        case 'des':
        case 'coo':
        case 'dc':
        case 'quote':
        case 'warranty':
        case 'leadTime':
          return (
            <input
              type="text"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'qty':
          return (
            <input
              type="number"
              value={formData.qty || ''}
              onChange={(e) => handleInputChange('qty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'dealValue':
        case 'totalValue':
        case 'grossMargin':
          return (
            <input
              type="number"
              step="0.01"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
      }
    }

    // PO Received fields
    if (targetStage === 'PO_RECEIVED') {
      switch (field) {
        case 'poDocument':
          return (
            <div>
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                <DocumentArrowUpIcon className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {files.poDocument ? files.poDocument.name : 'Upload PO Document'}
                </span>
                <input
                  type="file"
                  onChange={(e) => handleFileChange('poDocument', e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
              </label>
            </div>
          );
        case 'specialTermsAndConditions':
        case 'dhlFedexAccountNumber':
          return (
            <input
              type="text"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
      }
    }

    // Parts Delivered fields
    if (targetStage === 'PARTS_DELIVERED') {
      switch (field) {
        case 'model':
        case 'dc':
        case 'leadTime':
          return (
            <input
              type="text"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'qty':
          return (
            <input
              type="number"
              value={formData.qty || ''}
              onChange={(e) => handleInputChange('qty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
        case 'pricePerUnit':
          return (
            <input
              type="number"
              step="0.01"
              value={formData.pricePerUnit || ''}
              onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          );
      }
    }

    // Default text input
    return (
      <input
        type="text"
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        required
      />
    );
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      partNumber: 'Part Number',
      quantity: 'Quantity',
      regionCountry: 'Region/Country',
      supplierName: 'Supplier Name',
      manufacturer: 'Manufacturer',
      amount: 'Amount',
      testingType: 'Testing Type',
      model: 'Model',
      brand: 'Brand',
      des: 'Description',
      coo: 'Country of Origin',
      dc: 'Date Code',
      qty: 'Quantity',
      quote: 'Quote Number',
      warranty: 'Warranty',
      leadTime: 'Lead Time',
      dealValue: 'Deal Value',
      totalValue: 'Total Value',
      grossMargin: 'Gross Margin',
      poDocument: 'PO Document',
      specialTermsAndConditions: 'Special Terms & Conditions',
      dhlFedexAccountNumber: 'DHL/FedEx Account Number',
      pricePerUnit: 'Price Per Unit'
    };
    return labels[field] || field.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Move to {getStageDisplayName(targetStage)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{leadTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Please provide the following information to move this lead to <strong>{getStageDisplayName(targetStage)}</strong>
            </p>
          </div>

          <div className="space-y-4">
            {missingFields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getFieldLabel(field)} <span className="text-red-500">*</span>
                </label>
                {renderFieldInput(field)}
              </div>
            ))}

            {/* Optional fields */}
            {(targetStage === 'QUOTATION_RECEIVED_FROM_SUPPLIER' || 
              targetStage === 'QUOTATION_SHARED_WITH_CUSTOMER' ||
              targetStage === 'NEGOTIATION_STARTED' ||
              targetStage === 'PO_RECEIVED' ||
              targetStage === 'PARTS_DELIVERED') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notesText || ''}
                    onChange={(e) => handleInputChange('notesText', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach File (Optional)
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                    <DocumentArrowUpIcon className="w-6 h-6 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {files.notesFile ? files.notesFile.name : 'Upload supporting document'}
                    </span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('notesFile', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Moving...' : `Move to ${getStageDisplayName(targetStage)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};