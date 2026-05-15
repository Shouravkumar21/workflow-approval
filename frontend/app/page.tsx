"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  User, 
  ShieldCheck, 
  Loader2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/requests";

type RequestType = "LEAVE" | "EXPENSE" | "GENERAL";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Request {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
}

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState<"USER" | "MANAGER">("USER");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requestedBy: "",
    type: "GENERAL" as RequestType,
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      
      const response = await axios.get(API_URL, { params });
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setIsModalOpen(false);
      setFormData({ title: "", description: "", requestedBy: "", type: "GENERAL" });
      fetchRequests();
    } catch (error) {
      alert("Error creating request. Please check your inputs.");
    }
  };

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { status, role });
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Workflow</h1>
            <p className="text-sm text-gray-500">Internal Approval System</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-gray-200 p-1">
              <button 
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${role === 'USER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setRole('USER')}
              >
                User View
              </button>
              <button 
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${role === 'MANAGER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setRole('MANAGER')}
              >
                Manager View
              </button>
            </div>
            
            <button 
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              New Request
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Filter size={16} />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="LEAVE">Leave</option>
              <option value="EXPENSE">Expense</option>
              <option value="GENERAL">General</option>
            </select>
            
            {(filterStatus || filterType) && (
              <button 
                onClick={() => {setFilterStatus(""); setFilterType("");}}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Request List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="mb-2 animate-spin text-blue-600" size={32} />
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p>No requests found. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Request Details</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Requester</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-gray-900">{req.title}</div>
                        <div className="mt-1 text-sm text-gray-500 max-w-xs truncate">{req.description}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{req.requestedBy}</td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-gray-700">{req.type}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {req.status === 'PENDING' && role === 'MANAGER' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="rounded bg-green-600 p-1.5 text-white hover:bg-green-700 shadow-sm"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="rounded bg-red-600 p-1.5 text-white hover:bg-red-700 shadow-sm"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs italic text-gray-400">
                            {req.status === 'PENDING' ? 'Waiting' : 'Finalized'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Request</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g., Summer Vacation"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Requested By</label>
                <input 
                  type="text" 
                  required 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Your full name"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
                >
                  <option value="GENERAL">General</option>
                  <option value="LEAVE">Leave</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3} 
                  required 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Briefly explain your request..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
