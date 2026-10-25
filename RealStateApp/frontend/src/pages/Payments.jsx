import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL as API } from '../lib/api';


// Payment history page (SANDBOX ONLY).
// No real payment gateway is integrated. Payments are recorded as Pending
// and confirmed only through the explicit sandbox endpoint. Receipts are
// shown only for Confirmed payments. No real money ever moves here.
export default function PaymentsPage() {
  const { user, token, isAuthenticated } = useAuthStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [propertyId, setPropertyId] = useState('');

  const endpoint = user?.role === 'ADMIN' ? `${API}/payments/admin` : `${API}/payments/me`;

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load payments');
      setPayments(data.payments || []);
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

  const createPayment = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const res = await fetch(`${API}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          propertyId: propertyId.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record payment');
      setNotice('Sandbox payment recorded as Pending (no real money moved).');
      setAmount('');
      setPropertyId('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmPayment = async (id) => {
    setError('');
    setNotice('');
    try {
      const res = await fetch(`${API}/payments/${id}/confirm`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Confirmation failed');
      setNotice(`Payment confirmed (sandbox). Receipt: ${data.payment.receiptNo}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif font-bold text-2xl mb-3">Payment History</h1>
        <p className="text-sm text-gray-600 mb-6">Please log in to view your payments.</p>
        <Link to="/auth" className="btn-primary-dha px-6 py-3">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-serif font-bold text-2xl mb-1">Payment History</h1>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 mb-8">
        Sandbox mode: no real payment gateway is connected and no real money moves.
        Receipts are issued only for Confirmed payments.
      </p>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 mb-4">{error}</p>}
      {notice && <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-3 mb-4">{notice}</p>}

      {user?.role !== 'ADMIN' && (
        <form onSubmit={createPayment} className="border p-5 mb-10 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (PKR)"
            className="p-2.5 border text-sm"
          />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="p-2.5 border text-sm">
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card (Sandbox)">Card (Sandbox)</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="Property ID (optional)"
            className="p-2.5 border text-sm"
          />
          <button type="submit" className="btn-primary-dha py-2.5 text-sm font-bold">Record Sandbox Payment</button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading payments…</p>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 border border-dashed text-gray-400 text-sm">No payments recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p._id} className="p-5 border shadow-luxury flex flex-col md:flex-row justify-between gap-4">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 text-white bg-primary">{p.status}</span>
                  <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                <p className="font-bold">PKR {Number(p.amount).toLocaleString()} · {p.method} · {p.currency}</p>
                {p.property?.title && <p className="text-xs text-gray-600">Property: {p.property.title}</p>}
                {p.user?.name && <p className="text-xs text-gray-600">User: {p.user.name} ({p.user.email})</p>}
                {p.status === 'Confirmed' && p.receiptNo && (
                  <p className="text-xs font-bold text-green-700">Receipt: {p.receiptNo}</p>
                )}
              </div>
              {p.status === 'Pending' && (
                <button onClick={() => confirmPayment(p._id)} className="self-start px-3 py-2 text-xs font-bold border border-green-600/30 text-green-700 hover:bg-green-600 hover:text-white">
                  Confirm (Sandbox)
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
