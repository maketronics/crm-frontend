import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  PlusIcon,
  ListBulletIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  name: string;
  status: 'Active' | 'Completed' | 'Draft';
  sent: number;
  opens: number;
  clicks: number;
  scheduled: string;
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
}


type ViewType = 'main' | 'existing' | 'create-form';

export default function EmailCampaignsPage() {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  
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
    }]
  });

  const updateEmailStep = (field: string, value: string | number) => {
    const updatedSteps = [...campaignForm.steps];
    updatedSteps[0] = { ...updatedSteps[0], [field]: value };
    setCampaignForm({ ...campaignForm, steps: updatedSteps });
  };

  // Fetch campaigns when viewing existing campaigns
  useEffect(() => {
    if (currentView === 'existing') {
      fetchCampaigns();
    }
  }, [currentView]);

  
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/automations/cold-campaigns?mock=true');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Fallback to mock data
      setCampaigns([
        { id: 1, name: 'Holiday Sale 2024', status: 'Active', sent: 1250, opens: 850, clicks: 420, scheduled: '2024-12-15' },
        { id: 2, name: 'Welcome Series', status: 'Active', sent: 3200, opens: 2100, clicks: 980, scheduled: 'Ongoing' },
        { id: 3, name: 'Product Launch', status: 'Completed', sent: 5600, opens: 3800, clicks: 1200, scheduled: '2024-11-20' },
        { id: 4, name: 'Re-engagement', status: 'Draft', sent: 0, opens: 0, clicks: 0, scheduled: '2024-12-20' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCampaign = async () => {
    // Validation
    if (!campaignForm.name) {
      alert('Please enter a campaign name');
      return;
    }

    if (!campaignForm.steps[0].subject || !campaignForm.steps[0].body) {
      alert('Please complete email subject and body');
      return;
    }
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/automations/cold-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignForm)
      });

      if (response.ok) {
        alert('Campaign created successfully!');
        setCurrentView('main');
        // Reset form
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
          }]
        });
      } else {
        alert('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    }
  };

  const addStep = () => {
    if (campaignForm.steps.length < 3) {
      setCampaignForm({
        ...campaignForm,
        steps: [
          ...campaignForm.steps,
          { subject: '', body: '', delayDays: 0 }
        ]
      });
    }
  };

  const removeStep = (index: number) => {
    if (campaignForm.steps.length > 1) {
      setCampaignForm({
        ...campaignForm,
        steps: campaignForm.steps.filter((_, i) => i !== index)
      });
    }
  };

  const updateStep = (index: number, field: string, value: string | number) => {
    const updatedSteps = [...campaignForm.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setCampaignForm({ ...campaignForm, steps: updatedSteps });
  };
  if (currentView === 'main') {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">

          <div className="mb-8 flex items-center gap-4">

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
            {/* Existing Campaigns Card */}
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

            {/* Create New Campaign Card */}
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

  // ==================== EXISTING CAMPAIGNS VIEW ====================
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {campaign.sent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {campaign.opens.toLocaleString()}
                        <span className="text-gray-500 text-sm ml-1">
                          ({campaign.sent > 0 ? Math.round((campaign.opens / campaign.sent) * 100) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {campaign.clicks.toLocaleString()}
                        <span className="text-gray-500 text-sm ml-1">
                          ({campaign.sent > 0 ? Math.round((campaign.clicks / campaign.sent) * 100) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {campaign.scheduled}
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

  // ==================== CREATE CAMPAIGN FORM VIEW ====================
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
            {/* Campaign Name */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                  placeholder="e.g., Q4 Prospect Outreach"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Segment Query */}
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
                      segmentQuery: {...campaignForm.segmentQuery, primaryRegions: e.target.value}
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
                      segmentQuery: {...campaignForm.segmentQuery, industrySegments: e.target.value}
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
                      segmentQuery: {...campaignForm.segmentQuery, stage: e.target.value}
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
                      segmentQuery: {...campaignForm.segmentQuery, companySegments: e.target.value}
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
                      segmentQuery: {...campaignForm.segmentQuery, primaryDesignations: e.target.value}
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
                      segmentQuery: {...campaignForm.segmentQuery, rfqSegments: e.target.value}
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
                      segmentQuery: {...campaignForm.segmentQuery, coldCalling: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email Step */}
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

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmitCampaign}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Create Campaign
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                    setCurrentView('main');
                  }
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}