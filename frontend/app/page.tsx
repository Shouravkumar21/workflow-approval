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
      alert("Submission failed.");
    }
  };

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { status, role });
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || "Update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 lg:pb-8">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-3 sm:py-0 gap-4">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight">Request Workflow</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('USER')}
                >
                  User
                </button>
                <button 
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                <Plus size={18} />
                New
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Action Button - Positioned for thumb reach */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-8 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-xl active:scale-90 transition-all"
      >
        <Plus size={28} />
      </button>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        {/* Responsive Stats Grid */}
        <div className="flex flex-row gap-3 sm:gap-6 mb-8 overflow-x-auto no-scrollbar">
          <div className="flex-1 min-w-[100px] bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-xl text-blue-600 mb-2 sm:mb-3">
              <Plus size={20} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-base sm:text-2xl font-black">{requests.length}</p>
          </div>
          <div className="flex-1 min-w-[100px] bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
            <div className="p-2 sm:p-3 bg-amber-50 rounded-xl text-amber-600 mb-2 sm:mb-3">
              <Clock size={20} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Wait</p>
            <p className="text-base sm:text-2xl font-black text-amber-600">{requests.filter(r => r.status === 'PENDING').length}</p>
          </div>
          <div className="flex-1 min-w-[100px] bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
            <div className="p-2 sm:p-3 bg-green-50 rounded-xl text-green-600 mb-2 sm:mb-3">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pass</p>
            <p className="text-base sm:text-2xl font-black text-green-600">{requests.filter(r => r.status === 'APPROVED').length}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest w-full md:w-auto">
              <Filter size={16} />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-bold border border-gray-100 rounded-xl bg-gray-50 outline-none"
              >
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select 
                value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-bold border border-gray-100 rounded-xl bg-gray-50 outline-none"
              >
                <option value="">Type: All</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin inline-block text-gray-400 mb-2" size={36} />
              <p className="text-[10px] font-black uppercase text-gray-400">Loading</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-32 text-center text-gray-300 font-bold text-xs uppercase tracking-widest">
              Empty results
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested By</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-gray-900 text-sm mb-1">{req.title}</div>
                          <div className="text-xs text-gray-400 line-clamp-1">{req.description}</div>
                        </td>
                        <td className="px-8 py-5 text-sm font-semibold text-gray-700">{req.requestedBy}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                            {req.type === 'LEAVE' ? <Calendar size={12} /> : req.type === 'EXPENSE' ? <DollarSign size={12} /> : <Briefcase size={12} />}
                            {req.type}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-xl border ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {req.status === 'PENDING' && role === 'MANAGER' && (
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-xl shadow-lg shadow-green-100 active:scale-90 transition-all"><Check size={20} /></button>
                              <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-xl shadow-lg shadow-red-100 active:scale-90 transition-all"><X size={20} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden divide-y divide-gray-50">
                {requests.map((req) => (
                  <div key={req.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-gray-900 text-base mb-1">{req.title}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight">
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
                    <p className="text-sm text-gray-500 mb-5 line-clamp-2">{req.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-black">
                          {req.requestedBy.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase truncate max-w-[120px]">
                          {req.requestedBy}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {req.status === 'PENDING' && role === 'MANAGER' && (
                          <div className="flex gap-2.5">
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

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl p-8 sm:p-10 transform transition-all">
            <h3 className="text-2xl font-black text-gray-900 mb-8">New Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <input 
                type="text" required placeholder="Subject" 
                className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <input 
                type="text" required placeholder="Your Name" 
                className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={formData.requestedBy} onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
              />
              <select 
                className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
              >
                <option value="GENERAL">General</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
              </select>
              <textarea 
                rows={3} required placeholder="Description" 
                className="w-full border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold bg-gray-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl text-sm font-bold text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-bold shadow-xl">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
