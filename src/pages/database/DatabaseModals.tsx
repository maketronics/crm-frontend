import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export interface Geography {
  primaryRegions: string;
  country?: string;
  state?: string;
  timeZone?: string;
  languagePreference?: string;
  primaryTradeCurrency?: string;
}

export interface Industry {
  industrySegments: string;
  endProductType?: string;
  regulatoryStandardsFollowed?: string;
}

export interface CompanyType {
  companySegments: string;
  inHouseProduction?: string;
  procurementModel?: string;
}

export interface LeadSeniority {
  primaryDesignations: string;
  department?: string;
  decisionMakingPower?: string;
}

export interface RfqType {
  rfqSegments: string;
  urgencyLevel?: string;
  annualUsageVolume?: string;
  TargetPriceAvailability?: string;
}

export interface BusinessMetrics {
  globalPresence?: string;
  annualRevenueRange?: string;
  employeesNumber?: string;
  yearsInBusiness?: string;
  categoryLevel?: string;
}

export interface Relationship {
  stage: string;
}

export interface LeadSource {
  leadSourceSegments: string;
  coldCalling: string;
  others?: string;
}

export interface CreditRating {
  creditTermPreference?: string;
  paymentReliability?: string;
  riskLevel?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  geography?: Geography;
  industry?: Industry;
  companyType?: CompanyType;
  leadSeniority?: LeadSeniority;
  rfqType?: RfqType;
  businessMetrics?: BusinessMetrics;
  relationship?: Relationship;
  leadSource?: LeadSource;
  creditRating?: CreditRating;
  remarks?: string;
}

export interface FilterState {
  name: string;
  email: string;
  phoneNo: string;
  primaryRegions: string;
  industrySegments: string;
  companySegments: string;
  primaryDesignations: string;
  rfqSegments: string;
  stage: string;
  leadSourceSegments: string;
  coldCalling: string;
}

