import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL as API } from '../lib/api';


// Viewings / appointments page.
// Buyers see their own requests; agents see assigned viewings; admins see all.
// Status changes go through PUT /api/viewings/:id (server enforces who may
// change what, and re-checks hour-window conflicts on reschedule).
export default function ViewingsPage() {
  const { user, token, isAuthenticated } = useAuthStore();
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const endpoint =
    user?.role === 'ADMIN'
      ? `${API}/viewings/admin`
      : user?.role === 'AGENT'
        ? `${API}/viewings/agent`
        : `${API}/viewings/me`;

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load viewings');
      setViewings(data.viewings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const changeStatus = async (id, status) => {
    setNotice('');
    try {
      const res = await fetch(`${API}/viewings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setNotice(`Viewing ${status.toLowerCase()} successfully.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif font-bold text-2xl mb-3">Property Viewings</h1>
        <p className="text-sm text-gray-600 mb-6">Please log in to view your appointments.</p>
        <Link to="/auth" className="btn-primary-dha px-6 py-3">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-serif font-bold text-2xl mb-1">Property Viewings</h1>
      <p className="text-xs text-gray-500 mb-8">
        {user?.role === 'ADMIN'
          ? 'All appointments across the platform.'
          : user?.role === 'AGENT'
            ? 'Viewings assigned to you.'
            : 'Your requested appointments. You can cancel a viewing here.'}
      </p>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 mb-4">{error}</p>}
      {notice && <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-3 mb-4">{notice}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading viewings…</p>
      ) : viewings.length === 0 ? (
        <div className="text-center py-16 border border-dashed text-gray-400 text-sm">
          No viewings yet. Open a property and request a viewing from its details page.
        </div>
      ) : (
        <div className="space-y-4">
          {viewings.map((v) => (
            <div key={v._id} className="p-5 border shadow-luxury flex flex-col md:flex-row justify-between gap-4">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 text-white bg-primary">{v.status}</span>
                  <span className="text-xs text-gray-500">{new Date(v.dateTime).toLocaleString()}</span>
                </div>
                <h3 className="font-serif font-bold">{v.property?.title || 'Property'}</h3>
                <p className="text-xs text-gray-600">{v.property?.location} · {v.property?.phase}</p>
                {v.buyer?.name && <p className="text-xs text-gray-600">Buyer: {v.buyer.name} ({v.buyer.phone || v.buyer.email})</p>}
                {v.agent?.name && <p className="text-xs text-gray-600">Agent: {v.agent.name}</p>}
                {v.notes && <p className="text-xs text-gray-500 italic">Notes: {v.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-2 items-start">
                {(user?.role === 'AGENT' || user?.role === 'ADMIN') && v.status === 'Requested' && (
                  <button onClick={() => changeStatus(v._id, 'Confirmed')} className="px-3 py-2 text-xs font-bold border border-green-600/30 text-green-700 hover:bg-green-600 hover:text-white">Confirm</button>
                )}
                {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (v.status === 'Confirmed' || v.status === 'Rescheduled') && (
                  <button onClick={() => changeStatus(v._id, 'Completed')} className="px-3 py-2 text-xs font-bold border hover:bg-primary hover:text-white">Mark Completed</button>
                )}
                {v.status !== 'Cancelled' && v.status !== 'Completed' && (
                  <button onClick={() => changeStatus(v._id, 'Cancelled')} className="px-3 py-2 text-xs font-bold border border-red-600/30 text-red-700 hover:bg-red-600 hover:text-white">Cancel</button>
                )}
                <Link to={`/listings/${v.property?._id}`} className="px-3 py-2 text-xs font-bold border hover:bg-gray-100">View Property</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
