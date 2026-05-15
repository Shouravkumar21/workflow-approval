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
  Loader2,
  Calendar,
  DollarSign,
  Briefcase,
  Search,
  Trash2
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
      console.error("Error fetching requests:", error);
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
      alert("Error creating request. Please check inputs.");
    }
  };

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { status, role });
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRequests();
    } catch (error) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={28} />
              <span className="text-xl font-bold">Request Workflow</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setRole('USER')}
                >
                  User View
                </button>
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager View
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                New Request
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Requests</p>
            <p className="text-2xl font-bold mt-1">{requests.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {requests.filter(r => r.status === 'APPROVED').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-500 mr-2">
              <Filter size={18} />
              <span className="text-sm font-semibold">Filter by:</span>
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="LEAVE">Leave</option>
              <option value="EXPENSE">Expense</option>
              <option value="GENERAL">General</option>
            </select>
            
            {(filterStatus || filterType) && (
              <button 
                onClick={() => {setFilterStatus(""); setFilterType("");}}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg">No requests found.</p>
              <p className="text-sm mt-1">Start by creating a new request above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{req.title}</div>
                        <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">{req.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {req.requestedBy.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{req.requestedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          {req.type === 'LEAVE' ? <Calendar size={14} /> : req.type === 'EXPENSE' ? <DollarSign size={14} /> : <Briefcase size={14} />}
                          <span className="capitalize">{req.type.toLowerCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' && role === 'MANAGER' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="p-1.5 text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="p-1.5 text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2 items-center">
                            <span className="text-xs text-gray-400 italic">
                              {req.status === 'PENDING' ? 'Processing' : 'Done'}
                            </span>
                            <button 
                              onClick={() => handleDelete(req.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setIsModalOpen(false)}
            />
            
            <div className="bg-white rounded-xl overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">New Request</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Vacation Leave"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Requested By</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Your Name"
                      value={formData.requestedBy}
                      onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Details of your request..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
