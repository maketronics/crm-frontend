import React, { useState, useEffect, useMemo } from 'react';
import { Button, LoadingSpinner, SearchBar, Pagination } from '../../components/ui';
import { UserListTable, UserFormModal } from '../../components/auth';
import { userStore } from '../../stores/userStore';
import { authStore } from '../../stores/authStore';
import { authService } from '../../lib/authService';
import type { CreateUserRequest, User } from '../../types';
import { PlusIcon } from '@heroicons/react/24/outline';

export const UsersPage: React.FC = () => {
  const {
    users,
    totalUsers,
    currentPage,
    totalPages,
    isLoading,
    error,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    setLoading,
    setError,
  } = userStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const page = (currentPage || 1) - 1; // Ensure we have a valid number and convert to 0-based indexing
    fetchUsers(page, pageSize, searchTerm);
  }, [currentPage, pageSize]);

  // Separate effect for search to debounce it
  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        fetchUsers(0, pageSize, searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchUsers(0, pageSize, '');
    }
  }, [searchTerm]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!users || !searchTerm) return users || [];
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const fetchUsers = async (page = 0, size = 10, search = '') => {
    setLoading(true);
    setError(null);
    try {
      // Ensure page and size are valid numbers
      const validPage = Math.max(0, parseInt(String(page)) || 0);
      const validSize = Math.max(1, parseInt(String(size)) || 10);

      console.log('Fetching users:', { page: validPage, size: validSize, search });
      const filters = search ? { search } : undefined;
      const response = await authService.getUsers(validPage, validSize, 'name', 'asc', filters);
      console.log('Users response:', response);
      setUsers(response);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      console.log('Creating user:', userData);

      // Debug: Check current user permissions
      const currentUser = authStore.getState().user;
      const accessToken = authStore.getState().accessToken;
      console.log('Current user permissions:', currentUser?.permissions);
      console.log('Has CREATE_USER permission:', currentUser?.permissions?.includes('CREATE_USER'));
      console.log('Access token exists:', !!accessToken);

      const newUser = await authService.createUser(userData);
      console.log('User created successfully:', newUser);
      addUser(newUser);
      setIsCreateModalOpen(false);

      // Show success message
      setSuccessMessage(`User "${newUser.name}" created successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000); // Hide after 5 seconds
    } catch (error: any) {
      console.error('Failed to create user:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        response: error.response,
        status: error.status
      });
      setError(error.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (user: User) => {
    try {
      const updatedUser = await authService.updateUser(user.id, {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        title: user.title,
        roles: user.roles,
        permissions: user.permissions,
      });
      updateUser(user.id, updatedUser);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await authService.deleteUser(userId);
      removeUser(userId);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const updatedUser = await authService.toggleUserStatus(userId, isActive);
      updateUser(userId, updatedUser);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // For server-side search, debounce and fetch
    if (term.length > 2 || term.length === 0) {
      const timeoutId = setTimeout(() => {
        fetchUsers(0, pageSize, term);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, parseInt(String(page)) || 1);
    fetchUsers(validPage - 1, pageSize, searchTerm); // API uses 0-based pagination
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const validSize = Math.max(1, parseInt(String(newPageSize)) || 10);
    setPageSize(validSize);
    fetchUsers(0, validSize, searchTerm);
  };

  if (isLoading && (!users || users.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  // Debug info (can be removed later)
  console.log('UsersPage render:', { isLoading, users: users?.length || 0, error, totalUsers });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search users by name, email, or title..."
          className="max-w-md"
        />
      </div>

      <div className="card">
        <UserListTable
          users={searchTerm ? filteredUsers : (users || [])}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleActive={handleToggleActive}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalUsers}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          showSizeChanger={true}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};