import React from 'react';
import { Labels, Stage, getLeadName, getLeadPhone } from '../../types/lead.types';
import type { Lead } from '../../types/lead.types';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  isLoading,
  onDelete,
  onView,
  onEdit,
}) => {
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

  function formatStage(stage: string | null | undefined) {
  if (!stage) return "-";

  return stage.replace(/_/g, " ");
};

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg ">
      <div className="overflow-x-auto">
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getLeadName(lead)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.organization}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {lead.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLabelColor(
                      lead.label
                    )}`}
                  >
                    {lead.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(
                      lead.stage
                    )}`}
                  >
                    {formatStage(lead.stage)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {lead.value
                      ? `${lead.currency} ${lead.value.toLocaleString()}`
                      : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.owner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(lead.id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(lead.id)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};