import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Search, Filter, Eye, Edit, Trash2,
  MoreVertical, Download, RefreshCw
} from 'lucide-react';

const DataTable = ({
  columns,
  data,
  loading,
  totalItems,
  page,
  onPageChange,
  onSearch,
  onExport,
  onRefresh,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  actions = [],
  itemsPerPage = 10,
  showSearch = true,
  showFilters = true,
  showExport = true,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(null);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const renderCellValue = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    if (column.key.includes('.')) {
      const keys = column.key.split('.');
      let value = row;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return row[column.key];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm w-64"
              />
            </div>
          )}
          {showFilters && onSearch && (
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1">
              <Filter size={16} /> Filter
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          )}
          {showExport && onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Download size={16} /> Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width ? `w-${column.width}` : ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete || onView || actions.length > 0) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {renderCellValue(row, column)}
                  </td>
                ))}
                {(onEdit || onDelete || onView || actions.length > 0) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(showActionMenu === rowIndex ? null : rowIndex);
                        }}
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {showActionMenu === rowIndex && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-20">
                          {onView && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(row);
                                setShowActionMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              <Eye size={14} /> View
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                                setShowActionMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              <Edit size={14} /> Edit
                            </button>
                          )}
                          {actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                                setShowActionMenu(null);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                                action.className || ''
                              }`}
                            >
                              {action.icon} {action.label}
                            </button>
                          ))}
                          {onDelete && (
                            <>
                              <hr />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(row);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, totalItems)} of {totalItems} items
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;