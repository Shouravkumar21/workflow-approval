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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 sm:pb-0">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-3 sm:py-0 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">Request Workflow</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button 
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('USER')}
                >
                  User
                </button>
                <button 
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={18} />
                New
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Plus Icon for Mobile */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-8 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-all hover:bg-blue-700"
      >
        <Plus size={28} />
      </button>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Row - Properly Responsive */}
        <div className="flex flex-row gap-2 sm:gap-6 mb-8 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <div className="flex-1 min-w-[90px] bg-white p-3 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-xl text-blue-600 mb-1.5 sm:mb-3">
              <Plus size={18} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-sm sm:text-2xl font-black">{requests.length}</p>
          </div>
          <div className="flex-1 min-w-[90px] bg-white p-3 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
            <div className="p-2 sm:p-3 bg-amber-50 rounded-xl text-amber-600 mb-1.5 sm:mb-3">
              <Clock size={18} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pending</p>
            <p className="text-sm sm:text-2xl font-black text-amber-600">{requests.filter(r => r.status === 'PENDING').length}</p>
          </div>
          <div className="flex-1 min-w-[90px] bg-white p-3 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
            <div className="p-2 sm:p-3 bg-green-50 rounded-xl text-green-600 mb-1.5 sm:mb-3">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pass</p>
            <p className="text-sm sm:text-2xl font-black text-green-600">{requests.filter(r => r.status === 'APPROVED').length}</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest px-1">
              <Filter size={16} />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-3 w-full">
              <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select 
                value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Type: All</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Listing */}
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-3" size={36} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Data</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-32 text-center text-gray-300 font-black text-xs uppercase tracking-[0.3em] px-8">
              No matching records found
            </div>
          ) : (
            <>
              {/* Responsive Table for Tablet and Up */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Info</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requester</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-gray-900 text-sm mb-1">{req.title}</div>
                          <div className="text-xs text-gray-400 line-clamp-1 max-w-sm">{req.description}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shadow-inner">
                              {req.requestedBy.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{req.requestedBy}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                            <span className="p-1.5 bg-gray-50 rounded-lg">
                              {req.type === 'LEAVE' ? <Calendar size={12} /> : req.type === 'EXPENSE' ? <DollarSign size={12} /> : <Briefcase size={12} />}
                            </span>
                            {req.type}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-xl border ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100 shadow-sm shadow-green-100' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100 shadow-sm shadow-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100 shadow-sm shadow-amber-100'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {req.status === 'PENDING' && role === 'MANAGER' && (
                            <div className="flex justify-end gap-2.5">
                              <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-90"><Check size={20} /></button>
                              <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-90"><X size={20} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card View for Mobile/Tablets */}
              <div className="lg:hidden divide-y divide-gray-50">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 active:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">{req.title}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {req.type === 'LEAVE' ? <Calendar size={10} /> : req.type === 'EXPENSE' ? <DollarSign size={10} /> : <Briefcase size={10} />}
                          {req.type}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-xl border flex-shrink-0 ${
                        req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed line-clamp-2">{req.description}</p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                          {req.requestedBy.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight truncate">
                          {req.requestedBy}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {req.status === 'PENDING' && role === 'MANAGER' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-2xl shadow-xl shadow-green-100 active:scale-90 transition-all"><Check size={20} /></button>
                            <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-2xl shadow-xl shadow-red-100 active:scale-90 transition-all"><X size={20} /></button>
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

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl p-8 sm:p-10 transform transition-all animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">New Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  type="text" required placeholder="What is this for?" 
                  className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Requester Name</label>
                <input 
                  type="text" required placeholder="Who is asking?" 
                  className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.requestedBy} onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
                >
                  <option value="GENERAL">General</option>
                  <option value="LEAVE">Leave</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Context / Details</label>
                <textarea 
                  rows={3} required placeholder="Describe the request..." 
                  className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
