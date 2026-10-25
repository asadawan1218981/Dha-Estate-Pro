// Central backend API address for the whole frontend.
//
// Local development: leave VITE_API_URL unset (the fallback below is used),
// or set it in frontend/.env:
//   VITE_API_URL=http://localhost:5000/api
//
// Production (Vercel/Netlify): set VITE_API_URL in the hosting dashboard to
// the deployed backend URL, e.g.:
//   VITE_API_URL=https://your-backend.up.railway.app/api
//
// NOTE: Vite embeds this value at build time. Changing it requires a rebuild.
// The value may be given with or without the trailing /api; both work.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export const API_ORIGIN = API_BASE.replace(/\/api$/, '');
export const API_URL = `${API_ORIGIN}/api`;
