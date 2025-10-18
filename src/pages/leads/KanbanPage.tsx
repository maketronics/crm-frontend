import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  CubeIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  PlusIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { leadStore } from '../../stores/leadStore';
import { authStore } from '../../stores/authStore';
import { userStore } from '../../stores/userStore';
import { leadService } from '../../lib/leadService';
import { kanbanService } from '../../lib/kanbanService';
import { LoadingSpinner, Button } from '../../components/ui';
import { LeadDetailModal, StageTransitionModal } from '../../components/leads';
import type { Lead, LeadStage, User as UserType } from '../../types';

const STAGES = [
  { id: 'lead' as LeadStage, name: 'Lead/Qualified', color: 'bg-gray-500' },
  { id: 'opportunity' as LeadStage, name: 'Opportunity', color: 'bg-blue-500' },
  { id: 'quotation_received' as LeadStage, name: 'Quotation Received', color: 'bg-purple-500' },
  { id: 'quotation_shared' as LeadStage, name: 'Quotation Shared', color: 'bg-yellow-500' },
  { id: 'negotiation_started' as LeadStage, name: 'Negotiations Started', color: 'bg-orange-500' },
  { id: 'po_received' as LeadStage, name: 'PO Received', color: 'bg-green-500' },
  { id: 'parts_delivered' as LeadStage, name: 'Parts Delivered', color: 'bg-teal-500' }
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

  const getValidationStatus = (stage: LeadStage) => {
    const result = kanbanService.validateStageTransition(lead, stage);
    return {
      isValid: result.isValid,
      missingFields: result.missingFields,
      error: result.error
    };
  };

  const currentStage = (lead.stage || 'lead') as LeadStage;
  const { isValid, missingFields } = getValidationStatus(currentStage);

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      hot: 'bg-red-100 text-red-700 border-red-200',
      warm: 'bg-orange-100 text-orange-700 border-orange-200',
      cold: 'bg-blue-100 text-blue-700 border-blue-200',
      urgent: 'bg-pink-100 text-pink-700 border-pink-200',
      priority: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[label.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
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
        <div
          className="flex-shrink-0"
          title={isValid
            ? 'All required fields filled ✓'
            : `⚠️ Missing fields for this stage: ${missingFields.join(', ')}`
          }
        >
          {isValid ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
          )}
        </div>
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

      {lead.labels && lead.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {lead.labels.slice(0, 2).map((label, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getLabelColor(label)}`}
            >
              {label.toUpperCase()}
            </span>
          ))}
          {lead.labels.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
              +{lead.labels.length - 2}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs">
          {lead.value > 0 && (
            <div className="flex items-center gap-1 font-medium text-gray-900">
              <CurrencyDollarIcon className="w-3.5 h-3.5" />
              <span>{lead.value.toLocaleString()} {lead.currencyType}</span>
            </div>
          )}
          {lead.quantity && (
            <div className="flex items-center gap-1 text-gray-500">
              <CubeIcon className="w-3.5 h-3.5" />
              <span>{lead.quantity}</span>
            </div>
          )}
        </div>

        {lead.country && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span>{lead.country}</span>
          </div>
        )}
      </div>
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
  const currencies = [...new Set(leads.map(l => l.currencyType).filter(Boolean))];

  const leadsWithIssues = leads.filter(lead => {
    const validation = kanbanService.validateStageTransition(lead, stage.id);
    return !validation.isValid;
  }).length;

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
            {currencies.length === 1 && <span className="text-gray-500">{currencies[0]}</span>}
          </div>
        )}

        {leadsWithIssues > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded border border-yellow-200">
            <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{leadsWithIssues} need{leadsWithIssues === 1 ? 's' : ''} attention</span>
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
              <CubeIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
  const { leads, isLoading, setLoading, updateLead, setLeads } = leadStore();
  const { user } = authStore();
  const { users, setUsers } = userStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    lead: Lead;
    targetStage: LeadStage;
    missingFields: string[];
  } | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadLeads();
    loadUsers();
  }, []);

  useEffect(() => {
    // ✅ Enrich leads with cached stage data from localStorage
    const enrichedLeads = kanbanService.enrichLeadsWithStageData(leads);
    setLocalLeads(enrichedLeads);
    console.log('📦 Enriched', enrichedLeads.length, 'leads with cached stage data');
  }, [leads]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadService.getAllLeads({
        page: 1,
        size: 1000,
      });
      setLeads(response);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (users && users.length > 0) return;

    try {
      const { authService } = await import('../../lib/authService');
      const response = await authService.getUsers(0, 100);
      setUsers(response);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeStage = STAGES.find(s => s.id === activeId);
    const overStage = STAGES.find(s => s.id === overId);

    if (activeStage || overStage) return;

    const activeLead = localLeads.find(l => l.id === activeId);
    const overLead = localLeads.find(l => l.id === overId);

    if (!activeLead) return;

    const activeLeadStage = activeLead.stage || 'lead';
    const overLeadStage = overLead?.stage || over.id;

    if (activeLeadStage !== overLeadStage) {
      setLocalLeads(prev => prev.map(lead =>
        lead.id === activeId
          ? { ...lead, stage: overLeadStage as LeadStage }
          : lead
      ));
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeLead = localLeads.find(l => l.id === activeId);
    const overStage = STAGES.find(s => s.id === overId);

    if (activeLead && overStage && activeLead.stage !== overStage.id) {
      const newStage = overStage.id;

      // ✅ Load cached stage IDs for this lead
      const cached = kanbanService.loadLeadStageFromStore(activeLead.id);
      const enrichedLead = { ...activeLead, ...cached };

      console.log('🔍 Validating transition:', {
        leadId: enrichedLead.id,
        from: enrichedLead.stage,
        to: newStage,
        opportunityId: enrichedLead.opportunityId,
        quotationSupplierId: enrichedLead.quotationSupplierId,
        quotationCustomerId: enrichedLead.quotationCustomerId,
      });

      // Validate with enriched lead
      const validation = kanbanService.validateStageTransition(enrichedLead, newStage);

      if (!validation.isValid) {
        if (validation.error) {
          // Dependency missing - show error alert
          alert(`Cannot move to ${overStage.name}\n\n${validation.error}`);
          
          // Revert optimistic update
          setLocalLeads(prev => prev.map(l =>
            l.id === activeLead.id
              ? { ...l, stage: activeLead.stage }
              : l
          ));
          return;
        } else if (validation.missingFields.length > 0) {
          // Fields missing - show form with enriched lead
          console.log('⚠️ Missing fields:', validation.missingFields);
          setPendingMove({
            lead: enrichedLead,
            targetStage: newStage,
            missingFields: validation.missingFields
          });
          return;
        }
      }

      // Validation passed - proceed with move
      await executeMove(enrichedLead, newStage);
    }
  };

  const executeMove = async (lead: Lead, newStage: LeadStage, additionalData?: Partial<Lead>) => {
    // Optimistic update
    setLocalLeads(prev => prev.map(l =>
      l.id === lead.id
        ? { ...l, stage: newStage, ...additionalData }
        : l
    ));

    try {
      // Merge additional data with lead
      const leadWithUpdates = { ...lead, ...additionalData };
      
      console.log('🚀 Executing move:', {
        leadId: lead.id,
        newStage,
        hasOpportunityId: !!leadWithUpdates.opportunityId,
        hasQuotationSupplierId: !!leadWithUpdates.quotationSupplierId,
        hasQuotationCustomerId: !!leadWithUpdates.quotationCustomerId,
      });
      
      // Call kanbanService which will create the stage-specific record and cache the result
      const result = await kanbanService.moveLeadToStage(leadWithUpdates, newStage, user?.id || 'system');
      
      // Update the store
      updateLead(lead.id, { ...result, ...additionalData });
      
      // Re-enrich localLeads with fresh cache
      const cached = kanbanService.loadLeadStageFromStore(lead.id);
      setLocalLeads(prev => prev.map(l =>
        l.id === lead.id
          ? { ...l, ...result, ...cached, ...additionalData }
          : l
      ));
      
      console.log(`✅ Lead ${lead.id} successfully moved to ${newStage}`);
    } catch (error: any) {
      console.error('❌ Failed to update lead stage:', error);
      
      // Revert on error
      setLocalLeads(prev => prev.map(l =>
        l.id === lead.id
          ? { ...l, stage: lead.stage }
          : l
      ));
      
      alert(error.message || 'Failed to update lead stage. Please try again.');
    }
  };

  const handleConfirmMove = async (updatedData: Partial<Lead>) => {
    if (!pendingMove) return;

    try {
      console.log('📝 User provided data for stage transition:', updatedData);
      
      // Don't update the lead via /leads API - just pass data to stage-specific APIs
      await executeMove(
        pendingMove.lead,
        pendingMove.targetStage,
        updatedData
      );

      setPendingMove(null);
    } catch (error: any) {
      console.error('❌ Error in handleConfirmMove:', error);
      alert(error.message || 'Failed to update lead');
      
      // Revert
      setLocalLeads(prev => prev.map(l =>
        l.id === pendingMove.lead.id
          ? pendingMove.lead
          : l
      ));
      
      setPendingMove(null);
    }
  };

  const handleCancelMove = () => {
    if (pendingMove) {
      // Revert optimistic update
      setLocalLeads(prev => prev.map(l =>
        l.id === pendingMove.lead.id
          ? { ...l, stage: pendingMove.lead.stage }
          : l
      ));
    }
    setPendingMove(null);
  };

  const getLeadsByStage = (stageId: LeadStage) => {
    return localLeads.filter(lead => (lead.stage || 'lead') === stageId);
  };

  const activeLead = localLeads.find(l => l.id === activeId);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const getAssignedUser = (lead: Lead): UserType | undefined => {
    if (!lead.assignedTo || !users) return undefined;
    return users.find(u => u.id === lead.assignedTo);
  };

  if (isLoading && localLeads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {localLeads.length} deals
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/leads')}
            >
              <ListBulletIcon className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadLeads}
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/leads/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
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
                {activeLead.value > 0 && (
                  <p className="text-xs font-medium text-gray-900 mt-2">
                    ${activeLead.value.toLocaleString()} {activeLead.currencyType}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          assignedUser={getAssignedUser(selectedLead)}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Stage Transition Modal */}
      {pendingMove && (
        <StageTransitionModal
          lead={pendingMove.lead}
          targetStage={pendingMove.targetStage}
          missingFields={pendingMove.missingFields}
          isOpen={true}
          onClose={handleCancelMove}
          onConfirm={handleConfirmMove}
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