import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leadApi } from '../../api/leadApi';
import { Labels, Stage } from '../../types/lead.types';
import type { Lead } from '../../types/lead.types';

export const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('LeadDetailPage: Component mounted');
    console.log('LeadDetailPage: ID from URL params:', id);

    const fetchLead = async () => {
      if (!id) {
        console.error('LeadDetailPage: No ID provided');
        setError('Lead ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        console.log('LeadDetailPage: Fetching lead with ID:', id);
        const leadData = await leadApi.getLeadById(id);
        console.log('LeadDetailPage: ✅ Lead fetched successfully');
        console.log('LeadDetailPage: Lead data:', leadData);
        console.log('LeadDetailPage: Lead structure check:', {
          hasPersonDetails: !!leadData.personDetails,
          personDetailsName: leadData.personDetails?.name,
          flatName: leadData.name,
          contactPerson: leadData.contactPerson,
          organization: leadData.organization,
          title: leadData.title
        });
        setLead(leadData);
        console.log('='.repeat(50));
        console.log('DIAGNOSTIC: Full Lead Object');
        console.log(JSON.stringify(leadData, null, 2));
        console.log('='.repeat(50));
      } catch (err: any) {
        console.error('LeadDetailPage: ❌ Error fetching lead:', err);
        setError(err.message || 'Failed to fetch lead');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      console.log('LeadDetailPage: Deleting lead with ID:', id);
      const response = await leadApi.deleteLead(id);
      console.log('LeadDetailPage: Lead deleted successfully:', response);
      alert(`Success: ${response.message || 'Lead deleted successfully'}`);
      navigate('/leads');
    } catch (err: any) {
      console.error('LeadDetailPage: Error deleting lead:', err);
      alert(`Error: ${err.message || 'Failed to delete lead'}`);
    }
  };

  const getLabelColor = (label: Labels) => {
    switch (label) {
      case Labels.HOT:
        return 'bg-red-100 text-red-800';
      case Labels.WARM:
        return 'bg-yellow-100 text-yellow-800';
      case Labels.COLD:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: Stage) => {
    switch (stage) {
      case Stage.LEAD:
        return 'bg-gray-100 text-gray-800';
      case Stage.QUOTATION_RECEIVED_FROM_SUPPLIER:
        return 'bg-blue-100 text-blue-800';
      case Stage.QUOTATION_SHARED_WITH_CUSTOMER:
        return 'bg-indigo-100 text-indigo-800';
      case Stage.NEGOTIATION_STARTED:
        return 'bg-purple-100 text-purple-800';
      case Stage.PO_RECEIVED:
        return 'bg-orange-100 text-orange-800';
      case Stage.PARTS_DELIVERED:
        return 'bg-teal-100 text-teal-800';
      case Stage.CLOSED_WON:
        return 'bg-green-100 text-green-800';
      case Stage.CLOSED_LOST:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStage = (stage: string | null | undefined) => {
  if (!stage) return ""; // or "N/A"
  return stage.replace(/_/g, " ");
};


  // Helper to safely get name - checks multiple possible locations
  const getName = () => {
    return lead?.personDetails?.name || lead?.name || lead?.contactPerson || 'N/A';
  };

  const getPhone = () => {
    return lead?.personDetails?.phone || lead?.phone || 'N/A';
  };

  const getEmail = () => {
    return lead?.personDetails?.email || lead?.email;
  };

  const getTargetSegment = () => {
    return lead?.personDetails?.targetSegment || lead?.targetSegment;
  };

  const getQuotationLink = () => {
    return lead?.personDetails?.quotationLink || lead?.quotationLink;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error loading lead</h3>
                <p className="mt-2 text-sm text-red-700">{error || 'Lead not found'}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/leads')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Back to Leads
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate('/leads')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Leads
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{lead.title}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLabelColor(lead.label)}`}>
                {lead.label}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(lead.stage)}`}>
                {formatStage(lead.stage)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/leads/${id}/edit`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Edit Lead
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Contact Person</p>
              <p className="mt-1 text-sm text-gray-900">{lead.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="mt-1 text-sm text-gray-900">{getName()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Organization</p>
              <p className="mt-1 text-sm text-gray-900">{lead.organization}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1 text-sm text-gray-900">{getPhone()}</p>
            </div>
            {getEmail() && (
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{getEmail()}</p>
              </div>
            )}
            {getTargetSegment() && (
              <div>
                <p className="text-sm font-medium text-gray-500">Target Segment</p>
                <p className="mt-1 text-sm text-gray-900">{getTargetSegment()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lead.value && (
              <div>
                <p className="text-sm font-medium text-gray-500">Value</p>
                <p className="mt-1 text-sm text-gray-900">{lead.currency} {lead.value.toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Owner</p>
              <p className="mt-1 text-sm text-gray-900">{lead.owner}</p>
            </div>
            {lead.expectedCloseDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Expected Close Date</p>
                <p className="mt-1 text-sm text-gray-900">{new Date(lead.expectedCloseDate).toLocaleDateString()}</p>
              </div>
            )}
            {getQuotationLink() && (
              <div>
                <p className="text-sm font-medium text-gray-500">Quotation Link</p>
                <a
                  href={getQuotationLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Quotation
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Source Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Source Channel</p>
              <p className="mt-1 text-sm text-gray-900">{lead.sourceChannel}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Source Channel ID</p>
              <p className="mt-1 text-sm text-gray-900">{lead.sourceChannelId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Source Origin</p>
              <p className="mt-1 text-sm text-gray-900">{lead.sourceOrigin}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(lead.notes?.text || lead.notesText || (lead.notes?.fileUrls && lead.notes.fileUrls.length > 0)) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            {(lead.notes?.text || lead.notesText) && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {lead.notes?.text || lead.notesText}
                </p>
              </div>
            )}
            {lead.notes?.fileUrls && lead.notes.fileUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Attached Files</p>
                <div className="space-y-2">
                  {lead.notes.fileUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View File {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Lead ID</p>
              <p className="mt-1 text-sm text-gray-900 font-mono">{lead.id}</p>
            </div>
            {lead.leadCreated && (
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="mt-1 text-sm text-gray-900">{new Date(lead.leadCreated).toLocaleString()}</p>
              </div>
            )}
            {lead.updatedAt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="mt-1 text-sm text-gray-900">{new Date(lead.updatedAt).toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Current Stage</p>
              <p className="mt-1 text-sm text-gray-900">{formatStage(lead.stage)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};