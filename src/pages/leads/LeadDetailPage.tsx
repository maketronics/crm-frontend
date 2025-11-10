import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaPhone, FaEnvelope, FaBuilding, FaUser, FaFileDownload, FaExternalLinkAlt } from 'react-icons/fa';
import { leadService } from '../../lib/leadService';

// Match API response structure exactly
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

export const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    } catch (error) {
      console.error('Failed to fetch lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      if (USE_MOCK_DATA) {
        // Mock delete
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Lead deleted successfully (mock mode)');
        navigate('/leads', {
          state: {
            message: 'Lead deleted successfully',
            type: 'success'
          }
        });
      } else {
        // Real API call
        const response = await leadService.deleteLead(id!);
        console.log('Delete response:', response);
        navigate('/leads', {
          state: {
            message: response.message || 'Lead deleted successfully',
            type: 'success'
          }
        });
      }
    } catch (error: any) {
      console.error('Failed to delete lead:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete lead';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      HOT: 'bg-red-100 text-red-700',
      WARM: 'bg-yellow-100 text-yellow-700',
      COLD: 'bg-blue-100 text-blue-700',
    };
    return colors[label] || 'bg-gray-100 text-gray-700';
  };

  const getStageDisplay = (stage: string) => {
    return stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading lead details...</div>
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lead.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{lead.organization}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/leads/edit/${id}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <FaEdit size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <FaTrash size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Status Bar */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Stage</p>
                <p className="text-lg font-semibold text-gray-900">{getStageDisplay(lead.stage)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLabelColor(lead.label)}`}>
                  {lead.label}
                </span>
                {lead.value && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {lead.currency} {lead.value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <FaUser className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="text-base font-medium text-gray-900">{lead.contactPerson}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaUser className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-base font-medium text-gray-900">{lead.personDetails.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaBuilding className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="text-base font-medium text-gray-900">{lead.organization}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaPhone className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${lead.personDetails.phone}`} className="text-base font-medium text-indigo-600 hover:text-indigo-800">
                    {lead.personDetails.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaEnvelope className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${lead.personDetails.email}`} className="text-base font-medium text-indigo-600 hover:text-indigo-800">
                    {lead.personDetails.email}
                  </a>
                </div>
              </div>

              {lead.personDetails.targetSegment && (
                <div className="flex items-start space-x-3">
                  <FaBuilding className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Target Segment</p>
                    <p className="text-base font-medium text-gray-900">{lead.personDetails.targetSegment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lead Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Lead Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="text-base font-medium text-gray-900">{lead.owner}</p>
              </div>

              {lead.expectedCloseDate && (
                <div>
                  <p className="text-sm text-gray-500">Expected Close Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(lead.expectedCloseDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="text-base font-medium text-gray-900">{lead.currency}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Stage</p>
                <p className="text-base font-medium text-gray-900">{getStageDisplay(lead.stage)}</p>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Source Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Source Channel</p>
                <p className="text-base font-medium text-gray-900">{lead.sourceChannel}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Source Channel ID</p>
                <p className="text-base font-medium text-gray-900">{lead.sourceChannelId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Source Origin</p>
                <p className="text-base font-medium text-gray-900">{lead.sourceOrigin}</p>
              </div>

              {lead.personDetails.quotationLink && (
                <div>
                  <p className="text-sm text-gray-500">Quotation Link</p>

                  <a href={lead.personDetails.quotationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
                  >
                    <span>View Quotation</span>
                    <FaExternalLinkAlt size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Attachments */}
          {(lead.notes.text || lead.notes.fileUrls.length > 0) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Notes & Attachments
              </h2>

              {lead.notes.text && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{lead.notes.text}</p>
                </div>
              )}

              {lead.notes.fileUrls.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Attachments</p>
                  <div className="space-y-2">
                    {lead.notes.fileUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <FaFileDownload size={14} />
                        <span className="text-sm">Attachment {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(lead.leadCreated).toLocaleString()}
                </p>
              </div>

              {lead.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(lead.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Lead</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};