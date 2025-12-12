import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

// Mock data for development
const MOCK_DEALS = [
  {
    id: '1',
    name: 'OPPORTUNITY',
    conditionType: 'days_in_stage',
    conditionValue: 3,
    actionType: 'sendEmail',
    actionPayload: {
      subject: 'New Opportunity Alert',
      body: 'A new opportunity has been in this stage for 3 days.'
    },
    status: 'active'
  },
  {
    id: '2',
    name: 'NEGOTIATION_STARTED',
    conditionType: 'days_in_stage',
    conditionValue: 7,
    actionType: 'sendEmail',
    actionPayload: {
      subject: 'Negotiation Follow-up',
      body: 'Negotiation has been ongoing for 7 days. Please review.'
    },
    status: 'active'
  }
];

const DEAL_STAGES = [
  'OPPORTUNITY',
  'QUOTATION_RECEIVED_FROM_SUPPLIER',
  'QUOTATION_SHARED_WITH_CUSTOMER',
  'NEGOTIATION_STARTED',
  'PO_RECEIVED',
  'PARTS_DELIVERED'
];

const STAGE_LABELS = {
  'OPPORTUNITY': 'Opportunity',
  'QUOTATION_RECEIVED_FROM_SUPPLIER': 'Quotation Received from Supplier',
  'QUOTATION_SHARED_WITH_CUSTOMER': 'Quotation Shared with Customer',
  'NEGOTIATION_STARTED': 'Negotiation Started',
  'PO_RECEIVED': 'PO Received',
  'PARTS_DELIVERED': 'Parts Delivered'
};

export default function DealCampaignPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    conditionType: 'days_in_stage',
    conditionValue: 0,
    actionType: 'sendEmail',
    actionPayload: {
      subject: '',
      body: ''
    },
    status: 'active'
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const USE_MOCK_DATA = true;
      
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeals(MOCK_DEALS);
      } else {
        const response = await fetch('/api/automations/active-deals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject' || name === 'body') {
      setFormData({
        ...formData,
        actionPayload: {
          ...formData.actionPayload,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const USE_MOCK_DATA = true;
      
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const newDeal = {
          id: String(deals.length + 1),
          ...formData,
          conditionValue: Number(formData.conditionValue)
        };
        setDeals([...deals, newDeal]);
      } else {
        const response = await fetch('/api/automations/active-deals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            conditionValue: Number(formData.conditionValue)
          })
        });
        const data = await response.json();
        setDeals([...deals, data]);
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        conditionType: 'days_in_stage',
        conditionValue: 0,
        actionType: 'sendEmail',
        actionPayload: {
          subject: '',
          body: ''
        },
        status: 'active'
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal campaign. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this deal campaign?')) {
      return;
    }

    try {
      const USE_MOCK_DATA = true;
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setDeals(deals.filter(deal => deal.id !== id));
      } else {
        await fetch(`/api/automations/active-deals/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setDeals(deals.filter(deal => deal.id !== id));
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal campaign. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/campaigns')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to Campaigns
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Deal Campaigns</h1>
              <p className="text-gray-600">
                Manage automated actions for deals at different stages
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create New Campaign
            </button>
          </div>
        </div>

        {/* Existing Deals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Existing Deal Campaigns</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading campaigns...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="p-8 text-center">
              <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No deal campaigns yet. Create your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deals.map((deal) => (
                <div key={deal.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {STAGE_LABELS[deal.name] || deal.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {deal.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Condition:</span> {deal.conditionValue} days in stage
                        </p>
                        <p>
                          <span className="font-medium">Action:</span> Send Email
                        </p>
                        <p>
                          <span className="font-medium">Subject:</span> {deal.actionPayload.subject}
                        </p>
                        <p className="text-gray-500 italic">{deal.actionPayload.body}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Deal Campaign</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Deal Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a stage</option>
                    {DEAL_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {STAGE_LABELS[stage]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days in Stage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="conditionValue"
                    value={formData.conditionValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 0, 3, 7"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Trigger automation after this many days in the selected stage
                  </p>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.actionPayload.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="High-value lead detected!"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    value={formData.actionPayload.body}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="A new lead with a deal value over $10,000 has been created. Please follow up immediately."
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}