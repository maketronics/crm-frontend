import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
import type { User } from '../../types';
import { authApiClient } from '../../lib/authApiClient';

interface UserSelectProps {
  label?: string;
  value: string;
  onChange: (userId: string) => void;
  error?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedUser = users?.find((user) => user.id === value);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authApiClient.get<any>(
        `/users?search=${searchTerm}&size=20`
      );

      console.log('Users API response:', response); // Debug log

      // Handle different response formats
      let usersData = [];
      if (Array.isArray(response)) {
        // Direct array response
        usersData = response;
      } else if (response.content && Array.isArray(response.content)) {
        // Spring Boot paginated response
        usersData = response.content;
      } else if (response.data && Array.isArray(response.data)) {
        // Standard API response
        usersData = response.data;
      } else if (response.users && Array.isArray(response.users)) {
        // Users property
        usersData = response.users;
      }

      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = (users || []).filter((user) =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-md py-2 pl-3 pr-10 text-left shadow-sm border focus:outline-none focus:ring-1 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          >
            <span className="block truncate">
              {selectedUser ? selectedUser.name : 'Select a user...'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No users found
                </div>
              ) : (
                <>
                  <Listbox.Option
                    value=""
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className="block truncate">
                          Unassigned
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>

                  {filteredUsers.map((user) => (
                    <Listbox.Option
                      key={user.id}
                      value={user.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div>
                            <span className="block truncate font-medium">
                              {user.name || 'Unknown User'}
                            </span>
                            <span className="block truncate text-sm text-gray-500">
                              {user.email || 'No email'}
                            </span>
                          </div>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};