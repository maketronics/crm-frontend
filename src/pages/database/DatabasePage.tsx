import React, { useState, useEffect } from 'react';
import { FaPlus, FaUpload, FaSearch, FaEye, FaTrash } from 'react-icons/fa';
import { CreateCustomerModal, CustomerDetailsModal, FilterModal} from './DatabaseModals';
import type { Customer } from '../../types/customer.types';

interface FilterState {
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

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "693856689628738a0643b34f",
    name: "John Doe",
    email: "john.doe@example.com",
    phoneNo: "9876543210",
    geography: {
      primaryRegions: "India & Middle East",
      country: "India",
      state: "Karnataka",
      timeZone: "GMT+5:30",
      languagePreference: "English",
      primaryTradeCurrency: "INR"
    },
    industry: {
      industrySegments: "Electronics Manufacturing",
      endProductType: "PCB Assembly",
      regulatoryStandardsFollowed: "ISO 13485"
    },
    companyType: {
      companySegments: "OEM",
      inHouseProduction: "Yes",
      procurementModel: "Centralized"
    },
    leadSeniority: {
      primaryDesignations: "Head of Procurement",
      department: "Procurement",
      decisionMakingPower: "High"
    },
    rfqType: {
      rfqSegments: "Regular",
      urgencyLevel: "Immediate",
      annualUsageVolume: "10000 units",
      TargetPriceAvailability: "Yes"
    },
    businessMetrics: {
      globalPresence: "Yes",
      annualRevenueRange: "$50–$500M",
      employeesNumber: "200–1000",
      yearsInBusiness: "15+ years",
      categoryLevel: "Strategic Account"
    },
    relationship: {
      stage: "Prospect"
    },
    leadSource: {
      leadSourceSegments: "Website Inquiry",
      coldCalling: "No",
      others: ""
    },
    creditRating: {
      creditTermPreference: "Net 30",
      paymentReliability: "Excellent",
      riskLevel: "Low"
    },
    remarks: "Interested in bulk component supply."
  },
  {
    id: "693856689628738a0643b350",
    name: "Jane Smith",
    email: "jane.smith@techcorp.com",
    phoneNo: "9876543211",
    geography: {
      primaryRegions: "North America",
      country: "USA",
      state: "California",
      timeZone: "GMT-8:00",
      languagePreference: "English",
      primaryTradeCurrency: "USD"
    },
    industry: {
      industrySegments: "Automotive",
      endProductType: "Electronic Control Units",
      regulatoryStandardsFollowed: "ISO 9001"
    },
    companyType: {
      companySegments: "Distributor",
      inHouseProduction: "No",
      procurementModel: "Decentralized"
    },
    leadSeniority: {
      primaryDesignations: "VP of Supply Chain",
      department: "Supply Chain",
      decisionMakingPower: "Very High"
    },
    rfqType: {
      rfqSegments: "Bulk Order",
      urgencyLevel: "Standard",
      annualUsageVolume: "50000 units",
      TargetPriceAvailability: "Yes"
    },
    businessMetrics: {
      globalPresence: "Yes",
      annualRevenueRange: "$500M+",
      employeesNumber: "1000+",
      yearsInBusiness: "20+ years",
      categoryLevel: "Enterprise"
    },
    relationship: {
      stage: "Active Customer"
    },
    leadSource: {
      leadSourceSegments: "Trade Show",
      coldCalling: "No",
      others: "Met at CES 2024"
    },
    creditRating: {
      creditTermPreference: "Net 60",
      paymentReliability: "Excellent",
      riskLevel: "Very Low"
    },
    remarks: "Long-term partnership potential."
  }
];

export const DatabasePage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
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

  const API_BASE_URL = 'https://crm-dev0-customer-db-service-v1.make-tronics.com'; // Leave empty for mock data mode
  const USE_MOCK_DATA = false; // Set to false when API is ready

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchCustomers();
    }
  }, []);

  const fetchCustomers = async () => {
    if (USE_MOCK_DATA) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customer`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = async () => {
    if (USE_MOCK_DATA) {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      if (Object.keys(activeFilters).length === 0) {
        setCustomers(mockCustomers);
        setShowFilterModal(false);
        return;
      }

      const filtered = mockCustomers.filter(customer => {
        return Object.entries(activeFilters).every(([key, value]) => {
          const lowerValue = value.toLowerCase();
          switch(key) {
            case 'name': return customer.name.toLowerCase().includes(lowerValue);
            case 'email': return customer.email.toLowerCase().includes(lowerValue);
            case 'phoneNo': return customer.phoneNo.includes(value);
            case 'primaryRegions': return customer.geography?.primaryRegions?.toLowerCase().includes(lowerValue);
            case 'industrySegments': return customer.industry?.industrySegments?.toLowerCase().includes(lowerValue);
            case 'companySegments': return customer.companyType?.companySegments?.toLowerCase().includes(lowerValue);
            case 'primaryDesignations': return customer.leadSeniority?.primaryDesignations?.toLowerCase().includes(lowerValue);
            case 'rfqSegments': return customer.rfqType?.rfqSegments?.toLowerCase().includes(lowerValue);
            case 'stage': return customer.relationship?.stage?.toLowerCase().includes(lowerValue);
            case 'leadSourceSegments': return customer.leadSource?.leadSourceSegments?.toLowerCase().includes(lowerValue);
            case 'coldCalling': return customer.leadSource?.coldCalling?.toLowerCase().includes(lowerValue);
            default: return true;
          }
        });
      });
      
      setCustomers(filtered);
      setShowFilterModal(false);
      return;
    }

    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      if (Object.keys(activeFilters).length === 0) {
        await fetchCustomers();
        setShowFilterModal(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/customer/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activeFilters),
      });
      const data = await response.json();
      setCustomers(data);
      setShowFilterModal(false);
    } catch (error) {
      console.error('Error filtering customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (USE_MOCK_DATA) {
      alert('CSV upload will be available when API is connected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customer/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        alert('CSV uploaded successfully!');
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    if (USE_MOCK_DATA) {
      setCustomers(customers.filter(c => c.id !== id));
      alert('Customer deleted successfully!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/customer/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Customer deleted successfully!');
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const viewCustomerDetails = async (id: string) => {
    if (USE_MOCK_DATA) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setSelectedCustomer(customer);
        setShowDetailsModal(true);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/customer/${id}`);
      const data = await response.json();
      setSelectedCustomer(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNo.includes(searchTerm)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Customer Database</h1>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Advanced Filters
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2">
            <FaUpload />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Create Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.companyType?.companySegments || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCustomerDetails(customer.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No customers found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newCustomer) => {
            setShowCreateModal(false);
            if (USE_MOCK_DATA) {
              setCustomers([...customers, { ...newCustomer, id: Date.now().toString() }]);
            } else {
              fetchCustomers();
            }
          }}
          apiBaseUrl={API_BASE_URL}
          useMockData={USE_MOCK_DATA}
        />
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          onApply={handleFilterSubmit}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
};