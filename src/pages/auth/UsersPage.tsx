import React, { useState, useEffect, useMemo } from 'react';
import { Button, LoadingSpinner, SearchBar, Pagination } from '../../components/ui';
import { UserListTable, UserFormModal } from '../../components/auth';
import { userStore } from '../../stores/userStore';
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

  useEffect(() => {
    fetchUsers(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
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
      const filters = search ? { search } : undefined;
      const response = await authService.getUsers(page, size, 'name', 'asc', filters);
      setUsers(response);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      const newUser = await authService.createUser(userData);
      addUser(newUser);
      setIsCreateModalOpen(false);
    } catch (error: any) {
      throw error;
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
    fetchUsers(page - 1, pageSize, searchTerm); // API uses 0-based pagination
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    fetchUsers(0, newPageSize, searchTerm);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
          users={searchTerm ? filteredUsers : users}
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