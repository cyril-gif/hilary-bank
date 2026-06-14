'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0 });

  useEffect(() => {
    fetchTransfers();
    // Refresh every 10 seconds
    const interval = setInterval(fetchTransfers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransfers = async () => {
    const response = await fetch('/api/admin/transfers');
    const data = await response.json();
    setTransfers(data.transfers);
    setStats(data.stats);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Live Transfer Monitor</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Total Transfers</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-600">Successful</p>
          <p className="text-2xl font-bold">{stats.successful}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-red-600">Failed</p>
          <p className="text-2xl font-bold">{stats.failed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer: any) => (
              <tr key={transfer.id} className="border-t">
                <td className="p-3 font-mono text-sm">{transfer.reference}</td>
                <td className="p-3">₵{transfer.amount}</td>
                <td className="p-3">{transfer.mobileNumber}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transfer.status === 'success' 
                      ? 'bg-green-100 text-green-700'
                      : transfer.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {transfer.status}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(transfer.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
