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
  Trash2,
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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 sm:pb-0">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-3 sm:py-0 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} />
              <span className="text-lg font-bold">Request Workflow</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button 
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1 text-xs font-semibold rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('USER')}
                >
                  User
                </button>
                <button 
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1 text-xs font-semibold rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                <Plus size={18} />
                New Request
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile FAB */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        <Plus size={24} />
      </button>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid - Now 1 line on mobile */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
          <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg text-blue-600 mb-2">
              <Plus size={16} className="sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
            <p className="text-base sm:text-2xl font-black">{requests.length}</p>
          </div>
          <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 sm:p-3 bg-amber-50 rounded-lg text-amber-600 mb-2">
              <Clock size={16} className="sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-base sm:text-2xl font-black text-amber-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg text-green-600 mb-2">
              <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pass</p>
            <p className="text-base sm:text-2xl font-black text-green-600">
              {requests.filter(r => r.status === 'APPROVED').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 w-full">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Type: All</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-gray-400 px-4">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No matching results</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Request</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Requester</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{req.title}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[200px]">{req.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
                              {req.requestedBy.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{req.requestedBy}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                            {req.type === 'LEAVE' ? <Calendar size={12} /> : req.type === 'EXPENSE' ? <DollarSign size={12} /> : <Briefcase size={12} />}
                            {req.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border shadow-sm ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {req.status === 'PENDING' && role === 'MANAGER' ? (
                              <>
                                <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="p-1.5 bg-green-600 text-white rounded shadow-sm"><CheckCircle2 size={16} /></button>
                                <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="p-1.5 bg-red-600 text-white rounded shadow-sm"><XCircle size={16} /></button>
                              </>
                            ) : (
                              <button onClick={() => handleDelete(req.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-gray-100">
                {requests.map((req) => (
                  <div key={req.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 leading-tight pr-4">{req.title}</h4>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border flex-shrink-0 ${
                        req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{req.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[8px] font-black">{req.requestedBy.charAt(0).toUpperCase()}</div>
                        {req.requestedBy}
                      </div>
                      <div className="flex gap-3">
                        {req.status === 'PENDING' && role === 'MANAGER' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="text-green-600 font-black">Pass</button>
                            <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="text-red-600 font-black">Fail</button>
                          </div>
                        ) : (
                          <button onClick={() => handleDelete(req.id)} className="text-gray-300">Delete</button>
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
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold mb-6">New Entry</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <input 
                type="text" required placeholder="Subject" 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <input 
                type="text" required placeholder="Your Name" 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50"
                value={formData.requestedBy} onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
              />
              <select 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
              >
                <option value="GENERAL">General</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
              </select>
              <textarea 
                rows={3} required placeholder="Description" 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold bg-gray-50 resize-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-lg text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold shadow-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
