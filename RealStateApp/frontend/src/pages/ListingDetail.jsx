import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MapPin, Phone, MessageSquare, Heart, ShieldCheck, Calculator, School, Landmark, UtensilsCrossed, Sparkles, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, toggleFavorite } = useAuthStore();
  
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  // Inquiry form states
  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqMsg, setInqMsg] = useState('Assalam o Alaikum, I am highly interested in this property. Please share booking guidelines and possession documents.');
  const [inqSuccess, setInqSuccess] = useState(false);

  // Viewing request states
  const [viewDate, setViewDate] = useState('');
  const [viewTime, setViewTime] = useState('');
  const [viewNotes, setViewNotes] = useState('');
  const [viewMsg, setViewMsg] = useState('');
  const [viewSuccess, setViewSuccess] = useState(false);

  // Mortgage Calculator states
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(13.5); // standard Pakistani KIBOR markup
  const [loanTermYears, setLoanTermYears] = useState(20);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Fetch single property detail & similar items
  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/properties/${id}`);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        setProperty(data.property);
        
        // Populate inquiry fields if user is authenticated
        if (user) {
          setInqName(user.name);
          setInqEmail(user.email);
          setInqPhone(user.phone || '');
        }

        // Fetch similar properties in same phase or same type
        const simResponse = await fetch(`${API_URL}/properties?type=${data.property.type}&limit=4`);
        if (simResponse.ok) {
          const simData = await simResponse.json();
          setSimilarProperties(simData.properties.filter(p => p._id !== data.property._id).slice(0, 3));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPropertyDetail();
  }, [id, user]);

  // Recalculate Mortgage on slider changes
  useEffect(() => {
    if (!property) return;
    const loanAmount = property.price * (1 - downPaymentPercent / 100);
    const monthlyRate = (interestRate / 100) / 12;
    const totalPayments = loanTermYears * 12;

    let payment = 0;
    if (monthlyRate === 0) {
      payment = loanAmount / totalPayments;
    } else {
      payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }
    setMonthlyPayment(payment);
  }, [property, downPaymentPercent, interestRate, loanTermYears]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inqName || !inqEmail || !inqPhone || !inqMsg) return;

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: id,
          name: inqName,
          email: inqEmail,
          phone: inqPhone,
          message: inqMsg
        })
      });
      if (response.ok) {
        setInqSuccess(true);
      }
    } catch (err) {
      console.error('Submit lead error:', err);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      alert('Please Sign In or Register to add properties to your favorites catalog!');
      return;
    }
    await toggleFavorite(id);
  };

  const handleViewingSubmit = async (e) => {
    e.preventDefault();
    setViewMsg('');
    if (!isAuthenticated) {
      alert('Please Sign In or Register to request a viewing!');
      return;
    }
    if (!viewDate || !viewTime) return;
    try {
      const response = await fetch(`${API_URL}/viewings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: id,
          dateTime: new Date(`${viewDate}T${viewTime}`).toISOString(),
          notes: viewNotes
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Viewing request failed');
      setViewSuccess(true);
    } catch (err) {
      setViewMsg(err.message);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSaved = () => {
    return user?.savedProperties?.includes(id);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-pulse">
        <div className="h-96 bg-gray-200 w-full mb-8" />
        <div className="h-8 bg-gray-200 w-1/3 mb-4 mx-auto" />
        <div className="h-6 bg-gray-200 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-charcoal">Property Not Found</h2>
        <Link to="/listings" className="btn-luxury py-2.5 px-6 mt-6 inline-block">Back to Listings</Link>
      </div>
    );
  }

  // Phase specific dynamic nearby amenities
  const getNearbyAmenities = () => {
    if (property.phase === 'Phase 8' || property.phase === 'Phase 6') {
      return {
        schools: ['The C.A.S. School', 'Karachi Grammar School (KGS) Middle Section', 'Hailey College'],
        hospitals: ['South City Hospital', 'DHA Medical Centre Phase 6', 'Clifton Kidney Clinic'],
        dining: ['Kolachi Restaurant', 'Kababjees Highway / Do Darya', 'Bella Vita Bukhari']
      };
    }
    return {
      schools: ['DHA Model School', 'Army Public School (APS)', 'Beaconhouse School System'],
      hospitals: ['National Medical Centre (NMC)', 'DHA Medical Clinic', 'Therapy Works'],
      dining: ['Kaybees Phase 2', 'Ginsoy Bukhari', 'Dunkin Donuts Phase 1']
    };
  };

  const amenities = getNearbyAmenities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in text-charcoal">
      
      {/* Title & Price Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-charcoal/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xxs tracking-[0.2em] font-bold text-primary uppercase">
            {property.phase} / {property.type} / For {property.status === 'BUY' ? 'Sale' : 'Rent'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-charcoal mt-1">{property.title}</h1>
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-1">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest block">Asking Price</span>
            <span className="text-2xl font-serif font-bold text-primary">
              {property.price >= 10000000 
                ? `${(property.price / 10000000).toFixed(2)} Crore`
                : `${(property.price / 100000).toFixed(2)} Lakh`
              } {property.status === 'RENT' && '/ Month'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleSaveToggle}
              className="p-3 border border-charcoal/10 hover:border-primary hover:text-primary transition-all rounded-none bg-white shadow-sm"
              title="Add to Favorites"
            >
              <Heart className={`w-5 h-5 ${isSaved() ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 border border-charcoal/10 hover:border-primary hover:text-primary transition-all rounded-none bg-white shadow-sm relative group"
              title="Copy Listing Link"
            >
              <Share2 className="w-5 h-5" />
              {copied && (
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] py-1 px-2 uppercase tracking-wider font-bold whitespace-nowrap shadow-glass">
                  Link Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Gallery & Details vs. Sidebar Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2/3 width) - Media Gallery & Description */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* A. Image Gallery with active display */}
          <div className="space-y-3">
            <div className="relative h-[45vh] bg-charcoal overflow-hidden border border-charcoal/5 shadow-luxury">
              <img 
                src={property.images[activeImage]} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-20 overflow-hidden border-2 ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* B. Specs Card Grid */}
          <div className="glass p-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center shadow-luxury border-none">
            <div className="border-r border-charcoal/5 last:border-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dimensions</span>
              <span className="font-semibold text-xs text-charcoal">{property.area}</span>
            </div>
            <div className="border-r border-charcoal/5 last:border-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Bedrooms</span>
              <span className="font-semibold text-xs text-charcoal">{property.beds || 'N/A'}</span>
            </div>
            <div className="border-r border-charcoal/5 last:border-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Bathrooms</span>
              <span className="font-semibold text-xs text-charcoal">{property.baths || 'N/A'}</span>
            </div>
            <div className="border-r border-charcoal/5 last:border-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Furnished</span>
              <span className="font-semibold text-xs text-charcoal">{property.furnished || 'Unfurnished'}</span>
            </div>
            <div className="last:border-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Possession</span>
              <span className="font-semibold text-xs text-charcoal">{property.possessionStatus}</span>
            </div>
          </div>

          {/* C. Walkthrough Video Tour */}
          {property.videoUrl && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-charcoal border-b pb-2">Walkthrough Video Tour</h3>
              <div className="relative aspect-video bg-charcoal border border-charcoal/5 shadow-luxury">
                <video 
                  src={property.videoUrl} 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* D. Description */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal border-b pb-2">Property Walkthrough & Features</h3>
            <p className="text-xs text-gray-600 leading-relaxed pl-2 border-l-2 border-primary/20">
              {property.description}
            </p>
          </div>

          {/* E. Listing Metadata Card */}
          <div className="bg-primary/5 p-5 border border-primary/10 grid grid-cols-1 sm:grid-cols-3 text-xxs font-bold text-charcoal-light uppercase tracking-wider gap-4">
            <div>
              <span className="text-gray-400 block mb-0.5">Reference ID</span>
              <span className="text-charcoal font-semibold select-all">{property._id}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Date Registered</span>
              <span className="text-charcoal font-semibold">
                {new Date(property.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Listing Status</span>
              <span className="text-primary font-semibold">For {property.status === 'BUY' ? 'Sale' : 'Rent'}</span>
            </div>
          </div>

          {/* F. Interactive Mortgage Calculator */}
          <div className="glass p-8 shadow-luxury border-none space-y-6">
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2 border-b pb-3">
              <Calculator className="w-5 h-5 text-primary" />
              <span>DHA Mortgage Calculator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="space-y-4">
                {/* Downpayment percent */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Down Payment</span>
                    <span className="text-primary">{downPaymentPercent}% ({(property.price * downPaymentPercent/100/10000000).toFixed(2)} Crore)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Markup rate */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Interest rate (KIBOR Markup)</span>
                    <span className="text-primary">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="22"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Loan term */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Tenure period</span>
                    <span className="text-primary">{loanTermYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculations readout */}
              <div className="bg-primary/5 p-6 border border-primary/10 flex flex-col justify-center items-center text-center space-y-2">
                <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest">ESTIMATED MONTHLY INSTALLMENT</span>
                <span className="text-3xl font-bold font-serif text-primary">
                  PKR {Math.round(monthlyPayment).toLocaleString()}
                </span>
                <span className="text-xxs text-charcoal-light font-semibold uppercase tracking-widest pt-2">
                  LOAN PRINCIPAL: PKR {Math.round(property.price * (1 - downPaymentPercent/100)).toLocaleString()}
                </span>
                <p className="text-[10px] text-gray-400 mt-2 italic leading-relaxed">
                  *Calculator uses standard Pakistani commercial mortgage formulations based on average private bank spreads. Registry rates are subject to change.
                </p>
              </div>
            </div>
          </div>

          {/* G. Phase specific dynamic Nearby Amenities */}
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-lg text-charcoal border-b pb-2">Nearby Infrastructure</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Nearby Schools */}
              <div className="p-5 border border-charcoal/5 shadow-luxury flex flex-col text-left">
                <School className="w-5 h-5 text-primary mb-3" />
                <h4 className="font-bold text-xs uppercase tracking-wider mb-2 border-b pb-1">Schools & Academies</h4>
                <ul className="space-y-1.5 text-xxs font-semibold text-gray-500">
                  {amenities.schools.map((s, idx) => <li key={idx}>• {s}</li>)}
                </ul>
              </div>

              {/* Nearby Hospitals */}
              <div className="p-5 border border-charcoal/5 shadow-luxury flex flex-col text-left">
                <Landmark className="w-5 h-5 text-primary mb-3" />
                <h4 className="font-bold text-xs uppercase tracking-wider mb-2 border-b pb-1">Hospitals & Clinics</h4>
                <ul className="space-y-1.5 text-xxs font-semibold text-gray-500">
                  {amenities.hospitals.map((h, idx) => <li key={idx}>• {h}</li>)}
                </ul>
              </div>

              {/* Dining & Parks */}
              <div className="p-5 border border-charcoal/5 shadow-luxury flex flex-col text-left">
                <UtensilsCrossed className="w-5 h-5 text-primary mb-3" />
                <h4 className="font-bold text-xs uppercase tracking-wider mb-2 border-b pb-1">Dining & Recreation</h4>
                <ul className="space-y-1.5 text-xxs font-semibold text-gray-500">
                  {amenities.dining.map((d, idx) => <li key={idx}>• {d}</li>)}
                </ul>
              </div>

            </div>
          </div>

          {/* H. Styled Map Placeholder */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal border-b pb-2">Location Map</h3>
            <div className="relative h-64 bg-[#f4f2ee] border border-charcoal/5 shadow-luxury flex flex-col items-center justify-center text-center p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #000 10%, transparent 10%)',
                backgroundSize: '20px 20px'
              }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-base text-charcoal">{property.location}</h4>
                <p className="text-xxs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Located in the prime residential cluster of DHA {property.phase}, Karachi. Close access to main boulevards, public parks, and premium commercial districts.
                </p>
                <div className="pt-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.location}, DHA, Karachi, Pakistan`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-luxury py-2 px-4 text-[10px] tracking-wider uppercase font-bold inline-block"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Agent Widget & Inquiry Form */}
        <div className="space-y-8 sticky top-24">
          
          {/* Agent Information Profile Card */}
          <div className="bg-white border border-charcoal/5 shadow-luxury p-6 text-center">
            {property.agent?.avatar ? (
              <img src={property.agent.avatar} alt={property.agent.name} className="w-20 h-20 rounded-full border border-primary/20 mx-auto mb-4" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-2xl font-bold mx-auto mb-4">
                {property.agent?.name?.charAt(0)}
              </div>
            )}
            <h3 className="font-serif font-bold text-base text-charcoal">{property.agent?.name}</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-4">DHA Certified Senior Consultant</span>

            <div className="grid grid-cols-2 gap-2 text-xxs font-bold uppercase tracking-wider mt-4">
              <a 
                href={`tel:${property.agent?.phone || '+923000000000'}`}
                className="btn-luxury py-2.5 px-2 flex items-center justify-center space-x-1.5 border border-charcoal/10"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Agent</span>
              </a>
              <a 
                href={`https://wa.me/${(property.agent?.phone || '923219876543').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam o Alaikum, I am interested in ${property.title} (${property.location}). Please share transfer details.`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Lead submission form */}
          <div className="glass p-6 shadow-luxury border-none relative">
            <h4 className="font-serif font-bold text-base text-charcoal mb-4 pb-2 border-b border-charcoal/5">
              Submit Direct Inquiry
            </h4>

            {inqSuccess ? (
              <div className="bg-primary/5 border border-primary/25 p-6 text-center space-y-3">
                <h5 className="font-bold font-serif text-primary">Inquiry Sent!</h5>
                <p className="text-xxs text-charcoal-light leading-relaxed font-semibold">
                  Assalam o Alaikum. Your details and WhatsApp callback instructions have been forwarded to {property.agent?.name}.
                </p>
                <button onClick={() => setInqSuccess(false)} className="btn-luxury py-2 text-xxs">New Inquiry</button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    placeholder="Waseem Jamil"
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inqEmail}
                    onChange={(e) => setInqEmail(e.target.value)}
                    placeholder="waseem@gmail.com"
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Contact Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={inqPhone}
                    onChange={(e) => setInqPhone(e.target.value)}
                    placeholder="+92 321 1234567"
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Message Text</label>
                  <textarea
                    rows="3"
                    required
                    value={inqMsg}
                    onChange={(e) => setInqMsg(e.target.value)}
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary-dha py-3 text-xs"
                >
                  Send Property Lead
                </button>
              </form>
            )}
          </div>

          {/* Viewing request form */}
          <div className="glass p-6 shadow-luxury border-none relative mt-6">
            <h4 className="font-serif font-bold text-base text-charcoal mb-4 pb-2 border-b border-charcoal/5">
              Schedule a Viewing
            </h4>

            {viewSuccess ? (
              <div className="bg-primary/5 border border-primary/25 p-6 text-center space-y-3">
                <h5 className="font-bold font-serif text-primary">Viewing Requested!</h5>
                <p className="text-xxs text-charcoal-light leading-relaxed font-semibold">
                  Your viewing request has been sent. The agent will confirm the slot.
                </p>
                <button onClick={() => setViewSuccess(false)} className="btn-luxury py-2 text-xxs">Request Another</button>
              </div>
            ) : (
              <form onSubmit={handleViewingSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={viewTime}
                    onChange={(e) => setViewTime(e.target.value)}
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Notes (Optional)</label>
                  <textarea
                    rows="2"
                    value={viewNotes}
                    onChange={(e) => setViewNotes(e.target.value)}
                    className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs resize-none"
                  />
                </div>

                {viewMsg && <p className="text-xs text-red-600">{viewMsg}</p>}

                <button
                  type="submit"
                  className="w-full btn-primary-dha py-3 text-xs"
                >
                  Request Viewing
                </button>
                {!isAuthenticated && <p className="text-[10px] text-gray-500 text-center">Login required to request a viewing.</p>}
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Similar Listings Slider */}
      {similarProperties.length > 0 && (
        <div className="mt-20 pt-10 border-t border-charcoal/5 space-y-8">
          <h3 className="font-serif font-bold text-2xl text-charcoal text-center md:text-left">Similar Listings in DHA</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((prop) => (
              <div 
                key={prop._id}
                className="bg-white border border-charcoal/5 shadow-luxury flex flex-col hover:shadow-glass transition-all duration-300"
              >
                <div className="relative h-48 bg-charcoal">
                  <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 right-3 bg-charcoal/70 text-white text-[10px] font-bold px-2 py-0.5 font-serif">
                    {prop.price >= 10000000 ? `${(prop.price/10000000).toFixed(2)} Crore` : `${(prop.price/100000).toFixed(2)} Lakh`}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-primary tracking-wider">{prop.phase}</span>
                    <h4 className="font-serif font-bold text-xs text-charcoal leading-snug mt-1 hover:text-primary truncate">
                      <Link to={`/listings/${prop._id}`}>{prop.title}</Link>
                    </h4>
                  </div>
                  <div className="mt-4 pt-2 border-t border-charcoal/5 flex justify-between items-center text-xxs font-semibold uppercase tracking-wider text-gray-400">
                    <span>{prop.area}</span>
                    <Link to={`/listings/${prop._id}`} className="text-primary hover:underline">View details →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
