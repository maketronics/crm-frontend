import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function CampaignPage() {
  const navigate = useNavigate();

  const campaignCards = [
    {
      id: 'emails',
      title: 'Email Campaign',
      icon: EnvelopeIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:border-blue-300',
      route: '/campaigns/emails'
    },
    {
      id: 'deals',
      title: 'Deal Campaign',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:border-green-300',
      route: '/campaigns/deals'
    }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
          <p className="text-gray-600">
            Manage your marketing campaigns and promotional deals
          </p>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaignCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.route)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-lg ${card.hoverColor}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`${card.color} p-4 rounded-full mb-4`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {card.title}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}