import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { KeyRound, Mail, User, Phone, Briefcase, Eye, EyeOff } from 'lucide-react';

export default function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role, phone);
      }
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 page-fade-in text-charcoal">
      <div className="max-w-md w-full glass p-8 shadow-luxury border-none relative">
        
        {/* Top Logo Indicator */}
        <div className="text-center mb-8 border-b border-charcoal/5 pb-4">
          <span className="text-xl font-bold tracking-widest text-charcoal">
            DHA<span className="text-primary ml-1.5 font-serif font-semibold italic">ESTATE PRO</span>
          </span>
          <p className="text-xxs uppercase tracking-widest text-gray-400 font-bold mt-1">
            {isLogin ? 'SECURE PORTAL LOGIN' : 'CREATE SAAS ACCOUNT'}
          </p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-primary/5 border border-primary/20 p-3 text-center text-xs font-bold text-primary uppercase tracking-wider">
              {submitError}
            </div>
          )}

          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="flex flex-col text-left">
              <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ali Jafri"
                  className="w-full bg-white border border-charcoal/10 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ali@dhaestatepro.com"
                className="w-full bg-white border border-charcoal/10 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Phone Field (Register Only) */}
          {!isLogin && (
            <div className="flex flex-col text-left">
              <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">WhatsApp / Phone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-white border border-charcoal/10 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="flex flex-col text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-charcoal/10 pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-charcoal"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role designation (Register Only - Great for testing agent/admin Dashboards!) */}
          {!isLogin && (
            <div className="flex flex-col text-left">
              <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Account Role Designation</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Briefcase className="w-4 h-4" />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-charcoal/10 pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="USER">Buyer / Regular User</option>
                  <option value="AGENT">Karachi DHA Agent</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
              <span className="text-[9px] text-primary mt-1 font-semibold block uppercase">
                *Select AGENT or ADMIN to explore specific dashboards and listings CRUD features.
              </span>
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-dha py-3 mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In Portal' : 'Create Account')}
          </button>
        </form>

        {/* Tab Switching */}
        <div className="text-center mt-6 pt-4 border-t border-charcoal/5 text-xxs font-bold uppercase tracking-widest">
          {isLogin ? (
            <p>
              New to the platform?{' '}
              <button onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                Create An Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                Sign In Instead
              </button>
            </p>
          )}
        </div>

        {/* Demo Accounts Vetting Helper */}
        <div className="mt-8 p-3 bg-gray-100/50 border border-charcoal/5 text-left text-xxs font-semibold uppercase tracking-wider space-y-1">
          <span className="text-primary font-bold block mb-1">DEMO TESTING ACCOUNTS (SEEDED):</span>
          <div className="grid grid-cols-1 gap-1 text-[9px] text-gray-500">
            <div>• <span className="font-bold">Admin:</span> admin@dhaestatepro.com / admin123</div>
            <div>• <span className="font-bold">Agent Saad:</span> saad.agent@dhaestatepro.com / agent123</div>
            <div>• <span className="font-bold">Agent Ali:</span> ali.agent@dhaestatepro.com / agent123</div>
            <div>• <span className="font-bold">Buyer:</span> buyer@dhaestatepro.com / buyer123</div>
          </div>
        </div>

      </div>
    </div>
  );
}
