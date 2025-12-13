import React from 'react';
import { cn } from '../../utils/cn';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  className,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  return (
    <table className={cn('min-w-full divide-y divide-gray-200', className)}>
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.className
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {!data || data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-6 py-8 text-center text-gray-500"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          (data || []).map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-6 py-4 text-sm text-gray-900',
                    column.className
                  )}
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}