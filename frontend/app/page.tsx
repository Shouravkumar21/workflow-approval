"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Plus, 
  Loader2,
  Filter
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
      console.error("Error:", error);
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
      alert("Failed to create request.");
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
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">Approval System</h1>
          <div className="flex items-center gap-4">
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as any)}
              className="border p-2 rounded text-sm bg-gray-50"
            >
              <option value="USER">User Role</option>
              <option value="MANAGER">Manager Role</option>
            </select>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
              Add New Request
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 items-center bg-gray-50 p-4 rounded border">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="font-semibold text-sm">Filters:</span>
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-2 rounded text-sm bg-white"
          >
            <option value="">All Types</option>
            <option value="LEAVE">Leave</option>
            <option value="EXPENSE">Expense</option>
            <option value="GENERAL">General</option>
          </select>
        </div>

        {/* Table / List */}
        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              <Loader2 className="animate-spin inline-block mr-2" size={20} />
              Loading...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No requests found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 font-semibold text-sm">Title / Description</th>
                  <th className="p-4 font-semibold text-sm">Requested By</th>
                  <th className="p-4 font-semibold text-sm">Type</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold">{req.title}</div>
                      <div className="text-sm text-gray-600">{req.description}</div>
                    </td>
                    <td className="p-4 text-sm">{req.requestedBy}</td>
                    <td className="p-4 text-sm">{req.type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'PENDING' && role === 'MANAGER' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create New Request</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input 
                  type="text" required
                  className="w-full border p-2 rounded"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Requested By</label>
                <input 
                  type="text" required
                  className="w-full border p-2 rounded"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Type</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as RequestType})}
                >
                  <option value="GENERAL">General</option>
                  <option value="LEAVE">Leave</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea 
                  required
                  className="w-full border p-2 rounded h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold"
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
