import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildListingsUrl } from '../lib/listingFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, Key, ShieldCheck, Award, Handshake, Users, ChevronLeft, ChevronRight, FileText, Landmark, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';

// Slide properties for high-end luxury feel
const HERO_SLIDES = [
  {
    image: '/images/1613977257363-707ba9348227.jpg',
    title: 'Find Your Dream Property In DHA Karachi',
    subtitle: 'EXPERIENCE ELITE LIVING WITH DHA ESTATE PRO'
  },
  {
    image: '/images/1613490493576-7fde63acd811.jpg',
    title: 'Exclusive Ocean-Front Living',
    subtitle: 'PREMIUM APARTMENTS & PENTHOUSES IN DHA PHASE 8'
  },
  {
    image: '/images/1600596542815-ffad4c1539a9.jpg',
    title: 'Strategic Commercial Ventures',
    subtitle: 'HIGH-YIELD RETAIL & OFFICE LOCATIONS IN PHASE 6'
  }
];

const WHY_CHOOSE_US = [
  {
    icon: ShieldCheck,
    title: 'Vetted Portfolios',
    desc: 'Every luxury villa, plot, and commercial unit listed is thoroughly verified for title deed legitimacy and boundary allocations.'
  },
  {
    icon: Award,
    title: 'DHA Elite Network',
    desc: 'Drawing inspiration from high-end corporate brokerage values, our agents are top-tier certified specialists in Karachi DHA sectors.'
  },
  {
    icon: Handshake,
    title: 'Bespoke Transaction Advisory',
    desc: 'From initial site valuation to physical transfer at the DHA Administrator Office, we represent your interest with absolute privacy.'
  }
];

