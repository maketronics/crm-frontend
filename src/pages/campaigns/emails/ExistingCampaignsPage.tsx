import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../../../stores/authStore';
import {
  ArrowLeftIcon,
  EyeIcon,
  TrashIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'COMPLETED' | 'ACTIVE';
  launchDate: string;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string;
  segmentQuery: {
    primaryRegions: string;
    industrySegments: string;
    stage: string;
    companySegments: string;
    primaryDesignations: string;
    rfqSegments: string;
    coldCalling: string;
  };
  steps: {
    subject: string;
    body: string;
    delayDays: number;
  }[];
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    replied: number;
    failed: number;
  };
}

type ViewType = 'list' | 'details';

const API_BASE_URL = 'https://crm-dev0-emal-campaign-service-v1.make-tronics.com';

export default function ExistingCampaignsPage() {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = authStore();
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      console.error('No access token available, redirecting to login');
      navigate('/login');
    } else {
      fetchCampaigns();
    }
  }, [isAuthenticated, accessToken, navigate]);

  const fetchCampaigns = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/cold-campaigns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCurrentView('details');
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!accessToken) {
      console.error('No access token available');
      alert('Authentication required.');
      return;
    }

    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/cold-campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Campaign deleted successfully!');
        if (currentView === 'details') {
          setCurrentView('list');
        }
        fetchCampaigns();
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    if (!accessToken) {
      console.error('No access token available');
      alert('Authentication required.');
      return;
    }

    if (!confirm('Are you sure you want to launch this campaign?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/cold-campaigns/launch?id=${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Campaign launched successfully!');
        fetchCampaigns();
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to launch campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('Error launching campaign. Please check your connection and try again.');
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
                onClick={() => navigate('/campaigns/emails')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Existing Campaigns</h1>
                <p className="text-gray-600">View and manage your email campaigns</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No campaigns found.</p>
              <p className="text-gray-400 mt-2">Create your first campaign to get started!</p>
              <button
                onClick={() => navigate('/campaigns/emails')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                      Launch Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
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
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {new Date(campaign.launchDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {campaign.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewCampaign(campaign)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {campaign.status === 'DRAFT' && (
                            <button
                              onClick={() => handleLaunchCampaign(campaign.id)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 disabled:opacity-50"
                              title="Launch Campaign"
                            >
                              <RocketLaunchIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                            title="Delete Campaign"
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

  if (currentView === 'details' && selectedCampaign) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => setCurrentView('list')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Details</h1>
              <p className="text-gray-600">View complete campaign information</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Campaign ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedCampaign.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Campaign Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCampaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    selectedCampaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Launch Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedCampaign.launchDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created By</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.createdBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedCampaign.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Target Segment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Segment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Primary Regions</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.primaryRegions || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Industry Segments</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.industrySegments || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Stage</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.stage || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Segments</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.companySegments || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Primary Designations</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.primaryDesignations || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">RFQ Segments</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.rfqSegments || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cold Calling</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.segmentQuery.coldCalling}</p>
                </div>
              </div>
            </div>

            {/* Email Steps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Steps</h3>
              <div className="space-y-4">
                {selectedCampaign.steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Step {index + 1}</h4>
                      <span className="text-sm text-gray-500">Delay: {step.delayDays} days</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Subject</label>
                        <p className="mt-1 text-sm text-gray-900">{step.subject}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Body</label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{step.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedCampaign.metrics.sent}</p>
                  <p className="text-sm text-gray-600">Sent</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedCampaign.metrics.delivered}</p>
                  <p className="text-sm text-gray-600">Delivered</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedCampaign.metrics.opened}</p>
                  <p className="text-sm text-gray-600">Opened</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedCampaign.metrics.clicked}</p>
                  <p className="text-sm text-gray-600">Clicked</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{selectedCampaign.metrics.bounced}</p>
                  <p className="text-sm text-gray-600">Bounced</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">{selectedCampaign.metrics.replied}</p>
                  <p className="text-sm text-gray-600">Replied</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{selectedCampaign.metrics.failed}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('list')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to List
              </button>
              {selectedCampaign.status === 'DRAFT' && (
                <button
                  onClick={() => handleLaunchCampaign(selectedCampaign.id)}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Launch Campaign
                </button>
              )}
              <button
                onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}