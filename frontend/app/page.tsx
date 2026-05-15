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
          <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={28} />
              <span className="text-xl font-bold">Request Workflow</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button 
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${role === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('USER')}
                >
                  User View
                </button>
                <button 
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${role === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setRole('MANAGER')}
                >
                  Manager View
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                New Request
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
      >
        <Plus size={24} />
      </button>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Volume</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">{requests.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Audit</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-amber-600">
                {requests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Approved</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-green-600">
                {requests.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Filter size={18} />
              <span className="text-sm font-bold">Filters:</span>
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-3 w-full">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Type: All</option>
                <option value="LEAVE">Leave</option>
                <option value="EXPENSE">Expense</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            
            {(filterStatus || filterType) && (
              <button 
                onClick={() => {setFilterStatus(""); setFilterType("");}}
                className="text-sm text-blue-600 hover:underline font-bold sm:ml-auto"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={40} />
              <p className="text-sm font-medium">Syncing Data...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-gray-500 px-4">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-700">No requests match your criteria</p>
              <p className="text-sm mt-1">Try resetting filters or create a new entry.</p>
            </div>
          ) : (
            <>
              {/* Desktop View (Table) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Request Detail</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Requester</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{req.title}</div>
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{req.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">
                              {req.requestedBy.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{req.requestedBy}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                            {req.type === 'LEAVE' ? <Calendar size={14} /> : req.type === 'EXPENSE' ? <DollarSign size={14} /> : <Briefcase size={14} />}
                            {req.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase rounded-full border shadow-sm ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'PENDING' && role === 'MANAGER' ? (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition-all active:scale-95"
                                title="Approve"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                className="p-2 text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md transition-all active:scale-95"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-3 items-center">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {req.status === 'PENDING' ? 'Active' : 'Locked'}
                              </span>
                              <button 
                                onClick={() => handleDelete(req.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
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

              {/* Mobile View (Cards) */}
              <div className="md:hidden divide-y divide-gray-100">
                {requests.map((req) => (
                  <div key={req.id} className="p-5 active:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{req.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Requested By</span>
                          <span className="text-xs font-bold text-gray-700">{req.requestedBy}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                        req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{req.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase">
                        {req.type === 'LEAVE' ? <Calendar size={12} /> : req.type === 'EXPENSE' ? <DollarSign size={12} /> : <Briefcase size={12} />}
                        {req.type}
                      </div>
                      
                      <div className="flex gap-2">
                        {req.status === 'PENDING' && role === 'MANAGER' ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleDelete(req.id)}
                            className="text-gray-400 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* Responsive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create Request</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-300 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateRequest} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Title</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                      placeholder="e.g. Health Leave"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                      placeholder="Your Name"
                      value={formData.requestedBy}
                      onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Type</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
                  >
                    <option value="GENERAL">General Audit</option>
                    <option value="LEAVE">Leave Request</option>
                    <option value="EXPENSE">Expense Claim</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Description</label>
                  <textarea 
                    rows={4} 
                    required 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50/50"
                    placeholder="Provide details..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
