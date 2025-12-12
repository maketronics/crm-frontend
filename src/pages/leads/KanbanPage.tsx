import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  PlusIcon,
  ListBulletIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../../lib/leadService';
import { kanbanService } from '../../lib/kanbanService';
import type { LeadStage } from '../../types';
import { StageTransitionModal } from '../../components/leads/StageTransitionModal';
import { KanbanLeadDetailModal } from '../../components/leads/KanbanLeadDetailModal';

// Mock mode toggle
const USE_MOCK_DATA = false;

const STAGES: { id: Stage; name: string; color: string }[] = [
  { id: 'LEAD', name: 'Lead', color: 'bg-gray-500' },
  { id: 'OPPORTUNITY', name: 'Opportunity', color: 'bg-blue-500' },
  { id: 'QUOTATION_RECEIVED_FROM_SUPPLIER', name: 'Quotation Received', color: 'bg-purple-500' },
  { id: 'QUOTATION_SHARED_WITH_CUSTOMER', name: 'Quotation Shared', color: 'bg-yellow-500' },
  { id: 'NEGOTIATION_STARTED', name: 'Negotiations', color: 'bg-orange-500' },
  { id: 'PO_RECEIVED', name: 'PO Received', color: 'bg-green-500' },
  { id: 'PARTS_DELIVERED', name: 'Parts Delivered', color: 'bg-teal-500' }
];

interface Lead {
  id: string;
  title: string;
  contactPerson: string;
  organization: string;
  value?: number;
  currency?: string;
  label: string;
  stage: Stage;
  owner?: string;
}

// Mock leads data
const mockLeads: Lead[] = [
  {
    id: '1',
    title: 'RP509Z001D-E2-F 10000pcs',
    contactPerson: 'John Smith',
    organization: 'TechCorp Industries',
    value: 15000,
    currency: 'USD',
    label: 'WARM',
    stage: 'LEAD',
    owner: 'Kaushik Iyer'
  },
  {
    id: '2',
    title: 'XPC8240LZU200E 1000pcs',
    contactPerson: 'Sarah Johnson',
    organization: 'MegaSystems Ltd',
    value: 8500,
    currency: 'USD',
    label: 'WARM',
    stage: 'LEAD',
    owner: 'Kaushik Iyer'
  },
  {
    id: '3',
    title: 'MB2011SD3G01-CA 2pcs',
    contactPerson: 'Emily Davis',
    organization: 'Global Electronics Inc',
    value: 25000,
    currency: 'USD',
    label: 'HOT',
    stage: 'OPPORTUNITY',
    owner: 'Kaushik Iyer'
  },
  {
    id: '4',
    title: 'P1016NXN5FFB 453pcs',
    contactPerson: 'David Wilson',
    organization: 'Quantum Systems',
    value: 18900,
    currency: 'USD',
    label: 'HOT',
    stage: 'QUOTATION_RECEIVED_FROM_SUPPLIER',
    owner: 'Priya Patel'
  }
];

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

