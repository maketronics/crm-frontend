import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { LeadForm } from '../../components/leads';
import { leadService } from '../../lib/leadService';
import type { CreateLeadRequest } from '../../types';
import { Button } from '../../components/ui';

// Match API response structure
interface PersonDetails {
  id: string;
  name: string;
  targetSegment: string;
  phone: string;
  email: string;
  quotationLink: string;
}

interface Notes {
  text: string;
  fileUrls: string[];
}

interface LeadDetail {
  id: string;
  contactPerson: string;
  organization: string;
  title: string;
  value: number;
  currency: string;
  label: string;
  owner: string;
  sourceChannel: string;
  sourceChannelId: string;
  sourceOrigin: string;
  commentIds: string[] | null;
  expectedCloseDate: string;
  leadCreated: string;
  updatedAt: string | null;
  personDetails: PersonDetails;
  notes: Notes;
  stage: string;
}

// Toggle for mock data
const USE_MOCK_DATA = true;

const mockLeadDetail: LeadDetail = {
  id: "a5e98c2e-3053-45c6-b7ec-f0b9f9dc897b",
  contactPerson: "john",
  organization: "abc",
  title: "po",
  value: 50000,
  currency: "USD",
  label: "HOT",
  owner: "megha",
  sourceChannel: "abc",
  sourceChannelId: "12345",
  sourceOrigin: "manual",
  commentIds: null,
  expectedCloseDate: "2025-11-05",
  leadCreated: "2025-11-01T23:18:53.131",
  updatedAt: null,
  personDetails: {
    id: "80eccc76-a339-4450-aabb-b3149c07fc11",
    name: "ACME Lead",
    targetSegment: "Electronics",
    phone: "9876543210",
    email: "reshmi@gmail.com",
    quotationLink: "https://example.com/quote.pdf"
  },
  notes: {
    text: "testing notes",
    fileUrls: [
      "http://res.cloudinary.com/dolx1bzdi/image/upload/v1762019336/lead_service/files/msuaijkgmjiciy5tqycq.jpg"
    ]
  },
  stage: "LEAD"
};

export const EditLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLead(mockLeadDetail);
      } else {
        const data = await leadService.getLeadById(id!);
        setLead(data as LeadDetail);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lead');
      console.error('Failed to fetch lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateLeadRequest) => {
    console.log('EditLeadPage: Submitting updated lead data:', data);

    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('EditLeadPage: Lead updated successfully (mock mode)');
        alert('Lead successfully updated (mock mode)');
        navigate(`/leads/${id}`);
      } else {
        console.log('EditLeadPage: Calling leadService.updateLead...');
        const response = await leadService.updateLead(id!, data);
        console.log('EditLeadPage: Lead updated successfully:', response);
        navigate(`/leads/${id}`, {
          state: { message: 'Lead updated successfully' },
        });
      }
    } catch (error: any) {
      console.error('EditLeadPage: Error updating lead:', error);
      console.error('EditLeadPage: Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response
      });
      setError(error.response?.data?.message || 'Failed to update lead');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading lead data...</div>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => navigate('/leads')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-gray-500 mb-4">Lead not found</div>
        <button
          onClick={() => navigate('/leads')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  // Transform API response to form data structure
  const initialFormData = {
    contactPerson: lead.contactPerson,
    organization: lead.organization,
    title: lead.title,
    value: lead.value,
    currency: lead.currency,
    label: lead.label,
    owner: lead.owner,
    sourceChannel: lead.sourceChannel,
    sourceChannelId: lead.sourceChannelId,
    sourceOrigin: lead.sourceOrigin,
    expectedCloseDate: lead.expectedCloseDate,
    phone: lead.personDetails.phone,
    name: lead.personDetails.name,
    targetSegment: lead.personDetails.targetSegment,
    email: lead.personDetails.email,
    quotationLink: lead.personDetails.quotationLink,
    notesText: lead.notes.text,
    stage: lead.stage,
    createdBy: 'System', // You might want to track who created it
    createdDate: lead.leadCreated,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mock Mode Banner */}
      {USE_MOCK_DATA && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-yellow-800">
            🎭 <strong>Mock Mode:</strong> Using sample data
          </span>
        </div>
      )}

      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/leads/${id}`)}
            className="p-2"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
            <p className="text-gray-600">{lead.title}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <LeadForm 
            onSubmit={handleSubmit} 
            initialData={initialFormData}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
};