"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  User, 
  ShieldCheck, 
  Loader2,
  Calendar,
  Briefcase,
  DollarSign,
  ChevronRight,
  RefreshCw,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

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

  const getTypeIcon = (type: RequestType) => {
    switch (type) {
      case "LEAVE": return <Calendar size={16} />;
      case "EXPENSE": return <DollarSign size={16} />;
      default: return <Briefcase size={16} />;
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-100/40 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">FlowApp</h1>
            </div>
            <p className="text-slate-500 font-medium">Enterprise Approval Management</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${role === 'USER' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                onClick={() => setRole('USER')}
              >
                <User size={16} />
                User
              </button>
              <button 
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${role === 'MANAGER' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                onClick={() => setRole('MANAGER')}
              >
                <ShieldCheck size={16} />
                Manager
              </button>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">New</span>
            </motion.button>
          </div>
        </motion.header>

        {/* Filters Panel */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white bg-white/70 backdrop-blur-xl p-5 shadow-sm ring-1 ring-slate-200/50"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
              </div>
              
              <div className="flex gap-3">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                >
                  <option value="">All Types</option>
                  <option value="LEAVE">Leave</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {(filterStatus || filterType) && (
                  <motion.button 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => {setFilterStatus(""); setFilterType("");}}
                    className="flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Clear Filters
                  </motion.button>
                )}
              </AnimatePresence>
              <div className="h-8 w-px bg-slate-200 hidden md:block" />
              <p className="text-sm text-slate-400 font-medium hidden md:block">
                Showing {requests.length} results
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/50 border border-white"
              >
                <div className="relative">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                  <div className="absolute inset-0 bg-blue-400/20 blur-xl animate-pulse" />
                </div>
                <p className="text-slate-500 font-semibold animate-pulse">Synchronizing Workflow...</p>
              </motion.div>
            ) : requests.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-white border border-slate-100 shadow-sm"
              >
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <Clock size={40} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No requests found</h3>
                <p className="text-slate-500 mt-1 max-w-xs">Try adjusting your filters or create a new request to get started.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Create your first request
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1"
              >
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Request Detail</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Requester</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                        <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.map((req) => (
                        <motion.tr 
                          key={req.id} 
                          variants={itemVariants}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{req.title}</div>
                            <div className="mt-1 text-sm text-slate-400 max-w-sm truncate">{req.description}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {req.requestedBy.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{req.requestedBy}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                                {getTypeIcon(req.type)}
                              </span>
                              <span className="text-xs font-bold uppercase tracking-tight">{req.type}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase border shadow-sm ${getStatusColor(req.status)}`}>
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                req.status === 'APPROVED' ? 'bg-emerald-500' :
                                req.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              {req.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {req.status === 'PENDING' && role === 'MANAGER' ? (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                  className="rounded-xl bg-emerald-500 p-2 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                >
                                  <CheckCircle2 size={18} />
                                </motion.button>
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                  className="rounded-xl bg-rose-500 p-2 text-white hover:bg-rose-600 shadow-lg shadow-rose-200"
                                >
                                  <XCircle size={18} />
                                </motion.button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                                {req.status === 'PENDING' ? 'Processing' : 'Archived'}
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="grid gap-4 md:hidden">
                  {requests.map((req) => (
                    <motion.div 
                      key={req.id} 
                      variants={itemVariants}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-100/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                            {getTypeIcon(req.type)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 leading-tight">{req.title}</h4>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{req.type}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <div className="mb-5">
                        <p className="text-sm text-slate-500 line-clamp-2">{req.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                            {req.requestedBy.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-600">{req.requestedBy}</span>
                        </div>
                        
                        {req.status === 'PENDING' && role === 'MANAGER' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="rounded-xl bg-emerald-500 p-2 text-white shadow-lg shadow-emerald-100"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="rounded-xl bg-rose-500 p-2 text-white shadow-lg shadow-rose-100"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl border border-white"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Initiate Request</h2>
                  <p className="text-sm text-slate-500 font-medium">Please fill in the details below</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <XCircle size={32} />
                </button>
              </div>
              
              <form onSubmit={handleCreateRequest} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Title</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="Vacation Leave"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="John Doe"
                      value={formData.requestedBy}
                      onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Request Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['GENERAL', 'LEAVE', 'EXPENSE'] as RequestType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type})}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                          formData.type === type 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md ring-1 ring-blue-600' 
                          : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {getTypeIcon(type)}
                        <span className="text-[10px] font-black tracking-wider uppercase">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                  <textarea 
                    rows={4} 
                    required 
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="Briefly describe the reason for your request..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    className="flex-1 rounded-2xl border border-slate-100 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-1 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest"
                  >
                    Send Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
