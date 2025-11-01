import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaFileAlt,
  FaCog,
  FaPlus,
  FaSearch,
  FaEllipsisH,
  FaTag,
  FaExclamationCircle,
  FaColumns,
} from "react-icons/fa";

// Mock data
const mockLeads = [
  {
    id: 1,
    title: "RP509Z001D-E2-F 10000pcs",
    nextActivity: "No activity",
    labels: ["WARM"],
    source: "Manually created",
    created: "Dec 2, 2024, 9:50 AM",
    owner: "Kaushik Iyer",
    value: "$15,000",
  },
  {
    id: 2,
    title: "XPC8240LZU200E 1000P...",
    nextActivity: "No activity",
    labels: ["WARM"],
    source: "Manually created",
    created: "Dec 2, 2024, 10:16 AM",
    owner: "Kaushik Iyer",
    value: "$8,500",
  },
  {
    id: 3,
    title: "XCS10-3VQ100I ADVANC...",
    nextActivity: "No activity",
    labels: ["WARM"],
    source: "Manually created",
    created: "Dec 6, 2024, 1:04 PM",
    owner: "Kaushik Iyer",
    value: "$12,300",
  },
  {
    id: 4,
    title: "MB2011SD3G01-CA 2pcs",
    nextActivity: "No activity",
    labels: ["HOT"],
    source: "Manually created",
    created: "Dec 10, 2024, 10:5 AM",
    owner: "Kaushik Iyer",
    value: "$25,000",
  },
  {
    id: 5,
    title: "P1016NXN5FFB 453pcs CC",
    nextActivity: "No activity",
    labels: ["HOT"],
    source: "Manually created",
    created: "Dec 10, 2024, 11:08 AM",
    owner: "Kaushik Iyer",
    value: "$18,900",
  },
];

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState(mockLeads);

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      WARM: "bg-yellow-100 text-yellow-700",
      HOT: "bg-red-100 text-red-700",
      CHINA: "bg-gray-100 text-gray-700",
    };
    return colors[label] || "bg-blue-100 text-blue-700";
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredLeads(mockLeads);
    } else {
      const filtered = mockLeads.filter((lead) =>
        lead.title.toLowerCase().includes(query.toLowerCase()) ||
        lead.owner.toLowerCase().includes(query.toLowerCase()) ||
        lead.source.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLeads(filtered);
    }
  };

  // Navigation handlers
  const handleCreateLead = () => {
    navigate("/leads/create");
  };

  const handleGoToUsers = () => {
    navigate("/users");
  };

  const handleGoToKanban = () => {
    navigate("/leads/kanban");
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 bg-indigo-900 flex flex-col items-center py-4 space-y-6 flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-bold text-indigo-900">
          P
        </div>

        {/* Users Button */}
        <button
          onClick={handleGoToUsers}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded"
          title="Users"
        >
          <FaUser size={20} />
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded"
         title="Leads">
          <FaFileAlt size={20} />
        </button>

        {/* Leads Button - Active */}
        <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded bg-indigo-800">
          <FaPlus size={20} />
        </button>

        {/* Kanban View Button */}
        <button
          onClick={handleGoToKanban}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded"
          title="Kanban View"
        >
          <FaColumns size={20} />
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded">
          <FaCog size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 hover:text-indigo-600">
              <span className="text-sm">≡</span>
              <span className="text-gray-600">Leads / Leads Inbox</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search leads..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreateLead}
              className="p-2 hover:bg-gray-100 rounded"
              title="Quick Add"
            >
              <FaPlus size={20} />
            </button>
            <div className="flex items-center space-x-2 text-sm">
              <FaUser size={16} />
              <span>TC</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
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
            <span className="text-sm text-gray-600">
              {filteredLeads.length} leads
            </span>
            <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
              <FaTag size={16} />
              <span className="text-sm">All labels</span>
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
              <FaUser size={16} />
              <span className="text-sm">Everyone</span>
            </button>
            <button
              onClick={handleGoToKanban}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2"
              title="Kanban View"
            >
              <FaColumns size={16} />
              <span className="text-sm">Kanban</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Next Activity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Labels
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Source Origin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Lead Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Owner
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
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {lead.title}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <FaExclamationCircle className="text-orange-500" size={14} />
                        <span className="text-sm text-gray-600">
                          {lead.nextActivity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        {lead.labels.map((label, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded text-xs font-medium ${getLabelColor(
                              label
                            )}`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <FaUser size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{lead.created}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{lead.owner}</span>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <FaEllipsisH size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No leads found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;