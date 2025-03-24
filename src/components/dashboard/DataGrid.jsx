import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { orderBy } from "lodash";

/** DataGrid - A versatile data grid component for displaying and managing tabular data with advanced features
 *
 * This component provides a full-featured data grid with the following capabilities:
 * - Displays tabular data from multiple files
 * - Supports sorting by any column
 * - Implements pagination with customizable page size
 * - Groups data by tags with expandable/collapsible groups
 * - Shows file tags with customizable colors
 * - Allows adding/removing tags from files
 **/

export const DataGrid = ({
  files = [],
  pageSize = 20,
  tags = {},
  settings = {},
  onTagFile,
  onRemoveTag,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [grouping, setGrouping] = useState("none"); // none, date, tag
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Get all data and columns
  const { allData, columns } = useMemo(() => {
    if (!files || !files.length) return { allData: [], columns: [] };

    // Combine all file data and get unique columns
    const allColumns = new Set();
    const combinedData = files.reduce((acc, file) => {
      if (!file.data) return acc;
      file.data.forEach((row) => {
        Object.keys(row).forEach((key) => allColumns.add(key));
      });
      return [
        ...acc,
        ...file.data.map((row) => ({
          ...row,
          __fileName: file.name, // Add filename for reference
          __tags: file.tags || [], // Add tags
        })),
      ];
    }, []);

    return {
      allData: combinedData,
      columns: Array.from(allColumns),
    };
  }, [files]);

  // Process and group data
  const processedData = useMemo(() => {
    let data = [...allData];

    // Apply sorting
    if (sortConfig.key) {
      data = orderBy(data, [sortConfig.key], [sortConfig.direction]);
    }

    // Apply grouping
    if (grouping === "tag") {
      // Create a mapping of files to their tags
      const fileTagMapping = {};
      Object.entries(tags).forEach(([tagName, tagData]) => {
        tagData.files?.forEach((fileName) => {
          if (!fileTagMapping[fileName]) {
            fileTagMapping[fileName] = new Set();
          }
          fileTagMapping[fileName].add(tagName);
        });
      });

      // Group data by tags
      const taggedData = [];
      const untaggedData = [];

      data.forEach((row) => {
        const fileName = row.__fileName;
        const fileTags = fileTagMapping[fileName];
        if (fileTags && fileTags.size > 0) {
          Array.from(fileTags).forEach((tag) => {
            taggedData.push({ tag, row });
          });
        } else {
          untaggedData.push(row);
        }
      });

      // Create grouped structure
      const groupedData = [];

      // Add tagged groups
      Object.keys(tags).forEach((tag) => {
        const rows = taggedData
          .filter((item) => item.tag === tag)
          .map((item) => item.row);
        if (rows.length > 0) {
          groupedData.push({
            groupHeader: tag,
            rows,
            isExpanded: expandedGroups.has(tag),
          });
        }
      });

      // Add untagged group if there are untagged items
      if (untaggedData.length > 0) {
        groupedData.push({
          groupHeader: "Untagged",
          rows: untaggedData,
          isExpanded: expandedGroups.has("Untagged"),
        });
      }

      return groupedData;
    }

    // No grouping
    return data;
  }, [allData, sortConfig, grouping, tags, expandedGroups]);

  // Calculate pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return processedData;
    const start = currentPage * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (column) => {
    setSortConfig((current) => ({
      key: column,
      direction:
        current.key === column && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleGroup = (groupHeader) => {
    setExpandedGroups((current) => {
      const newSet = new Set(current);
      if (newSet.has(groupHeader)) {
        newSet.delete(groupHeader);
      } else {
        newSet.add(groupHeader);
      }
      return newSet;
    });
  };

  if (!files.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No files uploaded yet. Upload some CSV files to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grouping Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          Group by:
          <select
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
            className="border rounded p-1"
          >
            <option value="none">None</option>
            <option value="tag">Tag</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {column}
                    {sortConfig.key === column &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => {
              if ("groupHeader" in item) {
                // Render group header and its rows
                return (
                  <React.Fragment key={item.groupHeader}>
                    <tr
                      onClick={() => toggleGroup(item.groupHeader)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td
                        colSpan={columns.length + 1}
                        className="px-6 py-4 font-medium"
                        style={
                          settings.tagColors[item.groupHeader]
                            ? {
                                borderLeft: `4px solid ${
                                  settings.tagColors[item.groupHeader]
                                }`,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          {item.isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronUp size={16} />
                          )}
                          {item.groupHeader} ({item.rows.length} items)
                        </div>
                      </td>
                    </tr>
                    {item.isExpanded &&
                      item.rows.map((row, rowIndex) => (
                        <tr
                          key={`${item.groupHeader}-${rowIndex}`}
                          className="hover:bg-gray-50"
                        >
                          {columns.map((column) => (
                            <td
                              key={column}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {row[column]}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {row.__tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded"
                                  style={{
                                    backgroundColor: settings.tagColors[tag]
                                      ? `${settings.tagColors[tag]}20`
                                      : "#EBF5FF",
                                    color: settings.tagColors[tag]
                                      ? settings.tagColors[tag]
                                      : "#3B82F6",
                                  }}
                                >
                                  {tag}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveTag(row.__fileName, tag);
                                    }}
                                    className="ml-1 hover:opacity-75"
                                    style={{
                                      color: settings.tagColors[tag]
                                        ? settings.tagColors[tag]
                                        : "#3B82F6",
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              } else {
                // Render regular row
                return (
                  <tr key={`row-${index}`} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column} className="px-6 py-4 whitespace-nowrap">
                        {item[column]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {item.__tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: settings.tagColors[tag]
                                ? `${settings.tagColors[tag]}20`
                                : "#EBF5FF",
                              color: settings.tagColors[tag]
                                ? settings.tagColors[tag]
                                : "#3B82F6",
                            }}
                          >
                            {tag}
                            <button
                              onClick={() => onRemoveTag(item.__fileName, tag)}
                              className="ml-1 hover:opacity-75"
                              style={{
                                color: settings.tagColors[tag]
                                  ? settings.tagColors[tag]
                                  : "#3B82F6",
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize !== -1 && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-700">
            Showing {Math.min(pageSize, processedData.length)} of{" "}
            {processedData.length} items
          </div>
        </div>
      )}
    </div>
  );
};

export default DataGrid;