const TESTIMONIALS = [
  {
    name: 'Tariq Al-Mansoori',
    role: 'Overseas Investor (Dubai)',
    quote: 'The level of professionalism displayed by DHA Estate Pro rivals high-end agencies in Dubai. Their visual showcase and search depth helped me acquire a 1000 Sq. Yd. villa in Phase 8 without leaving my desk.'
  },
  {
    name: 'Dr. Ayesha Alvi',
    role: 'Resident, Phase 6',
    quote: 'Selling our portion in Phase 6 Bukhari was exceptionally smooth. The pricing analytics and qualified lead vetting saved us weeks of redundant agent visits. Highly recommended!'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('BUY'); // BUY or RENT
  
  // Local state for listings, projects, and blogs loaded from MERN backend
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Valuation Form State
  const [valName, setValName] = useState('');
  const [valPhone, setValPhone] = useState('');
  const [valPhase, setValPhase] = useState('Phase 6');
  const [valSize, setValSize] = useState('500 Sq. Yd.');
  const [valType, setValType] = useState('HOUSE');
  const [valSuccess, setValSuccess] = useState(false);

  // Search Filter local overrides
  const [searchType, setSearchType] = useState('');
  const [searchPhase, setSearchPhase] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto sliding hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch backend data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch properties (featured = true)
        const propRes = await fetch(`${API_URL}/properties?isFeatured=true&limit=3`);
        if (propRes.ok) {
          const propData = await propRes.json();
          setFeaturedProperties(propData.properties);
        }

        // Fetch projects
        const projRes = await fetch(`${API_URL}/projects?isFeatured=true`);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData.projects);
        }

        // Fetch blogs
        const blogRes = await fetch(`${API_URL}/blogs?isFeatured=true`);
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          setBlogs(blogData.blogs);
        }
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(buildListingsUrl({
      status: activeTab,
      type: searchType,
      phase: searchPhase,
      query: searchQuery,
    }));
  };

  const handleCategoryNav = (type) => {
    navigate(buildListingsUrl({ status: 'BUY', type }));
  };

  const handleValuationSubmit = async (e) => {
    e.preventDefault();
    if (!valName || !valPhone) return;
    
    // Create an inquiry in the leads database for Admin/Agents to view
    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: featuredProperties[0]?._id || '660000000000000000000001', // fallback id if none seeded
          name: valName,
          email: `${valName.toLowerCase().replace(/\s+/g, '')}@valuation.com`,
          phone: valPhone,
          message: `DHA VALUATION REQUEST: Phase: ${valPhase}, Size: ${valSize}, Type: ${valType}. Please contact for property price estimation.`
        })
      });
      if (response.ok) {
        setValSuccess(true);
        setValName('');
        setValPhone('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen">
      
      {/* 1. FULL-SCREEN HERO SECTION */}
      <section className="relative w-full h-[95vh] flex items-center justify-center overflow-hidden bg-charcoal">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0.3, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.3 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
          >
            {/* Dark Premium Radial Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/20" />
          </motion.div>
        </AnimatePresence>

        {/* Content Wrapper */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-12">
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs tracking-[0.3em] font-bold text-primary mb-4 font-sans uppercase"
          >
            {HERO_SLIDES[currentSlide].subtitle}
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif mb-8 max-w-4xl mx-auto leading-tight"
          >
            {HERO_SLIDES[currentSlide].title}
          </motion.h1>

          {/* Quick CTA row inside Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <button 
              onClick={() => navigate(buildListingsUrl({ status: 'BUY' }))}
              className="btn-primary-dha px-8 py-3.5"
            >
              Buy Property
            </button>
            <button 
              onClick={() => navigate(buildListingsUrl({ status: 'RENT' }))}
              className="btn-luxury px-8 py-3.5 bg-white/10 hover:bg-white text-white border-white/30"
            >
              Rent Property
            </button>
            <Link 
              to="/dashboard/add-property" 
              className="px-8 py-3.5 bg-transparent border border-white/20 hover:border-primary text-xs uppercase tracking-widest font-semibold flex items-center justify-center hover:bg-primary transition-all duration-300"
            >
              List Property
            </Link>
          </motion.div>

          {/* Floating Search overlay directly in hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="w-full max-w-4xl mx-auto glass p-1.5 shadow-luxury"
          >
            {/* Tab header BUY/RENT */}
            <div className="flex border-b border-charcoal/5">
              <button
                onClick={() => setActiveTab('BUY')}
                className={`px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'BUY' ? 'bg-primary text-white' : 'text-charcoal hover:bg-primary/5'}`}
              >
                Buy Properties
              </button>
              <button
                onClick={() => setActiveTab('RENT')}
                className={`px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'RENT' ? 'bg-primary text-white' : 'text-charcoal hover:bg-primary/5'}`}
              >
                Rent Properties
              </button>
            </div>

            {/* Inputs overlay */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 text-charcoal">
              
              {/* Type Select */}
              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold tracking-widest uppercase text-charcoal/60 mb-1 pl-1">Property Type</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs font-semibold"
                >
                  <option value="">All Categories</option>
                  <option value="HOUSE">Houses</option>
                  <option value="APARTMENT">Apartments</option>
                  <option value="PORTION">Portions</option>
                  <option value="PLOT">Residential Plots</option>
                  <option value="OFFICE">Offices</option>
                  <option value="SHOP">Shops</option>
                  <option value="COMMERCIAL">Commercial Lands</option>
                </select>
              </div>

              {/* Phase Select */}
              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold tracking-widest uppercase text-charcoal/60 mb-1 pl-1">DHA Phase</label>
                <select
                  value={searchPhase}
                  onChange={(e) => setSearchPhase(e.target.value)}
                  className="w-full p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs font-semibold"
                >
                  <option value="">All Phases</option>
                  <option value="Phase 1">Phase 1</option>
                  <option value="Phase 2">Phase 2</option>
                  <option value="Phase 2 Extension">Phase 2 Extension</option>
                  <option value="Phase 4">Phase 4</option>
                  <option value="Phase 5">Phase 5</option>
                  <option value="Phase 6">Phase 6</option>
                  <option value="Phase 7">Phase 7</option>
                  <option value="Phase 8">Phase 8</option>
                  <option value="DHA City">DHA City</option>
                </select>
              </div>

              {/* Location Input */}
              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold tracking-widest uppercase text-charcoal/60 mb-1 pl-1">Search Keywords</label>
                <input
                  type="text"
                  placeholder="Khayaban-e-Shahbaz..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs font-semibold placeholder-gray-400"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full btn-primary-dha py-3.5 flex items-center justify-center space-x-2 text-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>

            </form>
          </motion.div>

        </div>
      </section>

      {/* 2. PREMIUM PROPERTY CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Elite Showrooms</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mt-2 mb-12">
            Browse by Property Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Villas & Houses',
                type: 'HOUSE',
                img: '/images/1613977257363-707ba9348227.jpg',
                count: '50+ Units'
              },
              {
                title: 'Executive Apartments',
                type: 'APARTMENT',
                img: '/images/1545324418-cc1a3fa10c00.jpg',
                count: '25+ Units'
              },
              {
                title: 'Residential Plots',
                type: 'PLOT',
                img: '/images/1500382017468-9049fed747ef.jpg',
                count: '15+ Units'
              },
              {
                title: 'Commercial & Retail',
                type: 'COMMERCIAL',
                img: '/images/1486406146926-c627a92ad1ab.jpg',
                count: '15+ Commercials'
              }
            ].map((cat, idx) => (
              <div
                key={cat.title}
                onClick={() => handleCategoryNav(cat.type)}
                className="group relative h-72 overflow-hidden cursor-pointer shadow-luxury border border-charcoal/5"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent transition-all duration-300 group-hover:via-charcoal/40" />
                <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                  <span className="text-xxs font-bold text-primary uppercase tracking-widest">{cat.count}</span>
                  <h3 className="text-lg font-bold font-serif group-hover:text-gold transition-colors mt-0.5">{cat.title}</h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. FEATURED PROPERTIES GRID (Tabani Luxury Style) */}
      <section className="py-20 bg-gray-50 border-t border-b border-charcoal/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Curated Catalog</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mt-2">
                Featured DHA Properties
              </h2>
            </div>
            <Link
              to="/listings"
              className="mt-4 md:mt-0 text-xs font-semibold text-primary hover:text-primary-dark uppercase tracking-widest border-b border-primary hover:border-primary-dark pb-1 transition-all"
            >
              View All Properties
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.length > 0 ? (
              featuredProperties.map((prop) => (
                <div 
                  key={prop._id}
                  className="bg-white border border-charcoal/5 shadow-luxury flex flex-col hover:shadow-glassRed transition-all duration-500"
                >
                  {/* Image Frame */}
                  <div className="relative h-64 overflow-hidden bg-charcoal">
                    <img 
                      src={prop.images[0]} 
                      alt={prop.title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1">
                      For {prop.status === 'BUY' ? 'Sale' : 'Rent'}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-charcoal/70 backdrop-blur-sm text-white text-xxs font-bold px-3 py-1 font-serif">
                      {prop.price >= 10000000 
                        ? `${(prop.price / 10000000).toFixed(2)} Crore`
                        : `${(prop.price / 100000).toFixed(2)} Lakh`
                      } {prop.status === 'RENT' && '/ Month'}
                    </div>
                  </div>

                  {/* Core details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-xxs font-bold text-primary uppercase tracking-widest">{prop.phase}</span>
                      <h3 className="text-base font-bold text-charcoal font-serif mt-1 hover:text-primary transition-colors cursor-pointer truncate">
                        <Link to={`/listings/${prop._id}`}>{prop.title}</Link>
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                        {prop.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-charcoal/5 grid grid-cols-3 gap-2 text-center text-charcoal text-xxs font-semibold">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Area</span>
                        <span>{prop.area}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Beds</span>
                        <span>{prop.beds || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Baths</span>
                        <span>{prop.baths || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-charcoal/5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {prop.agent?.avatar ? (
                          <img src={prop.agent.avatar} alt={prop.agent.name} className="w-8 h-8 rounded-full border border-primary/20" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-xs font-bold">
                            {prop.agent?.name?.charAt(0)}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider">{prop.agent?.name}</span>
                      </div>
                      <Link 
                        to={`/listings/${prop._id}`}
                        className="btn-luxury px-3.5 py-2 !text-[9px]"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Beautiful Glassmorphic Loader skeletons if DB empty/seeding
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-white border border-charcoal/5 p-4 space-y-4 animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="h-4 bg-gray-200 w-1/3" />
                  <div className="h-6 bg-gray-200 w-3/4" />
                  <div className="h-10 bg-gray-200 w-full" />
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 4. FEATURED PROJECTS SECTION (Off-Plan Developments) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Upcoming Masterpieces</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mt-2">
              Luxury Off-Plan Developments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <div 
                  key={proj._id}
                  className="group relative h-96 overflow-hidden shadow-luxury border border-charcoal/5 flex flex-col justify-end"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] group-hover:scale-105"
                    style={{ backgroundImage: `url(${proj.images[0]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex space-x-2">
                    <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1">
                      {proj.status}
                    </span>
                    <span className="bg-gold text-charcoal text-[9px] font-bold uppercase tracking-wider px-3 py-1">
                      Starting {proj.priceStarting}
                    </span>
                  </div>

                  {/* Details Overlay */}
                  <div className="relative z-10 p-8 text-left text-white space-y-3">
                    <span className="text-xxs font-bold text-primary uppercase tracking-widest">{proj.location}</span>
                    <h3 className="text-2xl font-bold font-serif text-white group-hover:text-gold transition-colors">{proj.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{proj.description}</p>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xxs font-semibold uppercase tracking-wider text-gray-400">
                      <span>Area: {proj.areaRange}</span>
                      <Link to="/projects" className="text-primary hover:text-white flex items-center space-x-1 transition-colors">
                        <span>Read More</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-gray-400 py-8">
                No off-plan projects available in database. Run seeder.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. PROPERTY VALUATION SECTION (Tabani Style) */}
      <section className="py-20 bg-charcoal text-white relative">
        {/* Background Accent Lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #C8102E 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Context */}
            <div className="space-y-6">
              <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Scientific Valuation</span>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-white leading-tight">
                Request Professional Property Valuation
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Wondering what your luxury villa, commercial plot, or portion is worth in the current Karachi DHA market? Submit your asset dimensions and contact lines, and our specialist valuation team will conduct a comprehensive comparative market assessment (CMA) based on recent registry transfers.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4 text-left">
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-serif font-bold text-lg text-white">Registry Vetted</h4>
                  <p className="text-xxs text-gray-500 uppercase tracking-widest mt-1">Live transfer tracking</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-serif font-bold text-lg text-white">Direct Advisory</h4>
                  <p className="text-xxs text-gray-500 uppercase tracking-widest mt-1">DHA Administrator compliant</p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="glass p-8 text-charcoal shadow-luxury border-none relative">
              <h3 className="text-xl font-bold font-serif text-charcoal mb-6 text-center border-b border-charcoal/5 pb-4">
                Asset Assessment Request
              </h3>

              {valSuccess ? (
                <div className="bg-primary/5 border border-primary/20 p-6 text-center space-y-4">
                  <h4 className="font-serif font-bold text-lg text-primary">Inquiry Submitted!</h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    Thank you. Your Karachi DHA property details have been recorded. One of our specialist valuation brokers will contact you via phone within 24 hours.
                  </p>
                  <button 
                    onClick={() => setValSuccess(false)}
                    className="btn-luxury py-2"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleValuationSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={valName}
                        onChange={(e) => setValName(e.target.value)}
                        placeholder="Raza Khan" 
                        className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">WhatsApp / Phone</label>
                      <input 
                        type="tel" 
                        required
                        value={valPhone}
                        onChange={(e) => setValPhone(e.target.value)}
                        placeholder="+92 300 1234567" 
                        className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">DHA Phase</label>
                      <select 
                        value={valPhase}
                        onChange={(e) => setValPhase(e.target.value)}
                        className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs font-semibold"
                      >
                        <option value="Phase 1">Phase 1</option>
                        <option value="Phase 2">Phase 2</option>
                        <option value="Phase 4">Phase 4</option>
                        <option value="Phase 5">Phase 5</option>
                        <option value="Phase 6">Phase 6</option>
                        <option value="Phase 7">Phase 7</option>
                        <option value="Phase 8">Phase 8</option>
                        <option value="DHA City">DHA City</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Asset Size</label>
                      <select 
                        value={valSize}
                        onChange={(e) => setValSize(e.target.value)}
                        className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs font-semibold"
                      >
                        <option value="120 Sq. Yd.">120 Sq. Yd.</option>
                        <option value="240 Sq. Yd.">240 Sq. Yd.</option>
                        <option value="500 Sq. Yd.">500 Sq. Yd.</option>
                        <option value="1000 Sq. Yd.">1000 Sq. Yd.</option>
                        <option value="2000 Sq. Yd.">2000 Sq. Yd.</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Asset Type</label>
                      <select 
                        value={valType}
                        onChange={(e) => setValType(e.target.value)}
                        className="p-2.5 bg-white border border-charcoal/10 focus:outline-none text-xs font-semibold"
                      >
                        <option value="HOUSE">House/Villa</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="PORTION">Portion</option>
                        <option value="PLOT">Plot</option>
                        <option value="COMMERCIAL">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full btn-primary-dha py-3.5 mt-2"
                  >
                    Request Valuation
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 6. STATISTICS & COUNTERS (Why Choose Us) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Our Standards</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mt-2 mb-16">
            Why DHA Estate Pro
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {WHY_CHOOSE_US.map((item, idx) => (
              <div key={idx} className="p-8 border border-charcoal/5 shadow-luxury hover:shadow-glass hover:border-primary/20 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-primary/5 rounded-none flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-lg text-charcoal mb-3">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Animated Statistics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-t border-b border-charcoal/5 text-charcoal">
            {[
              { val: '100+', label: 'Karachi DHA Properties' },
              { val: '25+', label: 'Luxury Off-Plan Penthouses' },
              { val: '3', label: 'Expert Certified Agents' },
              { val: '100%', label: 'Registry Compliance' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <span className="block text-3xl md:text-4xl font-bold text-primary font-serif mb-1">{stat.val}</span>
                <span className="text-xxs uppercase tracking-widest text-gray-400 font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIAL CAROUSEL */}
      <section className="py-20 bg-gray-50 border-b border-charcoal/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Vetted Feedback</span>
          <h2 className="text-3xl font-bold font-serif text-charcoal mt-2 mb-10">Client Testimonials</h2>
          
          <div className="relative p-8 bg-white border border-charcoal/5 shadow-luxury">
            <p className="text-sm italic text-gray-600 leading-relaxed font-serif">
              "{TESTIMONIALS[activeTestimonial].quote}"
            </p>
            <div className="mt-6">
              <h4 className="font-bold text-charcoal text-xs uppercase tracking-wider">{TESTIMONIALS[activeTestimonial].name}</h4>
              <p className="text-xxs text-primary font-semibold uppercase tracking-widest mt-1">{TESTIMONIALS[activeTestimonial].role}</p>
            </div>
            
            {/* Arrows */}
            <div className="flex justify-center space-x-3 mt-8">
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                className="w-8 h-8 border border-charcoal/10 rounded-none flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)}
                className="w-8 h-8 border border-charcoal/10 rounded-none flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LATEST NEWS & BLOGS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Market Intelligence</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mt-2 mb-12">
            Karachi Real Estate News & Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <div 
                  key={blog._id}
                  className="group bg-white border border-charcoal/5 shadow-luxury flex flex-col hover:shadow-glass transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 bg-charcoal text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-charcoal hover:text-primary transition-colors leading-snug line-clamp-2">
                        <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-3 mt-3 leading-relaxed">
                        {blog.content}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-charcoal/5 flex items-center justify-between text-xxs font-semibold uppercase tracking-wider">
                      <span className="text-gray-400">By {blog.authorName}</span>
                      <Link to={`/blogs/${blog.slug}`} className="text-primary hover:text-primary-dark">
                        Read Article →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-xs text-gray-400">
                No blog articles loaded in database. Seeder ready.
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
