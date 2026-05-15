"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Loader2,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  Check,
  X
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
      alert("Error creating request.");
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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 sm:pb-0">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-3 sm:py-0 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">Request Workflow</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button 
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('USER')}
                >
                  User View
                </button>
                <button 
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager View
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-shadow shadow-sm"
              >
                <Plus size={18} />
                New Request
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Plus Icon (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg active:scale-95 transition-all"
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
                className="px-3 py-2 text-xs font-bold border border-gray-100 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select 
                value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-gray-100 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-[10px] font-black uppercase">Syncing...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-24 text-center text-gray-300 px-4 font-bold text-xs uppercase tracking-widest">
              No results found
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requester</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{req.title}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-xs">{req.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">{req.requestedBy}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase">
                            {req.type === 'LEAVE' ? <Calendar size={12} /> : req.type === 'EXPENSE' ? <DollarSign size={12} /> : <Briefcase size={12} />}
                            {req.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'PENDING' && role === 'MANAGER' && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')} 
                                className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all active:scale-90"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')} 
                                className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-all active:scale-90"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-gray-100">
                {requests.map((req) => (
                  <div key={req.id} className="p-5 active:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 leading-tight pr-4">{req.title}</h4>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full border flex-shrink-0 ${
                        req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{req.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        Request by <span className="text-gray-700 font-black">{req.requestedBy}</span>
                      </div>
                      <div className="flex gap-3">
                        {req.status === 'PENDING' && role === 'MANAGER' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')} 
                              className="w-9 h-9 flex items-center justify-center bg-green-600 text-white rounded-full shadow-md active:scale-90 transition-all"
                            >
                              <Check size={20} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')} 
                              className="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-full shadow-md active:scale-90 transition-all"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl p-8">
            <h3 className="text-lg font-bold mb-6">New Entry</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <input 
                type="text" required placeholder="Subject" 
                className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <input 
                type="text" required placeholder="Your Name" 
                className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.requestedBy} onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
              />
              <select 
                className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
              >
                <option value="GENERAL">General</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
              </select>
              <textarea 
                rows={3} required placeholder="Reason / Description" 
                className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 resize-none focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-lg text-sm font-bold text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold shadow-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
