import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '../../stores/authStore';
import { ProfileModal, PasswordChangeModal } from '../auth';
import {
  FaUser,
  FaFileAlt,
  FaCog,
  FaPlus,
  FaColumns,
  FaSignOutAlt,
  FaKey,
  FaUserCircle,
  FaBullhorn,
  FaDatabase, // ADD THIS - Database icon
} from 'react-icons/fa';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = authStore();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 bg-indigo-900 flex flex-col items-center py-4 space-y-6 flex-shrink-0">
        {/* Logo */}
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-bold text-indigo-900 cursor-pointer">
          CRM
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => navigate('/users')}
          className={`w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors ${
            isActive('/users') ? 'bg-indigo-800' : ''
          }`}
          title="Users"
        >
          <FaUser size={20} />
        </button>

        <button
          onClick={() => navigate('/leads')}
          className={`w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors ${
            isActive('/leads') && !location.pathname.includes('/kanban') ? 'bg-indigo-800' : ''
          }`}
          title="Leads"
        >
          <FaFileAlt size={20} />
        </button>

        <button
          onClick={() => navigate('/leads/kanban')}
          className={`w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors ${
            location.pathname.includes('/kanban') ? 'bg-indigo-800' : ''
          }`}
          title="Kanban View"
        >
          <FaColumns size={20} />
        </button>

        {/* Database Button - NEW */}
        <button
          onClick={() => navigate('/database')}
          className={`w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors ${
            isActive('/database') ? 'bg-indigo-800' : ''
          }`}
          title="Customer Database"
        >
          <FaDatabase size={20} />
        </button>

        <button
          onClick={() => navigate('/leads/create')}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors"
          title="Create Lead"
        >
          <FaPlus size={20} />
        </button>

        {/* Campaign Button */}
        <button
          onClick={() => navigate('/campaigns')}
          className={`w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors ${
            isActive('/campaigns') ? 'bg-indigo-800' : ''
          }`}
          title="Campaigns"
        >
          <FaBullhorn size={20} />
        </button>
        
        {/* Spacer to push profile to bottom */}
        <div className="flex-1 "></div>

        {/* Profile Menu at Bottom */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors"
            title={user?.name || 'Profile'}
          >
            <FaUserCircle size={24} />
          </button>

          {showProfileDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileDropdown(false)}
              ></div>
              
              {/* Dropdown Menu */}
              <div className="absolute bottom-0 left-16 ml-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaCog className="mr-3" size={14} />
                  Edit Profile
                </button>
                
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaKey className="mr-3" size={14} />
                  Change Password
                </button>
                
                <hr className="my-1 border-gray-100" />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="mr-3" size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>

        <button
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-indigo-800 rounded transition-colors"
          title="Settings"
        >
          <FaCog size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden p-7 pb-7">
        <Outlet />
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};