import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../../../stores/authStore';
import {
  PlusIcon,
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface Deal {
  id: string;
  name: string;
  conditionType: string;
  conditionValue: number;
  actionType: string;
  actionPayload: {
    subject: string;
    body: string;
    to?: string;
  };
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DealFormData {
  name: string;
  conditionType: string;
  conditionValue: number;
  actionType: string;
  actionPayload: {
    subject: string;
    body: string;
  };
  status: 'active' | 'inactive';
}

type ViewType = 'list' | 'create-form' | 'edit-form';

const API_BASE_URL = 'https://crm-dev0-automation-service-v1.make-tronics.com';

const DEAL_STAGES = [
  'OPPORTUNITY',
  'QUOTATION_RECEIVED_FROM_SUPPLIER',
  'QUOTATION_SHARED_WITH_CUSTOMER',
  'NEGOTIATION_STARTED',
  'PO_RECEIVED',
  'PARTS_DELIVERED'
];

const STAGE_LABELS: { [key: string]: string } = {
  'OPPORTUNITY': 'Opportunity',
  'QUOTATION_RECEIVED_FROM_SUPPLIER': 'Quotation Received from Supplier',
  'QUOTATION_SHARED_WITH_CUSTOMER': 'Quotation Shared with Customer',
  'NEGOTIATION_STARTED': 'Negotiation Started',
  'PO_RECEIVED': 'PO Received',
  'PARTS_DELIVERED': 'Parts Delivered'
};

export default function DealCampaignPage() {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = authStore();
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  const [formData, setFormData] = useState<DealFormData>({
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
    if (!isAuthenticated || !accessToken) {
      console.error('No access token available, redirecting to login');
      navigate('/login');
    } else {
      fetchDeals();
    }
  }, [isAuthenticated, accessToken, navigate]);

  const fetchDeals = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/active-deals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'subject' || name === 'body') {
      setFormData({
        ...formData,
        actionPayload: {
          ...formData.actionPayload,
          [name]: value
        }
      });
    } else if (name === 'conditionValue') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      alert('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    if (!formData.name || !formData.actionPayload.subject || !formData.actionPayload.body) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/active-deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Deal campaign created successfully!');
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
        setCurrentView('list');
        fetchDeals();
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create deal campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Error creating deal campaign. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken || !editingDeal) {
      alert('Authentication required or no deal selected.');
      return;
    }

    if (!formData.name || !formData.actionPayload.subject || !formData.actionPayload.body) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/active-deals/${editingDeal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Deal campaign updated successfully!');
        setEditingDeal(null);
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
        setCurrentView('list');
        fetchDeals();
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update deal campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('Error updating deal campaign. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) {
      alert('Authentication required.');
      return;
    }

    if (!confirm('Are you sure you want to delete this deal campaign?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/active-deals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Deal campaign deleted successfully!');
        fetchDeals();
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete deal campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Error deleting deal campaign. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      conditionType: deal.conditionType,
      conditionValue: deal.conditionValue,
      actionType: deal.actionType,
      actionPayload: {
        subject: deal.actionPayload.subject,
        body: deal.actionPayload.body
      },
      status: deal.status
    });
    setCurrentView('edit-form');
  };

  const handleExecuteCampaign = async () => {
    if (!accessToken) {
      alert('Authentication required.');
      return;
    }

    if (!confirm('Are you sure you want to execute all active deal campaigns?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/active-deals/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Deal campaigns executed successfully!');
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to execute campaigns: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error executing campaigns:', error);
      alert('Error executing campaigns. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentView === 'list') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Deal Campaigns</h1>
                <p className="text-gray-600">Manage automated actions for deals at different stages</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExecuteCampaign}
                disabled={loading || deals.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="w-5 h-5" />
                Start Campaign
              </button>
              <button
                onClick={() => setCurrentView('create-form')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create New
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No deal campaigns found.</p>
              <p className="text-gray-400 mt-2">Create your first campaign to get started!</p>
              <button
                onClick={() => setCurrentView('create-form')}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days in Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{deal.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {deal.conditionType === 'days_in_stage' ? 'Days in Stage' : deal.conditionType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {deal.conditionValue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {deal.actionPayload.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            deal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {deal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(deal)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(deal.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'create-form' || currentView === 'edit-form') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => {
                setCurrentView('list');
                setEditingDeal(null);
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
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentView === 'edit-form' ? 'Edit Deal Campaign' : 'Create New Deal Campaign'}
              </h1>
              <p className="text-gray-600">Configure your deal automation</p>
            </div>
          </div>

          <form onSubmit={currentView === 'edit-form' ? handleUpdate : handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Follow-up on high-value leads"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="conditionType"
                    value={formData.conditionType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="days_in_stage">Days in Stage</option>
                    <option value="dealValue">Deal Value</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.conditionType === 'days_in_stage' ? 'Days in Stage' : 'Deal Value'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="conditionValue"
                    value={formData.conditionValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder={formData.conditionType === 'days_in_stage' ? 'e.g., 0, 3, 7' : 'e.g., 10000'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.conditionType === 'days_in_stage' 
                      ? 'Trigger automation after this many days in the selected stage'
                      : 'Trigger automation when deal value exceeds this amount'}
                  </p>
                </div>

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
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Action</h3>
              
              <div className="space-y-4">
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
                    placeholder="High-value lead detected!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    value={formData.actionPayload.body}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="A new lead with a deal value over $10,000 has been created. Please follow up immediately."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {currentView === 'edit-form' ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {currentView === 'edit-form' ? 'Update Campaign' : 'Create Campaign'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                    setCurrentView('list');
                    setEditingDeal(null);
                  }
                }}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}