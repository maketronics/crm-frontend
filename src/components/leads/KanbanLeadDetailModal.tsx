import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentPlusIcon,
  EyeIcon,          // Add this
  PrinterIcon,      // Add this
  DocumentTextIcon  // Add this
} from '@heroicons/react/24/outline';
import { leadService } from '../../lib/leadService';
import { opportunityApi, type Opportunity } from '../../api/opportunityApi';
import { quotationSupplierApi, type QuotationSupplier } from '../../api/quotationSupplierApi';

// Mock mode
const USE_MOCK_DATA = false;

interface LeadDetailModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'basic' | 'parts' | 'supplier-quotes' | 'terms' | 'generate';

export const KanbanLeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [lead, setLead] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [supplierQuotes, setSupplierQuotes] = useState<QuotationSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [showEditOpportunity, setShowEditOpportunity] = useState<string | null>(null);
  const [showAddSupplierQuote, setShowAddSupplierQuote] = useState(false);
  const [showEditSupplierQuote, setShowEditSupplierQuote] = useState<string | null>(null);
  const [terms, setTerms] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  useEffect(() => {
    if (isOpen) {
      loadLeadDetails();
    }
  }, [isOpen, leadId]);

  const loadLeadDetails = async () => {
  try {
    setLoading(true);
    
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLead({
        id: leadId,
        contactPerson: 'John Smith',
        organization: 'TechCorp Industries',
        title: 'Electronic Components Order',
        value: 15000,
        currency: 'USD',
        label: 'HOT',
        owner: 'Kaushik Iyer',
        sourceChannel: 'Website',
        sourceChannelId: 'WEB-001',
        sourceOrigin: 'Contact Form',
        expectedCloseDate: '2025-12-15',
        leadCreated: '2024-12-01T10:00:00Z',
        personDetails: {
          name: 'John Smith',
          phone: '+1 234 567 8900',
          email: 'john@techcorp.com',
          targetSegment: 'Enterprise'
        },
        stage: 'OPPORTUNITY'
      });
      
      setOpportunities([
        {
          id: '1',
          partNumber: 'PN-45892-A',
          quantity: 150,
          regionCountry: 'Germany'
        },
        {
          id: '2',
          partNumber: 'PN-78945-B',
          quantity: 200,
          regionCountry: 'USA'
        }
      ]);

      setSupplierQuotes([
        {
          id: '1',
          partNumber: 'PN-45892-A',
          supplierName: 'Global Electronics',
          manufacturer: 'Intel',
          quantity: 150,
          amount: 12500,
          testingType: 'Electrical',
          estimatedDate: '2025-01-15',
          rohsCompliant: true,
          notes: {
            text: 'Sample quotation',
            fileUrls: []
          },
          stage: 'QUOTATION_RECEIVED_FROM_SUPPLIER'
        }
      ]);

      setTerms('Standard payment terms: Net 30 days\nShipping: FOB Origin\nWarranty: 1 year manufacturer warranty');
    } else {
      const leadData = await leadService.getLeadById(leadId);
      setLead(leadData);
      
      // Try to load opportunities, but don't fail if it errors
      try {
        const opps = await opportunityApi.getAll();
        setOpportunities(opps);
      } catch (oppError) {
        console.warn('Failed to load opportunities:', oppError);
        setOpportunities([]);
      }
      
      // Try to load supplier quotes, but don't fail if it errors
      try {
        const quotes = await quotationSupplierApi.getAll();
        setSupplierQuotes(quotes);
      } catch (quoteError) {
        console.warn('Failed to load supplier quotes:', quoteError);
        setSupplierQuotes([]);
      }
    }
  } catch (error) {
    console.error('Failed to load lead details:', error);
    // Show error to user but don't crash
    alert('Failed to load some lead details. Please try refreshing the page.');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic' as TabType, name: 'Basic Details', icon: UserIcon },
    { id: 'parts' as TabType, name: 'Parts Details', icon: BuildingOfficeIcon },
    { id: 'supplier-quotes' as TabType, name: 'Supplier Quotes', icon: CurrencyDollarIcon },
    { id: 'terms' as TabType, name: 'Terms & Conditions', icon: DocumentPlusIcon },
    { id: 'generate' as TabType, name: 'Generate Documents', icon: DocumentPlusIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {lead?.title || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{lead?.organization}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <>
              {/* Basic Details Tab */}
              {activeTab === 'basic' && (
                <BasicDetailsTab lead={lead} />
              )}

              {/* Parts Details Tab */}
              {activeTab === 'parts' && (
                <PartsDetailsTab
                  leadId={leadId}
                  opportunities={opportunities}
                  onRefresh={loadLeadDetails}
                  showAdd={showAddOpportunity}
                  setShowAdd={setShowAddOpportunity}
                  editingId={showEditOpportunity}
                  setEditingId={setShowEditOpportunity}
                />
              )}

              {/* Supplier Quotes Tab */}
              {activeTab === 'supplier-quotes' && (
                <SupplierQuotesTab
                  leadId={leadId}
                  quotes={supplierQuotes}
                  onRefresh={loadLeadDetails}
                  showAdd={showAddSupplierQuote}
                  setShowAdd={setShowAddSupplierQuote}
                  editingId={showEditSupplierQuote}
                  setEditingId={setShowEditSupplierQuote}
                />
              )}

              {/* Terms & Conditions Tab */}
              {activeTab === 'terms' && (
                <TermsTab
                  terms={terms}
                  setTerms={setTerms}
                  newTerm={newTerm}
                  setNewTerm={setNewTerm}
                />
              )}

              {/* Generate Documents Tab */}
              {activeTab === 'generate' && (
                <GenerateTab lead={lead} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Basic Details Tab Component
const BasicDetailsTab: React.FC<{ lead: any }> = ({ lead }) => {
  return (
    <div className="space-y-6">
      {/* Customer Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="text-base font-medium text-gray-900">{lead.contactPerson}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-base font-medium text-gray-900">{lead.personDetails.name}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Organization</p>
              <p className="text-base font-medium text-gray-900">{lead.organization}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-base font-medium text-gray-900">{lead.personDetails.phone}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{lead.personDetails.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Deal Value</p>
              <p className="text-base font-medium text-gray-900">
                {lead.currency} {lead.value?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Created By & Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="text-base font-medium text-gray-900">{lead.owner}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(lead.leadCreated).toLocaleString()}
              </p>
            </div>
          </div>

          {lead.expectedCloseDate && (
            <div className="flex items-start space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Expected Close Date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(lead.expectedCloseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <div className={`w-5 h-5 rounded-full mt-0.5 ${
              lead.label === 'HOT' ? 'bg-red-500' :
              lead.label === 'WARM' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className="text-base font-medium text-gray-900">{lead.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parts Details Tab Component
const PartsDetailsTab: React.FC<{
  leadId: string;
  opportunities: Opportunity[];
  onRefresh: () => void;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}> = ({ leadId, opportunities, onRefresh, showAdd, setShowAdd, editingId, setEditingId }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    quantity: '',
    regionCountry: ''
  });
  const [saving, setSaving] = useState(false);

  const handleAddOpportunity = async () => {
    try {
      setSaving(true);
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Opportunity created successfully (mock mode)');
      } else {
        await opportunityApi.create(leadId, {
          partNumber: formData.partNumber,
          quantity: parseFloat(formData.quantity),
          regionCountry: formData.regionCountry
        });
      }
      
      setFormData({ partNumber: '', quantity: '', regionCountry: '' });
      setShowAdd(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create opportunity:', error);
      alert('Failed to create opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOpportunity = async (id: string) => {
    try {
      setSaving(true);
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Opportunity updated successfully (mock mode)');
      } else {
        await opportunityApi.update(id, {
          partNumber: formData.partNumber,
          quantity: parseFloat(formData.quantity),
          regionCountry: formData.regionCountry
        });
      }
      
      setEditingId(null);
      setFormData({ partNumber: '', quantity: '', regionCountry: '' });
      onRefresh();
    } catch (error) {
      console.error('Failed to update opportunity:', error);
      alert('Failed to update opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Opportunity deleted successfully (mock mode)');
      } else {
        await opportunityApi.delete(id);
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
      alert('Failed to delete opportunity');
    }
  };

  const startEdit = (opp: Opportunity) => {
    setEditingId(opp.id!);
    setFormData({
      partNumber: opp.partNumber,
      quantity: opp.quantity.toString(),
      regionCountry: opp.regionCountry
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Parts & Opportunities</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Part</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editingId) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">
            {editingId ? 'Edit Part Details' : 'Add New Part'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="PN-45892-A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region/Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.regionCountry}
                onChange={(e) => setFormData({ ...formData, regionCountry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Germany"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAdd(false);
                setEditingId(null);
                setFormData({ partNumber: '', quantity: '', regionCountry: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => editingId ? handleUpdateOpportunity(editingId) : handleAddOpportunity()}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Part')}
            </button>
          </div>
        </div>
      )}

      {/* Parts List */}
      <div className="space-y-3">
        {opportunities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No parts added yet</p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Part Number</p>
                    <p className="font-medium text-gray-900">{opp.partNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">{opp.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Region/Country</p>
                    <p className="font-medium text-gray-900">{opp.regionCountry}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(opp)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOpportunity(opp.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Supplier Quotes Tab Component
const SupplierQuotesTab: React.FC<{
  leadId: string;
  quotes: QuotationSupplier[];
  onRefresh: () => void;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}> = ({ leadId, quotes, onRefresh, showAdd, setShowAdd, editingId, setEditingId }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    supplierName: '',
    manufacturer: '',
    quantity: '',
    amount: '',
    testingType: '',
    estimatedDate: '',
    rohsCompliant: false,
    notesText: ''
  });
  const [saving, setSaving] = useState(false);

  const handleAddQuote = async () => {
    try {
      setSaving(true);
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Supplier quote created successfully (mock mode)');
      } else {
        await quotationSupplierApi.create(leadId, {
          partNumber: formData.partNumber,
          supplierName: formData.supplierName,
          manufacturer: formData.manufacturer,
          quantity: parseFloat(formData.quantity),
          amount: parseFloat(formData.amount),
          testingType: formData.testingType,
          estimatedDate: formData.estimatedDate || undefined,
          rohsCompliant: formData.rohsCompliant,
          notesText: formData.notesText || undefined
        });
      }
      
      setFormData({
        partNumber: '',
        supplierName: '',
        manufacturer: '',
        quantity: '',
        amount: '',
        testingType: '',
        estimatedDate: '',
        rohsCompliant: false,
        notesText: ''
      });
      setShowAdd(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create supplier quote:', error);
      alert('Failed to create supplier quote');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuote = async (id: string) => {
    try {
      setSaving(true);
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Supplier quote updated successfully (mock mode)');
      } else {
        await quotationSupplierApi.update(id, {
          partNumber: formData.partNumber,
          supplierName: formData.supplierName,
          manufacturer: formData.manufacturer,
          quantity: parseFloat(formData.quantity),
          amount: parseFloat(formData.amount),
          testingType: formData.testingType,
          estimatedDate: formData.estimatedDate || undefined,
          rohsCompliant: formData.rohsCompliant,
          notesText: formData.notesText || undefined
        });
      }
      
      setEditingId(null);
      setFormData({
        partNumber: '',
        supplierName: '',
        manufacturer: '',
        quantity: '',
        amount: '',
        testingType: '',
        estimatedDate: '',
        rohsCompliant: false,
        notesText: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to update supplier quote:', error);
      alert('Failed to update supplier quote');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier quote?')) return;
    
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Supplier quote deleted successfully (mock mode)');
      } else {
        await quotationSupplierApi.delete(id);
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to delete supplier quote:', error);
      alert('Failed to delete supplier quote');
    }
  };

  const startEdit = (quote: QuotationSupplier) => {
    setEditingId(quote.id!);
    setFormData({
      partNumber: quote.partNumber,
      supplierName: quote.supplierName,
      manufacturer: quote.manufacturer,
      quantity: quote.quantity.toString(),
      amount: quote.amount.toString(),
      testingType: quote.testingType,
      estimatedDate: quote.estimatedDate || '',
      rohsCompliant: quote.rohsCompliant || false,
      notesText: quote.notes?.text || ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Supplier Quotations</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Supplier Quote</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editingId) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">
            {editingId ? 'Edit Supplier Quote' : 'Add New Supplier Quote'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="PN-45892-A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Global Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Intel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="12500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Testing Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.testingType}
                onChange={(e) => setFormData({ ...formData, testingType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Electrical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Date
              </label>
              <input
                type="date"
                value={formData.estimatedDate}
                onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                checked={formData.rohsCompliant}
                onChange={(e) => setFormData({ ...formData, rohsCompliant: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                RoHS Compliant
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notesText}
              onChange={(e) => setFormData({ ...formData, notesText: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAdd(false);
                setEditingId(null);
                setFormData({
                  partNumber: '',
                  supplierName: '',
                  manufacturer: '',
                  quantity: '',
                  amount: '',
                  testingType: '',
                  estimatedDate: '',
                  rohsCompliant: false,
                  notesText: ''
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => editingId ? handleUpdateQuote(editingId) : handleAddQuote()}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Quote')}
            </button>
          </div>
        </div>
      )}
      
      {/* Quotes List */}
      {quotes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No supplier quotations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-500">Part Number</p>
                    <p className="font-medium text-gray-900">{quote.partNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="font-medium text-gray-900">{quote.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manufacturer</p>
                    <p className="font-medium text-gray-900">{quote.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">{quote.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">${quote.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Testing Type</p>
                    <p className="font-medium text-gray-900">{quote.testingType}</p>
                  </div>
                  {quote.estimatedDate && (
                    <div>
                      <p className="text-sm text-gray-500">Estimated Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(quote.estimatedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">RoHS Compliant</p>
                    <p className="font-medium text-gray-900">
                      {quote.rohsCompliant ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(quote)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuote(quote.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {quote.notes?.text && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{quote.notes.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Terms & Conditions Tab Component
const TermsTab: React.FC<{
  terms: string;
  setTerms: (terms: string) => void;
  newTerm: string;
  setNewTerm: (term: string) => void;
}> = ({ terms, setTerms, newTerm, setNewTerm }) => {
  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setTerms(terms + (terms ? '\n' : '') + newTerm);
      setNewTerm('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter terms and conditions..."
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Add New Term</h4>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter new term..."
          />
          <button
            onClick={handleAddTerm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// Generate Documents Tab Component
// Add this to your KanbanLeadDetailModal.tsx after all the existing tab components

// Replace the GenerateTab component with this updated version
const GenerateTab: React.FC<{ lead: any }> = ({ lead }) => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  if (showInvoiceForm) {
    return <InvoiceForm leadId={lead.id} onBack={() => setShowInvoiceForm(false)} />;
  }

  const documents = [
    { 
      id: 'invoice', 
      name: 'Invoice/Purchase Order', 
      description: 'Generate invoice or purchase order document', 
      action: () => setShowInvoiceForm(true) 
    },
    { 
      id: 'quotation', 
      name: 'Quotation', 
      description: 'Generate customer quotation', 
      action: () => alert('Quotation generation coming soon') 
    },
    { 
      id: 'contract', 
      name: 'Contract', 
      description: 'Generate contract document', 
      action: () => alert('Contract generation coming soon') 
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Generate Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={doc.action}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-indigo-300 transition-all text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {doc.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
              </div>
              <DocumentPlusIcon className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Add this InvoiceForm component (place it before the closing export)
const InvoiceForm: React.FC<{ leadId: string; onBack: () => void }> = ({ leadId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<{ html: string; message: string } | null>(null);
  const [formData, setFormData] = useState({
    registeredOffice: 'Bangalore Head Office, India',
    title: 'PURCHASE_ORDER' as 'PURCHASE_ORDER' | 'INVOICE' | 'QUOTATION',
    incoterms: 'EXW',
    paymentTerms: 'Net 30',
    dueDate: '',
    customerDetails: { name: '', email: '', address: '', tel: '', taxId: '' },
    partDetailsList: [{
      partNumber: '', manufacturer: '', shortDescription: '', DC: '', HSNcode: '',
      quantity: '', units: 'PCS', pricePerUnit: '', currency: 'INR', leadTime: '', total: '0'
    }],
    discount: '', additionalCharges: '', tax: '', balanceDue: '',
    bankDetailsType: 'IN' as 'IN' | 'UAE',
    bankDetailsIn: { accountName: '', bankName: '', branchAddress: '', accountNumber: '', swiftCode: '', ifscCode: '' },
    bankDetailsUae: { accountName: '', bankName: '', branchAddress: '', accountNumber: '', ibanNumber: '', swiftCode: '' }
  });

  const addPart = () => setFormData({ 
    ...formData, 
    partDetailsList: [...formData.partDetailsList, {
      partNumber: '', manufacturer: '', shortDescription: '', DC: '', HSNcode: '',
      quantity: '', units: 'PCS', pricePerUnit: '', currency: 'INR', leadTime: '', total: '0'
    }]
  });

  const removePart = (i: number) => setFormData({ 
    ...formData, 
    partDetailsList: formData.partDetailsList.filter((_, idx) => idx !== i) 
  });

  const updatePart = (i: number, field: string, value: any) => {
    const parts = [...formData.partDetailsList];
    parts[i] = { ...parts[i], [field]: value };
    if (field === 'quantity' || field === 'pricePerUnit') {
      const qty = parseFloat(parts[i].quantity) || 0;
      const price = parseFloat(parts[i].pricePerUnit) || 0;
      parts[i].total = (qty * price).toFixed(2);
    }
    setFormData({ ...formData, partDetailsList: parts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare request body - remove bankDetailsType and include only selected bank
      const body: any = {
        registeredOffice: formData.registeredOffice,
        title: formData.title,
        incoterms: formData.incoterms,
        paymentTerms: formData.paymentTerms,
        dueDate: formData.dueDate,
        customerDetails: formData.customerDetails,
        partDetailsList: formData.partDetailsList.map(part => ({
          ...part,
          quantity: part.quantity.toString(),
          pricePerUnit: parseFloat(part.pricePerUnit) || 0,
          total: part.total
        })),
        discount: parseFloat(formData.discount) || 0,
        additionalCharges: parseFloat(formData.additionalCharges) || 0,
        tax: parseFloat(formData.tax) || 0,
        balanceDue: parseFloat(formData.balanceDue) || 0,
      };

      // Add only the selected bank details
      if (formData.bankDetailsType === 'UAE') {
        body.bankDetailsUae = formData.bankDetailsUae;
      } else {
        body.bankDetailsIn = formData.bankDetailsIn;
      }

      console.log('Sending invoice request:', body);

      const response = await fetch(
        `https://crm-dev0-template-and-tracking-service-v1.make-tronics.com/invoice/create/${leadId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Invoice generation failed:', errorData);
        throw new Error(errorData.message || 'Failed to generate invoice');
      }

      const data = await response.json();
      console.log('Invoice generated successfully:', data);
      
      setGenerated({ 
        html: data.html || data.template || '', 
        message: data.message || 'Invoice generated successfully!' 
      });
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      alert(error.message || 'Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If invoice is generated, show preview
  if (generated) {
    return (
      <div className="space-y-4">
        <button 
          onClick={onBack} 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Documents
        </button>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{generated.message}</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => { 
              const w = window.open('', '_blank'); 
              if (w) {
                w.document.write(generated.html); 
                w.document.close();
              }
            }}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
          >
            <EyeIcon className="w-5 h-5" />
            <span>View Invoice</span>
          </button>
          
          <button 
            onClick={() => { 
              const w = window.open('', '_blank'); 
              if (w) {
                w.document.write(generated.html); 
                w.document.close(); 
                w.print();
              }
            }}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Print Invoice</span>
          </button>
          
          <button 
            onClick={() => setGenerated(null)} 
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Generate Another
          </button>
        </div>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div 
            className="p-4 max-h-[600px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: generated.html }} 
          />
        </div>
      </div>
    );
  }

  // Show the form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button 
        type="button" 
        onClick={onBack} 
        className="text-indigo-600 hover:text-indigo-800 font-medium"
      >
        ← Back to Documents
      </button>
      
      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registered Office <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              value={formData.registeredOffice} 
              onChange={(e) => setFormData({ ...formData, registeredOffice: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value as any })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="PURCHASE_ORDER">Purchase Order</option>
              <option value="INVOICE">Invoice</option>
              <option value="QUOTATION">Quotation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incoterms <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              value={formData.incoterms} 
              onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="EXW, FOB, CIF, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              value={formData.paymentTerms} 
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Net 30, Net 60, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="date" 
              value={formData.dueDate} 
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              value={formData.customerDetails.name} 
              onChange={(e) => setFormData({ ...formData, customerDetails: { ...formData.customerDetails, name: e.target.value }})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ABC Technologies Pvt Ltd"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="email" 
              value={formData.customerDetails.email} 
              onChange={(e) => setFormData({ ...formData, customerDetails: { ...formData.customerDetails, email: e.target.value }})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="accounts@company.com"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea 
              required 
              value={formData.customerDetails.address} 
              onChange={(e) => setFormData({ ...formData, customerDetails: { ...formData.customerDetails, address: e.target.value }})} 
              rows={2} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="123 Business Park, City, Country"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telephone
            </label>
            <input 
              type="tel" 
              value={formData.customerDetails.tel} 
              onChange={(e) => setFormData({ ...formData, customerDetails: { ...formData.customerDetails, tel: e.target.value }})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+91-9876543210"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / GST Number
            </label>
            <input 
              value={formData.customerDetails.taxId} 
              onChange={(e) => setFormData({ ...formData, customerDetails: { ...formData.customerDetails, taxId: e.target.value }})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="29ABCDE1234F1Z5"
            />
          </div>
        </div>
      </div>

      {/* Part Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Part Details</h3>
          <button 
            type="button" 
            onClick={addPart} 
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Part</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.partDetailsList.map((part, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Part {i + 1}</h4>
                {formData.partDetailsList.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removePart(i)} 
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.partNumber} 
                    onChange={(e) => updatePart(i, 'partNumber', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="PN-1001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.manufacturer} 
                    onChange={(e) => updatePart(i, 'manufacturer', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Texas Instruments"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.shortDescription} 
                    onChange={(e) => updatePart(i, 'shortDescription', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Voltage Regulator IC"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Code (DC) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.DC} 
                    onChange={(e) => updatePart(i, 'DC', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HSN Code
                  </label>
                  <input 
                    value={part.HSNcode} 
                    onChange={(e) => updatePart(i, 'HSNcode', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="85423190"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.quantity} 
                    onChange={(e) => updatePart(i, 'quantity', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.units} 
                    onChange={(e) => updatePart(i, 'units', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="PCS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Unit <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={part.pricePerUnit} 
                    onChange={(e) => updatePart(i, 'pricePerUnit', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="125.50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required 
                    value={part.currency} 
                    onChange={(e) => updatePart(i, 'currency', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Time <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={part.leadTime} 
                    onChange={(e) => updatePart(i, 'leadTime', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="2 weeks"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input 
                    value={part.total} 
                    readOnly 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.discount} 
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Charges</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.additionalCharges} 
              onChange={(e) => setFormData({ ...formData, additionalCharges: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.tax} 
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.balanceDue} 
              onChange={(e) => setFormData({ ...formData, balanceDue: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Bank Location <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                value="IN" 
                checked={formData.bankDetailsType === 'IN'} 
                onChange={() => setFormData({ ...formData, bankDetailsType: 'IN' })} 
                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">India (IN)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                value="UAE" 
                checked={formData.bankDetailsType === 'UAE'} 
                onChange={() => setFormData({ ...formData, bankDetailsType: 'UAE' })} 
                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">UAE</span>
            </label>
          </div>
        </div>

        {formData.bankDetailsType === 'IN' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsIn.accountName} 
                onChange={(e) => setFormData({ ...formData, bankDetailsIn: { ...formData.bankDetailsIn, accountName: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsIn.bankName} 
                onChange={(e) => setFormData({ ...formData, bankDetailsIn: { ...formData.bankDetailsIn, bankName: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="HDFC Bank"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Address <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsIn.branchAddress} 
                onChange={(e) => setFormData({ ...formData, bankDetailsIn: { ...formData.bankDetailsIn, branchAddress: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="123 MG Road, Bangalore, Karnataka 560001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsIn.accountNumber} 
                onChange={(e) => setFormData({ ...formData, bankDetailsIn: { ...formData.bankDetailsIn, accountNumber: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="50100123456789"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SWIFT Code <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsIn.swiftCode} 
                onChange={(e) => setFormData({ ...formData, bankDetailsIn: { ...formData.bankDetailsIn, swiftCode: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="HDFCINBB"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsIn.ifscCode} 
                onChange={(e) => setFormData({ ...formData, bankDetailsIn: { ...formData.bankDetailsIn, ifscCode: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="HDFC0001234"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsUae.accountName} 
                onChange={(e) => setFormData({ ...formData, bankDetailsUae: { ...formData.bankDetailsUae, accountName: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Maketronics DMCC"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsUae.bankName} 
                onChange={(e) => setFormData({ ...formData, bankDetailsUae: { ...formData.bankDetailsUae, bankName: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Emirates NBD"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Address <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsUae.branchAddress} 
                onChange={(e) => setFormData({ ...formData, bankDetailsUae: { ...formData.bankDetailsUae, branchAddress: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Dubai Branch"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsUae.accountNumber} 
                onChange={(e) => setFormData({ ...formData, bankDetailsUae: { ...formData.bankDetailsUae, accountNumber: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="1234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IBAN Number <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsUae.ibanNumber} 
                onChange={(e) => setFormData({ ...formData, bankDetailsUae: { ...formData.bankDetailsUae, ibanNumber: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="AE070331234567890123456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SWIFT Code <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={formData.bankDetailsUae.swiftCode} 
                onChange={(e) => setFormData({ ...formData, bankDetailsUae: { ...formData.bankDetailsUae, swiftCode: e.target.value }})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="EBILAEAD"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onBack} 
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <DocumentTextIcon className="w-5 h-5" />
              <span>Generate Invoice</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};