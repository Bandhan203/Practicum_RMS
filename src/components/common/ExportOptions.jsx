import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCheck, Loader2 } from 'lucide-react';
import analyticsAPI from '../../services/analyticsAPI';

const ExportOptions = ({ 
  startDate, 
  endDate, 
  groupBy = 'day',
  className = '' 
}) => {
  const [exportLoading, setExportLoading] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportOptions = [
    {
      type: 'revenue',
      label: 'Revenue Report',
      description: 'Detailed revenue breakdown and trends'
    },
    {
      type: 'orders',
      label: 'Orders Report',
      description: 'Order statistics and summary'
    },
    {
      type: 'customers',
      label: 'Customers Report',
      description: 'Top customers and customer analytics'
    },
    {
      type: 'waiter_performance',
      label: 'Waiter Performance',
      description: 'Staff performance metrics'
    },
    {
      type: 'top_items',
      label: 'Top Items Report',
      description: 'Best selling items and categories'
    }
  ];

  const exportFormats = [
    {
      format: 'csv',
      label: 'CSV',
      icon: FileText,
      description: 'Comma-separated values'
    },
    {
      format: 'xlsx',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Excel spreadsheet'
    },
    {
      format: 'pdf',
      label: 'PDF',
      icon: FileCheck,
      description: 'PDF document'
    }
  ];

  const handleExport = async (reportType, format) => {
    if (!startDate || !endDate) {
      alert('Please select a date range first');
      return;
    }

    setExportLoading(`${reportType}_${format}`);
    
    try {
      let result;
      
      switch (format) {
        case 'csv':
          result = await analyticsAPI.exportCSV(startDate, endDate, reportType, groupBy);
          break;
        case 'xlsx':
          result = await analyticsAPI.exportXLSX(startDate, endDate, reportType, groupBy);
          break;
        case 'pdf':
          result = await analyticsAPI.exportPDF(startDate, endDate, reportType);
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      console.log(`Exported ${reportType} as ${format}:`, result);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowExportMenu(!showExportMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export Reports
      </button>

      {showExportMenu && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
            
            <div className="space-y-4">
              {exportOptions.map((option) => (
                <div key={option.type} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {exportFormats.map((format) => {
                      const Icon = format.icon;
                      const isLoading = exportLoading === `${option.type}_${format.format}`;
                      
                      return (
                        <button
                          key={format.format}
                          onClick={() => handleExport(option.type, format.format)}
                          disabled={isLoading || exportLoading}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={format.description}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Icon className="h-3 w-3" />
                          )}
                          {format.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowExportMenu(false)}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;