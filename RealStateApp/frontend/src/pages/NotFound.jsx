import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="font-serif font-bold text-4xl mb-3">404 — Page Not Found</h1>
      <p className="text-sm text-gray-600 mb-8">
        The page you are looking for does not exist or was moved.
      </p>
      <Link to="/" className="btn-primary-dha px-6 py-3">
        Back to Home
      </Link>
    </div>
  );
}
