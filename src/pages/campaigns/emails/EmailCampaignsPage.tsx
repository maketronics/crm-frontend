import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../../../stores/authStore';
import {
  EnvelopeIcon,
  PlusIcon,
  ListBulletIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CalendarIcon
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

interface CampaignFormData {
  name: string;
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
  launchDate: string;
}

type ViewType = 'main' | 'existing' | 'create-form' | 'launch-campaign' | 'view-campaign';

const API_BASE_URL = 'https://crm-dev0-emal-campaign-service-v1.make-tronics.com';

export default function EmailCampaignsPage() {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = authStore();
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const getDefaultLaunchDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [campaignForm, setCampaignForm] = useState<CampaignFormData>({
    name: '',
    segmentQuery: {
      primaryRegions: '',
      industrySegments: '',
      stage: '',
      companySegments: '',
      primaryDesignations: '',
      rfqSegments: '',
      coldCalling: 'No'
    },
    steps: [{
      subject: '',
      body: '',
      delayDays: 0
    }],
    launchDate: getDefaultLaunchDate()
  });

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      console.error('No access token available, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, accessToken, navigate]);

  const updateEmailStep = (field: string, value: string | number) => {
    const updatedSteps = [...campaignForm.steps];
    updatedSteps[0] = { ...updatedSteps[0], [field]: value };
    setCampaignForm({ ...campaignForm, steps: updatedSteps });
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchCampaigns();
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (currentView === 'existing') {
      fetchCampaigns();
    }
  }, [currentView]);

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

  const handleSubmitCampaign = async () => {
    if (!accessToken) {
      console.error('No access token available');
      alert('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    if (!campaignForm.name) {
      alert('Please enter a campaign name');
      return;
    }

    if (!campaignForm.steps[0].subject || !campaignForm.steps[0].body) {
      alert('Please complete email subject and body');
      return;
    }

    if (!campaignForm.launchDate) {
      alert('Please select a launch date and time');
      return;
    }

    const launchDateFormatted = new Date(campaignForm.launchDate)
      .toISOString()
      .slice(0, 19);

    setLoading(true);
    try {
      const payload = {
        ...campaignForm,
        launchDate: launchDateFormatted
      };

      console.log('Submitting campaign:', payload);

      const response = await fetch(`${API_BASE_URL}/api/automations/cold-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const createdCampaign = await response.json();
        setCreatedCampaignId(createdCampaign.id);
        alert('Campaign created successfully!');
        setCurrentView('launch-campaign');
      } else if (response.status === 401) {
        console.error('Authentication failed, redirecting to login');
        authStore.getState().logout();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
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
        if (currentView === 'view-campaign') {
          setCurrentView('existing');
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

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCurrentView('view-campaign');
  };

  const handleLaunchCampaign = async () => {
    if (!accessToken || !createdCampaignId) {
      console.error('No access token or campaign ID available');
      alert('Authentication or campaign ID required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/automations/cold-campaigns/launch?id=${createdCampaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Campaign launched successfully!');
        setCampaignForm({
          name: '',
          segmentQuery: {
            primaryRegions: '',
            industrySegments: '',
            stage: '',
            companySegments: '',
            primaryDesignations: '',
            rfqSegments: '',
            coldCalling: 'No'
          },
          steps: [{
            subject: '',
            body: '',
            delayDays: 0
          }],
          launchDate: getDefaultLaunchDate()
        });
        setCreatedCampaignId(null);
        setCurrentView('main');
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

  if (currentView === 'main') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/campaigns')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Email Campaigns
              </h1>
              <p className="text-gray-600">
                Create and manage your email marketing campaigns
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => setCurrentView('existing')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <ListBulletIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Existing Campaigns
                </h2>
                <p className="text-gray-600 mb-4">
                  View and manage your existing email campaigns
                </p>
                <div className="text-3xl font-bold text-blue-600">
                  {campaigns.length}
                </div>
                <p className="text-sm text-gray-500">Total Campaigns</p>
              </div>
            </div>

            <div
              onClick={() => setCurrentView('create-form')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-lg hover:border-green-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <PlusIcon className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Create New Campaign
                </h2>
                <p className="text-gray-600 mb-4">
                  Start a new email marketing campaign
                </p>
                <button className="mt-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'existing') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('main')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Existing Campaigns</h1>
                <p className="text-gray-600">Manage your email campaigns</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
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
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'view-campaign' && selectedCampaign) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => setCurrentView('existing')}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Campaign ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedCampaign.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Campaign Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${selectedCampaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
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

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('existing')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to List
              </button>
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

  if (currentView === 'create-form') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
              <p className="text-gray-600">Configure your email campaign</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    placeholder="e.g., Q4 Prospect Outreach"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Launch Date & Time *
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={campaignForm.launchDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, launchDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Segment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Regions
                  </label>
                  <input
                    type="text"
                    value={campaignForm.segmentQuery.primaryRegions}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, primaryRegions: e.target.value }
                    })}
                    placeholder="e.g., India & Middle East"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Segments
                  </label>
                  <input
                    type="text"
                    value={campaignForm.segmentQuery.industrySegments}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, industrySegments: e.target.value }
                    })}
                    placeholder="e.g., Electronics Manufacturing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <input
                    type="text"
                    value={campaignForm.segmentQuery.stage}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, stage: e.target.value }
                    })}
                    placeholder="e.g., Prospect"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Segments
                  </label>
                  <input
                    type="text"
                    value={campaignForm.segmentQuery.companySegments}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, companySegments: e.target.value }
                    })}
                    placeholder="e.g., OEM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Designations
                  </label>
                  <input
                    type="text"
                    value={campaignForm.segmentQuery.primaryDesignations}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, primaryDesignations: e.target.value }
                    })}
                    placeholder="e.g., Head of Procurement"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RFQ Segments
                  </label>
                  <input
                    type="text"
                    value={campaignForm.segmentQuery.rfqSegments}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, rfqSegments: e.target.value }
                    })}
                    placeholder="e.g., Regular"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cold Calling
                  </label>
                  <select
                    value={campaignForm.segmentQuery.coldCalling}
                    onChange={(e) => setCampaignForm({
                      ...campaignForm,
                      segmentQuery: { ...campaignForm.segmentQuery, coldCalling: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={campaignForm.steps[0].subject}
                    onChange={(e) => updateEmailStep('subject', e.target.value)}
                    placeholder="e.g., Introductory Offer for {{name}}"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body *
                  </label>
                  <textarea
                    value={campaignForm.steps[0].body}
                    onChange={(e) => updateEmailStep('body', e.target.value)}
                    placeholder="Write your email content here... Use {{name}}, {{industrySegments}}, etc. for personalization"
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Available variables: {`{{name}}, {{industrySegments}}, {{primaryRegions}}, {{companySegments}}, {{primaryDesignations}}, {{rfqSegments}}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitCampaign}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Create Campaign
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                    setCurrentView('main');
                  }
                }}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'launch-campaign') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Campaign Created Successfully!
              </h2>
              <p className="text-gray-600 mb-2">
                Your campaign has been created and saved as a draft.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Campaign ID: <span className="font-mono font-semibold">{createdCampaignId}</span>
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleLaunchCampaign}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Launching Campaign...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      Trigger Campaign
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCampaignForm({
                      name: '',
                      segmentQuery: {
                        primaryRegions: '',
                        industrySegments: '',
                        stage: '',
                        companySegments: '',
                        primaryDesignations: '',
                        rfqSegments: '',
                        coldCalling: 'No'
                      },
                      steps: [{
                        subject: '',
                        body: '',
                        delayDays: 0
                      }],
                      launchDate: getDefaultLaunchDate()
                    });
                    setCreatedCampaignId(null);
                    setCurrentView('main');
                  }}
                  disabled={loading}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}