// Create Customer Modal Component
export const CreateCustomerModal: React.FC<{
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  apiBaseUrl: string;
  useMockData: boolean;
}> = ({ onClose, onSuccess, apiBaseUrl, useMockData }) => {
  const [formData, setFormData] = useState<Customer>({
    id: '',
    name: '',
    email: '',
    phoneNo: '',
    geography: {
      primaryRegions: '',
      country: '',
      state: '',
      timeZone: '',
      languagePreference: '',
      primaryTradeCurrency: ''
    },
    industry: {
      industrySegments: '',
      endProductType: '',
      regulatoryStandardsFollowed: ''
    },
    companyType: {
      companySegments: '',
      inHouseProduction: '',
      procurementModel: ''
    },
    leadSeniority: {
      primaryDesignations: '',
      department: '',
      decisionMakingPower: ''
    },
    rfqType: {
      rfqSegments: '',
      urgencyLevel: '',
      annualUsageVolume: '',
      TargetPriceAvailability: ''
    },
    businessMetrics: {
      globalPresence: '',
      annualRevenueRange: '',
      employeesNumber: '',
      yearsInBusiness: '',
      categoryLevel: ''
    },
    relationship: {
      stage: ''
    },
    leadSource: {
      leadSourceSegments: '',
      coldCalling: 'No',
      others: ''
    },
    creditRating: {
      creditTermPreference: '',
      paymentReliability: '',
      riskLevel: ''
    },
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useMockData) {
      alert('Customer created successfully!');
      onSuccess(formData);
      return;
    }

    // Clean up the data - remove empty strings and build proper structure
    const cleanData: any = {
      name: formData.name,
      email: formData.email,
      phoneNo: formData.phoneNo,
    };

    // Only add geography if primaryRegions is filled (required field)
    if (formData.geography?.primaryRegions) {
      cleanData.geography = {
        primaryRegions: formData.geography.primaryRegions,
        country: formData.geography.country || '',
        state: formData.geography.state || '',
        timeZone: formData.geography.timeZone || '',
        languagePreference: formData.geography.languagePreference || '',
        primaryTradeCurrency: formData.geography.primaryTradeCurrency || '',
      };
    }

    // Only add industry if industrySegments is filled (required field)
    if (formData.industry?.industrySegments) {
      cleanData.industry = {
        industrySegments: formData.industry.industrySegments,
        endProductType: formData.industry.endProductType || '',
        regulatoryStandardsFollowed: formData.industry.regulatoryStandardsFollowed || '',
      };
    }

    // Only add companyType if companySegments is filled (required field)
    if (formData.companyType?.companySegments) {
      cleanData.companyType = {
        companySegments: formData.companyType.companySegments,
        inHouseProduction: formData.companyType.inHouseProduction || '',
        procurementModel: formData.companyType.procurementModel || '',
      };
    }

    // Only add leadSeniority if primaryDesignations is filled (required field)
    if (formData.leadSeniority?.primaryDesignations) {
      cleanData.leadSeniority = {
        primaryDesignations: formData.leadSeniority.primaryDesignations,
        department: formData.leadSeniority.department || '',
        decisionMakingPower: formData.leadSeniority.decisionMakingPower || '',
      };
    }

    // Only add rfqType if rfqSegments is filled (required field)
    if (formData.rfqType?.rfqSegments) {
      cleanData.rfqType = {
        rfqSegments: formData.rfqType.rfqSegments,
        urgencyLevel: formData.rfqType.urgencyLevel || '',
        annualUsageVolume: formData.rfqType.annualUsageVolume || '',
        TargetPriceAvailability: formData.rfqType.TargetPriceAvailability || '',
      };
    }

    // Add businessMetrics with all fields as empty strings if not filled
    cleanData.businessMetrics = {
      globalPresence: formData.businessMetrics?.globalPresence || '',
      annualRevenueRange: formData.businessMetrics?.annualRevenueRange || '',
      employeesNumber: formData.businessMetrics?.employeesNumber || '',
      yearsInBusiness: formData.businessMetrics?.yearsInBusiness || '',
      categoryLevel: formData.businessMetrics?.categoryLevel || '',
    };

    // Only add relationship if stage is filled (required field)
    if (formData.relationship?.stage) {
      cleanData.relationship = {
        stage: formData.relationship.stage,
      };
    }

    // Only add leadSource if required fields are filled
    if (formData.leadSource?.leadSourceSegments && formData.leadSource?.coldCalling) {
      cleanData.leadSource = {
        leadSourceSegments: formData.leadSource.leadSourceSegments,
        coldCalling: formData.leadSource.coldCalling,
        others: formData.leadSource.others || '',
      };
    }

    // Add creditRating with all fields as empty strings if not filled
    cleanData.creditRating = {
      creditTermPreference: formData.creditRating?.creditTermPreference || '',
      paymentReliability: formData.creditRating?.paymentReliability || '',
      riskLevel: formData.creditRating?.riskLevel || '',
    };

    // Add remarks (empty string if not filled)
    cleanData.remarks = formData.remarks || '';

    try {
      console.log('Sending data:', JSON.stringify(cleanData, null, 2)); // Debug log
      
      const response = await fetch(`${apiBaseUrl}/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });
      
      if (response.ok) {
        alert('Customer created successfully!');
        const result = await response.json();
        onSuccess(result);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        alert('Error creating customer: ' + (errorData.error || errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer: ' + error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Customer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNo}
                  onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Geography Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Geography</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Regions <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.geography?.primaryRegions}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    geography: { ...formData.geography!, primaryRegions: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., India & Middle East"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.geography?.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    geography: { ...formData.geography!, country: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.geography?.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    geography: { ...formData.geography!, state: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <input
                  type="text"
                  value={formData.geography?.timeZone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    geography: { ...formData.geography!, timeZone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., GMT+5:30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language Preference</label>
                <input
                  type="text"
                  value={formData.geography?.languagePreference}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    geography: { ...formData.geography!, languagePreference: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Trade Currency</label>
                <input
                  type="text"
                  value={formData.geography?.primaryTradeCurrency}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    geography: { ...formData.geography!, primaryTradeCurrency: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., INR, USD"
                />
              </div>
            </div>
          </div>

          {/* Industry Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Industry</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry Segments <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.industry?.industrySegments}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    industry: { ...formData.industry!, industrySegments: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Electronics Manufacturing"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Product Type</label>
                <input
                  type="text"
                  value={formData.industry?.endProductType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    industry: { ...formData.industry!, endProductType: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Standards Followed</label>
                <input
                  type="text"
                  value={formData.industry?.regulatoryStandardsFollowed}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    industry: { ...formData.industry!, regulatoryStandardsFollowed: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Company Type Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Company Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Segments <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyType?.companySegments}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    companyType: { ...formData.companyType!, companySegments: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., OEM, Distributor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">In-House Production</label>
                <select
                  value={formData.companyType?.inHouseProduction}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    companyType: { ...formData.companyType!, inHouseProduction: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Model</label>
                <input
                  type="text"
                  value={formData.companyType?.procurementModel}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    companyType: { ...formData.companyType!, procurementModel: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Centralized, Decentralized"
                />
              </div>
            </div>
          </div>

          {/* Lead Seniority Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Lead Seniority</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Designations <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.leadSeniority?.primaryDesignations}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    leadSeniority: { ...formData.leadSeniority!, primaryDesignations: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Head of Procurement"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.leadSeniority?.department}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    leadSeniority: { ...formData.leadSeniority!, department: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision Making Power</label>
                <select
                  value={formData.leadSeniority?.decisionMakingPower}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    leadSeniority: { ...formData.leadSeniority!, decisionMakingPower: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>
            </div>
          </div>

          {/* RFQ Type Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">RFQ Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFQ Segments <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.rfqType?.rfqSegments}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rfqType: { ...formData.rfqType!, rfqSegments: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Regular, Bulk Order"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <select
                  value={formData.rfqType?.urgencyLevel}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rfqType: { ...formData.rfqType!, urgencyLevel: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Standard">Standard</option>
                  <option value="Immediate">Immediate</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Usage Volume</label>
                <input
                  type="text"
                  value={formData.rfqType?.annualUsageVolume}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rfqType: { ...formData.rfqType!, annualUsageVolume: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 10000 units"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Price Availability</label>
                <select
                  value={formData.rfqType?.TargetPriceAvailability}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rfqType: { ...formData.rfqType!, TargetPriceAvailability: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Metrics Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Business Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Global Presence</label>
                <select
                  value={formData.businessMetrics?.globalPresence}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    businessMetrics: { ...formData.businessMetrics!, globalPresence: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue Range</label>
                <input
                  type="text"
                  value={formData.businessMetrics?.annualRevenueRange}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    businessMetrics: { ...formData.businessMetrics!, annualRevenueRange: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., $50–$500M"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
                <input
                  type="text"
                  value={formData.businessMetrics?.employeesNumber}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    businessMetrics: { ...formData.businessMetrics!, employeesNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 200–1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                <input
                  type="text"
                  value={formData.businessMetrics?.yearsInBusiness}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    businessMetrics: { ...formData.businessMetrics!, yearsInBusiness: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 15+ years"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Level</label>
                <input
                  type="text"
                  value={formData.businessMetrics?.categoryLevel}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    businessMetrics: { ...formData.businessMetrics!, categoryLevel: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Strategic Account"
                />
              </div>
            </div>
          </div>

          {/* Relationship Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Relationship</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.relationship?.stage}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    relationship: { ...formData.relationship!, stage: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Stage</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Active Customer">Active Customer</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lead Source Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Lead Source</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source Segments <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.leadSource?.leadSourceSegments}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    leadSource: { ...formData.leadSource!, leadSourceSegments: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Website Inquiry, Trade Show"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cold Calling <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.leadSource?.coldCalling}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    leadSource: { ...formData.leadSource!, coldCalling: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Others</label>
                <input
                  type="text"
                  value={formData.leadSource?.others}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    leadSource: { ...formData.leadSource!, others: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional source information"
                />
              </div>
            </div>
          </div>

          {/* Credit Rating Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Credit Rating</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Term Preference</label>
                <input
                  type="text"
                  value={formData.creditRating?.creditTermPreference}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    creditRating: { ...formData.creditRating!, creditTermPreference: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Net 30, Net 60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reliability</label>
                <select
                  value={formData.creditRating?.paymentReliability}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    creditRating: { ...formData.creditRating!, paymentReliability: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={formData.creditRating?.riskLevel}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    creditRating: { ...formData.creditRating!, riskLevel: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Very Low">Very Low</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Any additional notes..."
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Customer Details Modal Component
export const CustomerDetailsModal: React.FC<{
  customer: Customer;
  onClose: () => void;
}> = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{customer.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{customer.phoneNo}</p>
              </div>
            </div>
          </div>

          {/* Geography */}
          {customer.geography && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Geography</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Primary Regions</p>
                  <p className="font-medium">{customer.geography.primaryRegions || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{customer.geography.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">{customer.geography.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Zone</p>
                  <p className="font-medium">{customer.geography.timeZone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Language Preference</p>
                  <p className="font-medium">{customer.geography.languagePreference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Primary Trade Currency</p>
                  <p className="font-medium">{customer.geography.primaryTradeCurrency || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Industry */}
          {customer.industry && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Industry</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Industry Segments</p>
                  <p className="font-medium">{customer.industry.industrySegments || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Product Type</p>
                  <p className="font-medium">{customer.industry.endProductType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Regulatory Standards</p>
                  <p className="font-medium">{customer.industry.regulatoryStandardsFollowed || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Company Type */}
          {customer.companyType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Company Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Segments</p>
                  <p className="font-medium">{customer.companyType.companySegments || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">In-House Production</p>
                  <p className="font-medium">{customer.companyType.inHouseProduction || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Procurement Model</p>
                  <p className="font-medium">{customer.companyType.procurementModel || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lead Seniority */}
          {customer.leadSeniority && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Lead Seniority</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Primary Designations</p>
                  <p className="font-medium">{customer.leadSeniority.primaryDesignations || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{customer.leadSeniority.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decision Making Power</p>
                  <p className="font-medium">{customer.leadSeniority.decisionMakingPower || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* RFQ Type */}
          {customer.rfqType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">RFQ Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">RFQ Segments</p>
                  <p className="font-medium">{customer.rfqType.rfqSegments || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency Level</p>
                  <p className="font-medium">{customer.rfqType.urgencyLevel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annual Usage Volume</p>
                  <p className="font-medium">{customer.rfqType.annualUsageVolume || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Target Price Availability</p>
                  <p className="font-medium">{customer.rfqType.TargetPriceAvailability || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Metrics */}
          {customer.businessMetrics && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Business Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Global Presence</p>
                  <p className="font-medium">{customer.businessMetrics.globalPresence || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annual Revenue Range</p>
                  <p className="font-medium">{customer.businessMetrics.annualRevenueRange || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Employees</p>
                  <p className="font-medium">{customer.businessMetrics.employeesNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Years in Business</p>
                  <p className="font-medium">{customer.businessMetrics.yearsInBusiness || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category Level</p>
                  <p className="font-medium">{customer.businessMetrics.categoryLevel || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Relationship */}
          {customer.relationship && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Relationship</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Stage</p>
                  <p className="font-medium">{customer.relationship.stage || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lead Source */}
          {customer.leadSource && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Lead Source</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Lead Source Segments</p>
                  <p className="font-medium">{customer.leadSource.leadSourceSegments || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cold Calling</p>
                  <p className="font-medium">{customer.leadSource.coldCalling || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Others</p>
                  <p className="font-medium">{customer.leadSource.others || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Credit Rating */}
          {customer.creditRating && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Credit Rating</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Credit Term Preference</p>
                  <p className="font-medium">{customer.creditRating.creditTermPreference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Reliability</p>
                  <p className="font-medium">{customer.creditRating.paymentReliability || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <p className="font-medium">{customer.creditRating.riskLevel || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          {customer.remarks && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900">Remarks</h3>
              <p className="text-gray-700">{customer.remarks}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Modal Component
export const FilterModal: React.FC<{
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onApply: () => void;
  onClose: () => void;
}> = ({ filters, setFilters, onApply, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Advanced Filters</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={filters.phoneNo}
              onChange={(e) => setFilters({ ...filters, phoneNo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Regions</label>
            <input
              type="text"
              value={filters.primaryRegions}
              onChange={(e) => setFilters({ ...filters, primaryRegions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Segments</label>
            <input
              type="text"
              value={filters.industrySegments}
              onChange={(e) => setFilters({ ...filters, industrySegments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Segments</label>
            <input
              type="text"
              value={filters.companySegments}
              onChange={(e) => setFilters({ ...filters, companySegments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Designations</label>
            <input
              type="text"
              value={filters.primaryDesignations}
              onChange={(e) => setFilters({ ...filters, primaryDesignations: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RFQ Segments</label>
            <input
              type="text"
              value={filters.rfqSegments}
              onChange={(e) => setFilters({ ...filters, rfqSegments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <input
              type="text"
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source Segments</label>
            <input
              type="text"
              value={filters.leadSourceSegments}
              onChange={(e) => setFilters({ ...filters, leadSourceSegments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cold Calling</label>
            <select
              value={filters.coldCalling}
              onChange={(e) => setFilters({ ...filters, coldCalling: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setFilters({
                name: '',
                email: '',
                phoneNo: '',
                primaryRegions: '',
                industrySegments: '',
                companySegments: '',
                primaryDesignations: '',
                rfqSegments: '',
                stage: '',
                leadSourceSegments: '',
                coldCalling: ''
              });
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Clear All
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};