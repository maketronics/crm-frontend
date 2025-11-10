import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPlus,
  FaSearch,
  FaEllipsisH,
  FaTag,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { leadService } from "../../lib/leadService";
import type { Lead, Labels } from "../../types";

// 🎭 MOCK DATA - Set this to false when API is ready
const USE_MOCK_DATA = true;

const mockLeads: Lead[] = [
  {
    id: "1",
    title: "RP509Z001D-E2-F 10000pcs",
    contactPerson: "John Smith",
    organization: "TechCorp Industries",
    name: "John Smith",
    phone: "+1 234 567 8900",
    email: "john@techcorp.com",
    value: 15000,
    currency: "USD",
    label: "WARM" as Labels,
    owner: "Kaushik Iyer",
    sourceChannel: "Website",
    sourceChannelId: "WEB-001",
    sourceOrigin: "Contact Form",
    targetSegment: "Enterprise",
    quotationLink: "https://example.com/quote-001",
    notesText: "High potential client, follow up in 2 days",
    stage: "LEAD",
    createdBy: "Admin",
    createdDate: "2024-12-02T09:50:00Z",
  },
  {
    id: "2",
    title: "XPC8240LZU200E 1000pcs",
    contactPerson: "Sarah Johnson",
    organization: "MegaSystems Ltd",
    name: "Sarah Johnson",
    phone: "+1 345 678 9012",
    email: "sarah@megasystems.com",
    value: 8500,
    currency: "USD",
    label: "WARM" as Labels,
    owner: "Kaushik Iyer",
    sourceChannel: "Email",
    sourceChannelId: "EMAIL-002",
    sourceOrigin: "Direct Email",
    targetSegment: "Mid-Market",
    stage: "LEAD",
    createdBy: "Admin",
    createdDate: "2024-12-02T10:16:00Z",
  },
  {
    id: "3",
    title: "XCS10-3VQ100I ADVANCED 500pcs",
    contactPerson: "Mike Chen",
    organization: "InnovateTech Solutions",
    name: "Mike Chen",
    phone: "+1 456 789 0123",
    email: "mike@innovatetech.com",
    value: 12300,
    currency: "USD",
    label: "WARM" as Labels,
    owner: "Raj Sharma",
    sourceChannel: "Referral",
    sourceChannelId: "REF-003",
    sourceOrigin: "Partner Referral",
    targetSegment: "SMB",
    stage: "QUOTATION_RECEIVED_FROM_SUPPLIER",
    createdBy: "Admin",
    createdDate: "2024-12-06T13:04:00Z",
  },
  {
    id: "4",
    title: "MB2011SD3G01-CA 2pcs",
    contactPerson: "Emily Davis",
    organization: "Global Electronics Inc",
    name: "Emily Davis",
    phone: "+1 567 890 1234",
    email: "emily@globalelec.com",
    value: 25000,
    currency: "USD",
    label: "HOT" as Labels,
    owner: "Kaushik Iyer",
    sourceChannel: "Phone",
    sourceChannelId: "PHONE-004",
    sourceOrigin: "Cold Call",
    targetSegment: "Enterprise",
    quotationLink: "https://example.com/quote-004",
    stage: "QUOTATION_SHARED_WITH_CUSTOMER",
    createdBy: "Admin",
    createdDate: "2024-12-10T10:05:00Z",
  },
  {
    id: "5",
    title: "P1016NXN5FFB 453pcs CC",
    contactPerson: "David Wilson",
    organization: "Quantum Systems",
    name: "David Wilson",
    phone: "+1 678 901 2345",
    email: "david@quantumsys.com",
    value: 18900,
    currency: "USD",
    label: "HOT" as Labels,
    owner: "Priya Patel",
    sourceChannel: "Social Media",
    sourceChannelId: "SM-005",
    sourceOrigin: "LinkedIn",
    targetSegment: "Enterprise",
    notesText: "Urgent requirement, decision expected by end of month",
    stage: "NEGOTIATION_STARTED",
    createdBy: "Admin",
    createdDate: "2024-12-10T11:08:00Z",
  },
  {
    id: "6",
    title: "AF032GEC5A-2001A2 1500pcs",
    contactPerson: "Lisa Anderson",
    organization: "NextGen Manufacturing",
    name: "Lisa Anderson",
    phone: "+1 789 012 3456",
    email: "lisa@nextgenman.com",
    value: 32000,
    currency: "EUR",
    label: "HOT" as Labels,
    owner: "Kaushik Iyer",
    sourceChannel: "Event",
    sourceChannelId: "EVENT-006",
    sourceOrigin: "Tech Conference 2024",
    targetSegment: "Enterprise",
    stage: "PO_RECEIVED",
    createdBy: "Admin",
    createdDate: "2024-12-11T11:35:00Z",
  },
  {
    id: "7",
    title: "VL1CKGP500 10-50 pcs",
    contactPerson: "Robert Taylor",
    organization: "SmartTech Devices",
    name: "Robert Taylor",
    phone: "+1 890 123 4567",
    email: "robert@smarttech.com",
    value: 9500,
    currency: "GBP",
    label: "COLD" as Labels,
    owner: "Raj Sharma",
    sourceChannel: "Website",
    sourceChannelId: "WEB-007",
    sourceOrigin: "Pricing Page",
    targetSegment: "SMB",
    stage: "LEAD",
    createdBy: "Admin",
    createdDate: "2024-12-11T11:36:00Z",
  },
  {
    id: "8",
    title: "MTSMC-L4N1-U 600 pcs",
    contactPerson: "Jennifer Martinez",
    organization: "Precision Components Co",
    name: "Jennifer Martinez",
    phone: "+1 901 234 5678",
    email: "jennifer@precisioncomp.com",
    value: 21000,
    currency: "USD",
    label: "HOT" as Labels,
    owner: "Priya Patel",
    sourceChannel: "Email",
    sourceChannelId: "EMAIL-008",
    sourceOrigin: "Newsletter Signup",
    targetSegment: "Mid-Market",
    notesText: "Interested in bulk discount, schedule call next week",
    stage: "QUOTATION_RECEIVED_FROM_SUPPLIER",
    createdBy: "Admin",
    createdDate: "2024-12-11T12:06:00Z",
  },
  {
    id: "9",
    title: "EP20K200EFC484-3 10pcs",
    contactPerson: "James Brown",
    organization: "Circuit Solutions Ltd",
    name: "James Brown",
    phone: "+1 012 345 6789",
    email: "james@circuitsol.com",
    value: 7800,
    currency: "USD",
    label: "WARM" as Labels,
    owner: "Kaushik Iyer",
    sourceChannel: "Referral",
    sourceChannelId: "REF-009",
    sourceOrigin: "Customer Referral",
    targetSegment: "SMB",
    stage: "LEAD",
    createdBy: "Admin",
    createdDate: "2024-12-11T12:08:00Z",
  },
  {
    id: "10",
    title: "WT32I-A-AI6IAP 500PCS",
    contactPerson: "Amanda White",
    organization: "Industrial Automation Inc",
    name: "Amanda White",
    phone: "+1 123 456 7890",
    email: "amanda@indauto.com",
    value: 44000,
    currency: "USD",
    label: "HOT" as Labels,
    owner: "Raj Sharma",
    sourceChannel: "Phone",
    sourceChannelId: "PHONE-010",
    sourceOrigin: "Inbound Call",
    targetSegment: "Enterprise",
    quotationLink: "https://example.com/quote-010",
    notesText: "Major project, multiple stakeholders involved",
    stage: "NEGOTIATION_STARTED",
    createdBy: "Admin",
    createdDate: "2024-12-12T10:57:00Z",
  },
];

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<Labels | "">("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [page, selectedLabel, selectedOwner]);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      if (USE_MOCK_DATA) {
        // 🎭 Use mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

        let filtered = [...mockLeads];

        // Filter by label
        if (selectedLabel) {
          filtered = filtered.filter((lead) => lead.label === selectedLabel);
        }

        // Filter by owner
        if (selectedOwner) {
          filtered = filtered.filter((lead) =>
            lead.owner.toLowerCase().includes(selectedOwner.toLowerCase())
          );
        }

        // Pagination
        const pageSize = 20;
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedLeads = filtered.slice(startIndex, endIndex);

        setLeads(paginatedLeads);
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
      } else {
        // 🌐 Use real API
        const params: any = {
          page: page + 1,
          size: 20,
        };

        if (selectedLabel) params.filters = { label: selectedLabel };
        if (selectedOwner) params.filters = { ...params.filters, owner: selectedOwner };

        const response = await leadService.getAllLeads(params);
        setLeads(response.content || response);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || response.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.title?.toLowerCase().includes(query) ||
      lead.organization?.toLowerCase().includes(query) ||
      lead.owner?.toLowerCase().includes(query) ||
      lead.contactPerson?.toLowerCase().includes(query)
    );
  });

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      WARM: "bg-yellow-100 text-yellow-700",
      HOT: "bg-red-100 text-red-700",
      COLD: "bg-blue-100 text-blue-700",
    };
    return colors[label] || "bg-gray-100 text-gray-700";
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredLeads.map((lead) => lead.id));
      setSelectedLeads(allIds);
      setSelectAll(true);
    }
  };

  // Handle individual checkbox
  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
    setSelectAll(newSelected.size === filteredLeads.length);
  };

  // Handle navigation
  const handleCreateLead = () => {
    navigate("/leads/create");
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleEditLead = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/leads/edit/${leadId}`);
  };

  const handleDeleteLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      try {
        if (USE_MOCK_DATA) {
          // Mock delete
          await new Promise((resolve) => setTimeout(resolve, 500));
          setLeads(leads.filter((lead) => lead.id !== leadId));
          setOpenMenuId(null);
          // Show success message
          alert("Lead deleted successfully");
        } else {
          // Real API call
          const response = await leadService.deleteLead(leadId);
          console.log('Delete response:', response);
          setOpenMenuId(null);
          fetchLeads(); // Refresh the list
          // Show success message
          alert(response.message || "Lead deleted successfully");
        }
      } catch (error: any) {
        console.error("Failed to delete lead:", error);
        const errorMessage = error.response?.data?.message || "Failed to delete lead";
        alert(errorMessage);
      }
    }
  };

  // Toggle menu
  const toggleMenu = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === leadId ? null : leadId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Mock Mode Banner */}
      {USE_MOCK_DATA && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center justify-between">
          <span className="text-sm text-yellow-800">
            🎭 <strong>Mock Mode:</strong> Using sample data. Set USE_MOCK_DATA = false when API is ready.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm">≡</span>
            <span className="text-gray-600">Leads / Leads Inbox</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search leads..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2"
          >
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm">Select all</span>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <FaEllipsisH size={18} />
          </button>
          <button
            onClick={handleCreateLead}
            className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
          >
            <FaPlus size={16} />
            <span className="text-sm font-medium">Lead</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{totalElements} leads</span>

          {/* Label Filter */}
          <div className="relative">
            <select
              value={selectedLabel}
              onChange={(e) => {
                setSelectedLabel(e.target.value as Labels | "");
                setPage(0);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm appearance-none pr-8 cursor-pointer"
            >
              <option value="">All labels</option>
              <option value="HOT">HOT</option>
              <option value="WARM">WARM</option>
              <option value="COLD">COLD</option>
            </select>
            <FaTag className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Owner Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by owner..."
              value={selectedOwner}
              onChange={(e) => {
                setSelectedOwner(e.target.value);
                setPage(0);
              }}
              className="px-3 py-1.5 pl-8 border border-gray-300 rounded hover:bg-gray-50 text-sm w-40"
            />
            <FaUser className="absolute left-2 top-2 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading leads...</div>
          </div>
        ) : (
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Labels
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {lead.title}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{lead.organization}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getLabelColor(
                          lead.label
                        )}`}
                      >
                        {lead.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{lead.owner}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {lead.value ? `${lead.currency} ${lead.value.toLocaleString()}` : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {lead.createdDate
                          ? new Date(lead.createdDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleMenu(lead.id, e)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaEllipsisH size={16} className="text-gray-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === lead.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <button
                            onClick={() => handleViewLead(lead.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaEye className="mr-3" size={14} />
                            View Details
                          </button>
                          <button
                            onClick={(e) => handleEditLead(lead.id, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaEdit className="mr-3" size={14} />
                            Edit Lead
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={(e) => handleDeleteLead(lead.id, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <FaTrash className="mr-3" size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery
                      ? `No leads found matching "${searchQuery}"`
                      : "No leads found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;