function LeadCard({ lead, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      HOT: 'bg-red-100 text-red-700 border-red-200',
      WARM: 'bg-orange-100 text-orange-700 border-orange-200',
      COLD: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[label] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1 leading-tight pr-2">{lead.title}</h3>
        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{lead.contactPerson}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <BuildingOffice2Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{lead.organization}</span>
        </div>
      </div>

      {lead.label && (
        <div className="mt-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getLabelColor(lead.label)}`}>
            {lead.label}
          </span>
        </div>
      )}

      {lead.value && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-900">
            <CurrencyDollarIcon className="w-3.5 h-3.5" />
            <span>{lead.value.toLocaleString()} {lead.currency}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface KanbanColumnProps {
  stage: typeof STAGES[0];
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

function KanbanColumn({ stage, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef } = useSortable({ id: stage.id });

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
            <h2 className="font-semibold text-gray-900 text-sm">{stage.name}</h2>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <CurrencyDollarIcon className="w-3.5 h-3.5" />
            <span>${totalValue.toLocaleString()}</span>
          </div>
        )}
      </div>

      <SortableContext id={stage.id} items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
          {leads.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p>Drop leads here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export const KanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    lead: Lead;
    targetStage: Stage;
    missingFields: string[];
  } | null>(null);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLeads(mockLeads);
      } else {
        const response = await leadService.getAllLeads({ page: 1, size: 1000 });
        setLeads(response.content || response);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the dragged lead
    const activeLead = leads.find(l => l.id === activeId);
    if (!activeLead) return;

    // Determine target stage
    let targetStage: Stage | null = null;
    
    // Check if dropped on a stage column
    const targetStageObj = STAGES.find(s => s.id === overId);
    if (targetStageObj) {
      targetStage = targetStageObj.id;
    } else {
      // Dropped on another lead - get that lead's stage
      const targetLead = leads.find(l => l.id === overId);
      if (targetLead) {
        targetStage = targetLead.stage;
      }
    }

    if (!targetStage || activeLead.stage === targetStage) return;

    console.log('🎯 Attempting move:', {
      lead: activeLead.title,
      from: activeLead.stage,
      to: targetStage
    });

    // Validate stage transition
    const validation = kanbanService.validateStageTransition(activeLead.stage, targetStage);

    if (!validation.isValid) {
      if (validation.error) {
        // Cannot move to this stage (skipping stages)
        alert(validation.error);
        return;
      } else if (validation.missingFields.length > 0) {
        // Need to fill in required fields
        console.log('⚠️ Missing fields:', validation.missingFields);
        
        // Optimistically update UI
        setLeads(prev => prev.map(l =>
          l.id === activeLead.id ? { ...l, stage: targetStage } : l
        ));

        setPendingMove({
          lead: activeLead,
          targetStage: targetStage,
          missingFields: validation.missingFields
        });
        return;
      }
    }

    // Can move directly (validation passed)
    await executeMove(activeLead, targetStage, {});
  };

  const executeMove = async (lead: Lead, targetStage: Stage, formData: any) => {
    console.log('🚀 Executing move:', { leadId: lead.id, targetStage, formData });

    // Optimistically update UI
    setLeads(prev => prev.map(l =>
      l.id === lead.id ? { ...l, stage: targetStage } : l
    ));

    try {
      if (USE_MOCK_DATA) {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Mock: Lead moved successfully');
      } else {
        // Real API call
        await kanbanService.moveLeadToStage(lead.id, lead.stage, targetStage, formData);
        console.log('✅ Lead moved successfully');
      }
    } catch (error: any) {
      console.error('❌ Failed to move lead:', error);
      
      // Revert on error
      setLeads(prev => prev.map(l =>
        l.id === lead.id ? { ...l, stage: lead.stage } : l
      ));
      
      alert(error.message || 'Failed to move lead. Please try again.');
    }
  };

  const handleConfirmMove = async (formData: any) => {
    if (!pendingMove) return;

    try {
      await executeMove(pendingMove.lead, pendingMove.targetStage, formData);
      setPendingMove(null);
    } catch (error: any) {
      console.error('❌ Error in handleConfirmMove:', error);
      
      // Revert
      setLeads(prev => prev.map(l =>
        l.id === pendingMove.lead.id ? pendingMove.lead : l
      ));
      
      setPendingMove(null);
      throw error;
    }
  };

  const handleCancelMove = () => {
    if (pendingMove) {
      // Revert optimistic update
      setLeads(prev => prev.map(l =>
        l.id === pendingMove.lead.id ? { ...l, stage: pendingMove.lead.stage } : l
      ));
    }
    setPendingMove(null);
  };

  const getLeadsByStage = (stageId: Stage) => {
    return leads.filter(lead => lead.stage === stageId);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsDetailModalOpen(true);
  };

  const activeLead = leads.find(l => l.id === activeId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      {/* Mock Mode Banner */}
      {USE_MOCK_DATA && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-yellow-800">
             <strong>Mock Mode:</strong> Using sample data. Drag & drop between stages to test.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {leads.length} deals
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <ListBulletIcon className="h-4 w-4" />
              <span>List View</span>
            </button>
            <button
              onClick={loadLeads}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/leads/create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Deal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center space-x-2 flex-shrink-0">
        <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You can only move leads to the next stage sequentially. Skipping stages is not allowed.
        </p>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {STAGES.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsByStage(stage.id)}
                onLeadClick={handleLeadClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId && activeLead ? (
              <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-400 w-80 rotate-2">
                <h3 className="font-semibold text-gray-900 text-sm">{activeLead.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{activeLead.organization}</p>
                {activeLead.value && (
                  <p className="text-xs font-medium text-gray-900 mt-2">
                    ${activeLead.value.toLocaleString()} {activeLead.currency}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Stage Transition Modal */}
      {pendingMove && (
        <StageTransitionModal
          leadId={pendingMove.lead.id}
          leadTitle={pendingMove.lead.title}
          currentStage={pendingMove.lead.stage}
          targetStage={pendingMove.targetStage}
          missingFields={pendingMove.missingFields}
          isOpen={true}
          onClose={handleCancelMove}
          onConfirm={handleConfirmMove}
        />
      )}

      {/* ADD THIS NEW MODAL - Lead Detail Modal */}
      {selectedLeadId && (
        <KanbanLeadDetailModal
          leadId={selectedLeadId}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLeadId(null);
          }}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};