import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { opportunityApi } from '../../api/opportunityApi';
import { negotiationApi } from '../../api/negotiationApi';
import { quotationSupplierApi } from '../../api/quotationSupplierApi';
import { quotationCustomerApi } from '../../api/quotationCustomerApi';
import { poReceivedApi } from '../../api/poReceivedApi';
import { partsDeliveredApi } from '../../api/partsDeliveredApi';

interface KanbanLeadDetailModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
}

type Stage = 'LEAD' | 'OPPORTUNITY' | 'QUOTATION_RECEIVED_FROM_SUPPLIER' | 
  'QUOTATION_SHARED_WITH_CUSTOMER' | 'NEGOTIATION_STARTED' | 'PO_RECEIVED' | 'PARTS_DELIVERED';

export const KanbanLeadDetailModal: React.FC<KanbanLeadDetailModalProps> = ({
  leadId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [stageData, setStageData] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<Stage>('LEAD');

  useEffect(() => {
    if (isOpen && leadId) {
      loadStageData();
    }
  }, [isOpen, leadId]);

  const loadStageData = async () => {
    setLoading(true);
    try {
      // Try to fetch data from all stage endpoints to determine current stage
      const [opportunity, negotiation, quotationSupplier, quotationCustomer, poReceived, partsDelivered] = 
        await Promise.allSettled([
          opportunityApi.getById(leadId),
          negotiationApi.getById(leadId),
          quotationSupplierApi.getById(leadId),
          quotationCustomerApi.getById(leadId),
          poReceivedApi.getById(leadId),
          partsDeliveredApi.getById(leadId),
        ]);

      // Determine stage based on which API returned data
      if (partsDelivered.status === 'fulfilled') {
        setCurrentStage('PARTS_DELIVERED');
        setStageData(partsDelivered.value);
      } else if (poReceived.status === 'fulfilled') {
        setCurrentStage('PO_RECEIVED');
        setStageData(poReceived.value);
      } else if (quotationCustomer.status === 'fulfilled') {
        setCurrentStage('QUOTATION_SHARED_WITH_CUSTOMER');
        setStageData(quotationCustomer.value);
      } else if (negotiation.status === 'fulfilled') {
        setCurrentStage('NEGOTIATION_STARTED');
        setStageData(negotiation.value);
      } else if (quotationSupplier.status === 'fulfilled') {
        setCurrentStage('QUOTATION_RECEIVED_FROM_SUPPLIER');
        setStageData(quotationSupplier.value);
      } else if (opportunity.status === 'fulfilled') {
        setCurrentStage('OPPORTUNITY');
        setStageData(opportunity.value);
      } else {
        setCurrentStage('LEAD');
        setStageData(null);
      }
    } catch (error) {
      console.error('Failed to load stage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStageContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      );
    }

    if (!stageData) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No data available for this lead yet.</p>
          <p className="text-sm mt-2">This lead is in the initial stage.</p>
        </div>
      );
    }

    switch (currentStage) {
      case 'OPPORTUNITY':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Opportunity Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Part Number</label>
                <p className="text-gray-900">{stageData.partNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p className="text-gray-900">{stageData.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Region/Country</label>
                <p className="text-gray-900">{stageData.regionCountry}</p>
              </div>
            </div>
          </div>
        );

      case 'QUOTATION_RECEIVED_FROM_SUPPLIER':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Supplier Quotation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Part Number</label>
                <p className="text-gray-900">{stageData.partNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Supplier Name</label>
                <p className="text-gray-900">{stageData.supplierName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Manufacturer</label>
                <p className="text-gray-900">{stageData.manufacturer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p className="text-gray-900">{stageData.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-gray-900">${stageData.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Testing Type</label>
                <p className="text-gray-900">{stageData.testingType}</p>
              </div>
              {stageData.estimatedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Estimated Date</label>
                  <p className="text-gray-900">{stageData.estimatedDate}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">RoHS Compliant</label>
                <p className="text-gray-900">{stageData.rohsCompliant ? 'Yes' : 'No'}</p>
              </div>
            </div>
            {stageData.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900 mt-1">{stageData.notes.text}</p>
                {stageData.notes.fileUrls?.length > 0 && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-600">Attachments</label>
                    {stageData.notes.fileUrls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-sm"
                      >
                        Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'QUOTATION_SHARED_WITH_CUSTOMER':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Quotation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Model</label>
                <p className="text-gray-900">{stageData.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Brand</label>
                <p className="text-gray-900">{stageData.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{stageData.des}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Country of Origin</label>
                <p className="text-gray-900">{stageData.coo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date Code</label>
                <p className="text-gray-900">{stageData.dc}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p className="text-gray-900">{stageData.qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quote</label>
                <p className="text-gray-900">{stageData.quote}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Warranty</label>
                <p className="text-gray-900">{stageData.warranty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Lead Time</label>
                <p className="text-gray-900">{stageData.leadTime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Deal Value</label>
                <p className="text-gray-900">${stageData.dealValue.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Value</label>
                <p className="text-gray-900">${stageData.totalValue.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gross Margin</label>
                <p className="text-gray-900">${stageData.grossMargin.toFixed(2)}</p>
              </div>
              {stageData.dealProbability !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Deal Probability</label>
                  <p className="text-gray-900">{stageData.dealProbability}%</p>
                </div>
              )}
              {stageData.expectedClosureDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Expected Closure</label>
                  <p className="text-gray-900">{stageData.expectedClosureDate}</p>
                </div>
              )}
            </div>
            {stageData.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900 mt-1">{stageData.notes.text}</p>
              </div>
            )}
          </div>
        );

      case 'NEGOTIATION_STARTED':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Negotiation Details</h3>
            {stageData.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Negotiation Notes</label>
                <p className="text-gray-900 mt-1">{stageData.notes.text}</p>
                {stageData.notes.fileUrls?.length > 0 && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-600">Documents</label>
                    {stageData.notes.fileUrls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-sm"
                      >
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'PO_RECEIVED':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Purchase Order Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">PO Document</label>
                <a
                  href={stageData.poDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  View PO Document
                </a>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">DHL/FedEx Account</label>
                <p className="text-gray-900">{stageData.dhlFedexAccountNumber}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Special Terms & Conditions</label>
                <p className="text-gray-900">{stageData.specialTermsAndConditions}</p>
              </div>
            </div>
            {stageData.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900 mt-1">{stageData.notes.text}</p>
              </div>
            )}
          </div>
        );

      case 'PARTS_DELIVERED':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Parts Delivered</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Model</label>
                <p className="text-gray-900">{stageData.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p className="text-gray-900">{stageData.qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Price per Unit</label>
                <p className="text-gray-900">${stageData.pricePerUnit.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date Code</label>
                <p className="text-gray-900">{stageData.dc}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Lead Time</label>
                <p className="text-gray-900">{stageData.leadTime}</p>
              </div>
              {stageData.deliveredAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivered At</label>
                  <p className="text-gray-900">{stageData.deliveredAt}</p>
                </div>
              )}
            </div>
            {stageData.note && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Delivery Notes</label>
                <p className="text-gray-900 mt-1">{stageData.note.text}</p>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Unknown stage</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lead Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Current Stage: <span className="font-medium">{currentStage.replace(/_/g, ' ')}</span>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderStageContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};