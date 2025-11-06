'use client';

import { useState, useEffect } from 'react';

interface BulkOperation {
  id: string;
  type: 'price_update' | 'discount_campaign' | 'status_change' | 'import_hotels';
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  affectedHotels: number;
  results?: any;
}

export default function BulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Price Update State
  const [priceUpdateMode, setPriceUpdateMode] = useState<'percentage' | 'fixed'>('percentage');
  const [priceAdjustment, setPriceAdjustment] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  
  // Campaign State
  const [campaignName, setCampaignName] = useState('');
  const [campaignDiscount, setCampaignDiscount] = useState('');
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignEndDate, setCampaignEndDate] = useState('');
  
  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);

  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
  const starRatings = [1, 2, 3, 4, 5];

  useEffect(() => {
    // Load existing operations (mock data for now)
    setOperations([
      {
        id: '1',
        type: 'discount_campaign',
        name: 'Christmas 2024 Campaign',
        description: '25% discount for all Lagos 4-star+ hotels',
        status: 'completed',
        progress: 100,
        startedAt: '2024-12-01T10:00:00Z',
        completedAt: '2024-12-01T10:05:23Z',
        affectedHotels: 23
      },
      {
        id: '2',
        type: 'price_update',
        name: 'Q4 Price Adjustment',
        description: '+10% price increase for premium properties',
        status: 'running',
        progress: 65,
        startedAt: '2024-11-02T14:30:00Z',
        affectedHotels: 45
      }
    ]);
  }, []);

  const executeBulkPriceUpdate = async () => {
    if (!priceAdjustment || (selectedCities.length === 0 && selectedStars.length === 0)) {
      alert('Please specify price adjustment and select criteria');
      return;
    }

    setLoading(true);

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: 'price_update',
      name: `Bulk Price ${priceUpdateMode === 'percentage' ? 'Adjustment' : 'Update'}`,
      description: `${priceUpdateMode === 'percentage' ? priceAdjustment + '%' : '₦' + priceAdjustment} ${
        priceUpdateMode === 'percentage' ? 'adjustment' : 'fixed price'
      } for ${selectedCities.join(', ')} hotels`,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
      affectedHotels: 0
    };

    setOperations(prev => [operation, ...prev]);

    try {
      const response = await fetch('/api/admin/bulk/price-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'your-secret-admin-key'
        },
        body: JSON.stringify({
          mode: priceUpdateMode,
          adjustment: parseFloat(priceAdjustment),
          cities: selectedCities,
          stars: selectedStars
        })
      });

      const result = await response.json();

      if (response.ok) {
        setOperations(prev => 
          prev.map(op => 
            op.id === operation.id 
              ? { ...op, status: 'completed', progress: 100, completedAt: new Date().toISOString(), affectedHotels: result.affectedHotels }
              : op
          )
        );
        
        // Reset form
        setPriceAdjustment('');
        setSelectedCities([]);
        setSelectedStars([]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bulk price update failed:', error);
      setOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'failed', progress: 0 }
            : op
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const executeDiscountCampaign = async () => {
    if (!campaignName || !campaignDiscount || !campaignStartDate || !campaignEndDate) {
      alert('Please fill in all campaign details');
      return;
    }

    setLoading(true);

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: 'discount_campaign',
      name: campaignName,
      description: `${campaignDiscount}% discount campaign from ${campaignStartDate} to ${campaignEndDate}`,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
      affectedHotels: 0
    };

    setOperations(prev => [operation, ...prev]);

    try {
      const response = await fetch('/api/admin/bulk/discount-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'your-secret-admin-key'
        },
        body: JSON.stringify({
          name: campaignName,
          discountRate: parseFloat(campaignDiscount) / 100,
          startDate: campaignStartDate,
          endDate: campaignEndDate,
          cities: selectedCities,
          stars: selectedStars
        })
      });

      const result = await response.json();

      if (response.ok) {
        setOperations(prev => 
          prev.map(op => 
            op.id === operation.id 
              ? { ...op, status: 'completed', progress: 100, completedAt: new Date().toISOString(), affectedHotels: result.affectedHotels }
              : op
          )
        );
        
        // Reset form
        setCampaignName('');
        setCampaignDiscount('');
        setCampaignStartDate('');
        setCampaignEndDate('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Campaign creation failed:', error);
      setOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'failed', progress: 0 }
            : op
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    // Parse CSV preview (simplified)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6); // Show first 5 rows
      const preview = lines.map(line => line.split(','));
      setImportPreview(preview);
    };
    reader.readAsText(file);
  };

  const executeCSVImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setLoading(true);

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: 'import_hotels',
      name: 'CSV Hotel Import',
      description: `Importing hotels from ${csvFile.name}`,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
      affectedHotels: 0
    };

    setOperations(prev => [operation, ...prev]);

    const formData = new FormData();
    formData.append('csv', csvFile);

    try {
      const response = await fetch('/api/admin/bulk/import-csv', {
        method: 'POST',
        headers: {
          'x-admin-key': 'your-secret-admin-key'
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setOperations(prev => 
          prev.map(op => 
            op.id === operation.id 
              ? { 
                  ...op, 
                  status: 'completed', 
                  progress: 100, 
                  completedAt: new Date().toISOString(), 
                  affectedHotels: result.importedCount,
                  results: result.summary
                }
              : op
          )
        );
        
        // Reset form
        setCsvFile(null);
        setImportPreview([]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('CSV import failed:', error);
      setOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'failed', progress: 0 }
            : op
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
          <p className="text-gray-600">Manage multiple hotels efficiently with bulk operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bulk Price Updates */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Bulk Price Updates</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPriceUpdateMode('percentage')}
                    className={`flex-1 btn ${priceUpdateMode === 'percentage' ? 'btn-primary' : 'btn-ghost'} text-sm`}
                  >
                    Percentage
                  </button>
                  <button
                    onClick={() => setPriceUpdateMode('fixed')}
                    className={`flex-1 btn ${priceUpdateMode === 'fixed' ? 'btn-primary' : 'btn-ghost'} text-sm`}
                  >
                    Fixed Amount
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {priceUpdateMode === 'percentage' ? 'Percentage Change (%)' : 'New Price (₦)'}
                </label>
                <input
                  type="number"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(e.target.value)}
                  placeholder={priceUpdateMode === 'percentage' ? '+10 or -5' : '150000'}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Cities</label>
                <div className="flex flex-wrap gap-2">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCities(prev => 
                          prev.includes(city) 
                            ? prev.filter(c => c !== city)
                            : [...prev, city]
                        );
                      }}
                      className={`chip ${selectedCities.includes(city) ? 'active' : ''}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Star Ratings</label>
                <div className="flex gap-2">
                  {starRatings.map(star => (
                    <button
                      key={star}
                      onClick={() => {
                        setSelectedStars(prev => 
                          prev.includes(star) 
                            ? prev.filter(s => s !== star)
                            : [...prev, star]
                        );
                      }}
                      className={`chip ${selectedStars.includes(star) ? 'active' : ''}`}
                    >
                      {star}⭐
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={executeBulkPriceUpdate}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Execute Price Update'}
              </button>
            </div>
          </div>

          {/* Discount Campaigns */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Discount Campaigns</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., New Year 2025 Sale"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={campaignDiscount}
                  onChange={(e) => setCampaignDiscount(e.target.value)}
                  placeholder="20"
                  min="1"
                  max="50"
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={campaignStartDate}
                    onChange={(e) => setCampaignStartDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={campaignEndDate}
                    onChange={(e) => setCampaignEndDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              <button
                onClick={executeDiscountCampaign}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
            </div>
          </div>

          {/* CSV Import */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📤 CSV Import</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="input w-full"
                />
              </div>

              {importPreview.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-40">
                      <table className="w-full text-xs">
                        <tbody>
                          {importPreview.map((row, index) => (
                            <tr key={index} className={index === 0 ? 'bg-gray-100 font-medium' : 'bg-white'}>
                              {row.map((cell: any, cellIndex: number) => (
                                <td key={cellIndex} className="px-2 py-1 border-b text-gray-700">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">CSV Format Requirements:</p>
                <ul className="text-xs space-y-1">
                  <li>• name, city, basePriceNGN, stars, type</li>
                  <li>• First row should contain headers</li>
                  <li>• Maximum 100 hotels per upload</li>
                </ul>
              </div>

              <button
                onClick={executeCSVImport}
                disabled={loading || !csvFile}
                className="btn-primary w-full"
              >
                {loading ? 'Importing...' : 'Import Hotels'}
              </button>
            </div>
          </div>
        </div>

        {/* Operations History */}
        <div className="mt-8 bg-white rounded-xl shadow-soft border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Operations History</h3>
          
          <div className="space-y-4">
            {operations.map((operation) => (
              <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{operation.name}</h4>
                    <p className="text-sm text-gray-600">{operation.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      operation.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {operation.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {operation.affectedHotels} hotels
                    </span>
                  </div>
                </div>
                
                {operation.status === 'running' && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{operation.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${operation.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Started: {operation.startedAt ? new Date(operation.startedAt).toLocaleString() : 'N/A'}
                  </span>
                  {operation.completedAt && (
                    <span>
                      Completed: {new Date(operation.completedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}