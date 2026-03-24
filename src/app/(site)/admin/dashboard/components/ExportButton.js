"use client";

import { useState } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";

/**
 * Convert data to CSV string
 */
function dataToCSV(data, columns) {
  if (!data || data.length === 0) return "";

  // Header row
  const headers = columns.map((col) => col.label).join(",");

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let value = row[col.key];

        // Handle null/undefined
        if (value === null || value === undefined) return "";

        // Handle dates
        if (col.type === "date" || (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/))) {
          try {
            value = format(new Date(value), "yyyy-MM-dd HH:mm:ss");
          } catch {
            // Keep original value
          }
        }

        // Escape commas and quotes
        value = String(value);
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * ExportButton - Export data to CSV or Excel
 *
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Base filename (without extension)
 */
export default function ExportButton({
  data,
  columns,
  filename = "export",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (content, mimeType, extension) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = dataToCSV(data, columns);
      downloadFile(csv, "text/csv;charset=utf-8;", "csv");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // For now, export as CSV with .xlsx hint
      // Full Excel support would require the xlsx library
      const csv = dataToCSV(data, columns);
      downloadFile(csv, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "csv");
      // Note: This creates a CSV that Excel can open. For true .xlsx, install xlsx package.
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-b-lg border-t border-gray-200 dark:border-gray-700"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export as Excel</span>
          </button>
        </div>
      )}
    </div>
  );
}
