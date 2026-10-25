import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LayoutGrid, MapPin, BadgePercent, Key, Calendar, X, Sparkles } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Projects() {
  const { user, token } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Pre-fill user details when modal opens
  const openInquiryModal = (proj) => {
    setSelectedProject(proj);
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
    }
    setMessage(`Assalam o Alaikum, I am highly interested in the off-plan project "${proj.title}" located in ${proj.location}. Please send the priority booking brochure, unit floor layouts, and the detailed 4-year installment plan.`);
    setSuccess(false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !message || !selectedProject) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          projectId: selectedProject._id,
          name,
          email,
          phone,
          message
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(resData.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.error('Project inquiry error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-fade-in text-charcoal">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Off-Plan Masterpieces</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal mt-1 mb-3">
          Luxury Architectural Projects
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Discover exclusive off-plan residential sectors, executive towers, ocean-front developments, and luxury golf course community villas currently under construction in DHA Phase 8 and DHA City.
        </p>
      </div>

      {/* Grid: Full-Width Project Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white border p-4 space-y-4 animate-pulse">
              <div className="h-64 bg-gray-200" />
              <div className="h-4 bg-gray-200 w-1/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xs">
          No off-plan developments found in the system.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map(proj => (
            <div
              key={proj._id}
              className="bg-white border border-charcoal/5 shadow-luxury flex flex-col hover:shadow-glass transition-all duration-300 group"
            >
              {/* Visual */}
              <div className="relative h-72 bg-charcoal overflow-hidden">
                <img 
                  src={proj.images[0]} 
                  alt={proj.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                  {proj.status}
                </div>
                <div className="absolute bottom-4 right-4 bg-charcoal/70 text-white text-xxs font-bold px-3 py-1 font-serif">
                  Starting {proj.priceStarting}
                </div>
              </div>

              {/* Body details */}
              <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                <div className="space-y-2">
                  <span className="text-xxs font-bold text-primary uppercase tracking-widest block">{proj.location}</span>
                  <h3 className="text-xl font-serif font-bold text-charcoal">{proj.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed pl-3 border-l-2 border-primary/20">{proj.description}</p>
                </div>
                
                {/* Details list */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 border-t border-b border-charcoal/5 py-3 text-center text-[10px] font-bold text-charcoal-light">
                    <div>
                      <span className="text-gray-400 block text-[9px] mb-0.5">Area Range</span>
                      <span>{proj.areaRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] mb-0.5">Downpayment</span>
                      <span>10% Token</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] mb-0.5">Tenure Term</span>
                      <span>4 Year Plan</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openInquiryModal(proj)}
                    className="w-full btn-primary-dha py-3 text-xs flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Request Installment Chart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Glassmorphic Modal Dialog */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white border border-charcoal/10 shadow-glass w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-charcoal hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Priority Project Inquiry</span>
              <h3 className="text-xl font-serif font-bold text-charcoal mt-1">
                {selectedProject.title}
              </h3>
              <p className="text-[11px] text-gray-400 font-semibold">{selectedProject.location}</p>
            </div>

            {success ? (
              <div className="bg-primary/5 border border-primary/20 p-6 text-center space-y-4">
                <h4 className="font-bold font-serif text-primary text-lg">Interest Registered Successfully!</h4>
                <p className="text-xs text-charcoal-light leading-relaxed font-semibold">
                  Thank you for registering your interest in {selectedProject.title}. The official transfer office has cataloged your lead. We will send the priority brochures and full installment chart breakdown directly via email/WhatsApp.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-luxury py-2.5 px-6 text-xs mx-auto block"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4 text-charcoal">
                {error && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-2.5 text-xxs font-bold text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Asif Siddiqui"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. asif@gmail.com"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Inquiry Message</label>
                  <textarea
                    rows="4"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary-dha py-3.5 text-xs font-bold tracking-wider"
                >
                  {submitting ? 'Registering Interest...' : 'Request Installment Chart'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
