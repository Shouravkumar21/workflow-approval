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
  Clock
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
      alert("Error creating request. Please try again.");
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 sm:pb-0">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-3 sm:py-0 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} />
              <span className="text-lg font-bold tracking-tight">Request Workflow</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('USER')}
                >
                  User View
                </button>
                <button 
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager View
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                New Request
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* FAB */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
      >
        <Plus size={24} />
      </button>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="flex flex-row gap-2 sm:gap-6 mb-6">
          <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto sm:p-6">
            <div className="p-1.5 sm:p-3 bg-blue-50 rounded-lg text-blue-600 mb-1 sm:mb-2">
              <Plus size={16} />
            </div>
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-sm sm:text-2xl font-black">{requests.length}</p>
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto sm:p-6">
            <div className="p-1.5 sm:p-3 bg-amber-50 rounded-lg text-amber-600 mb-1 sm:mb-2">
              <Clock size={16} />
            </div>
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pending</p>
            <p className="text-sm sm:text-2xl font-black text-amber-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto sm:p-6">
            <div className="p-1.5 sm:p-3 bg-green-50 rounded-lg text-green-600 mb-1 sm:mb-2">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Approved</p>
            <p className="text-sm sm:text-2xl font-black text-green-600">
              {requests.filter(r => r.status === 'APPROVED').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Filter By</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-gray-100 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select 
                value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-gray-100 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">All Types</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Syncing...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-24 text-center text-gray-300 px-4">
              <ShieldCheck size={48} className="mx-auto mb-2 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest">No Requests Found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req.id} className="p-5 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 leading-tight pr-4">{req.title}</h4>
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full border shadow-sm flex-shrink-0 ${
                      req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                      req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{req.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-black shadow-sm">
                        {req.requestedBy.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        Requested by <span className="text-gray-700">{req.requestedBy}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {req.status === 'PENDING' && role === 'MANAGER' ? (
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')} 
                            className="text-green-600 text-[10px] font-black uppercase hover:text-green-700 tracking-widest transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')} 
                            className="text-red-600 text-[10px] font-black uppercase hover:text-red-700 tracking-widest transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                          <CheckCircle2 size={12} />
                          {req.status === 'PENDING' ? 'Processing' : 'Finalized'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl p-8 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" required placeholder="Enter title" 
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Requested By</label>
                <input 
                  type="text" required placeholder="Enter your name" 
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.requestedBy} onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
                >
                  <option value="GENERAL">General</option>
                  <option value="LEAVE">Leave</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3} required placeholder="Briefly describe the request" 
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-lg text-sm font-bold text-gray-400 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
