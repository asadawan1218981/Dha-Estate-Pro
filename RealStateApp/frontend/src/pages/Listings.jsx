import { Suspense, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFilterStore } from '../store/filterStore';
import { useAuthStore } from '../store/authStore';
import {
  buildListingsUrl,
  getListingFilters,
  getListingPage,
  getPropertyTypeOptions,
  isPropertyTypeAvailableForStatus,
} from '../lib/listingFilters';
import { Search, MapPin, Grid, List, Map, Heart, Phone, MessageSquare, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <Listings />
    </Suspense>
  );
}

function Listings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const { setFilters, viewMode, setViewMode } = useFilterStore();
  const { user, isAuthenticated, toggleFavorite } = useAuthStore();
  const filters = useMemo(
    () => getListingFilters(new URLSearchParams(searchKey)),
    [searchKey]
  );
  const currentPage = useMemo(
    () => getListingPage(new URLSearchParams(searchKey)),
    [searchKey]
  );
  
  const [properties, setProperties] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  
  // Mobile filter sidebar toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Keep the existing store in sync while the URL remains the listing source of truth.
  useEffect(() => {
    setFilters(filters);
  }, [filters, setFilters]);

  // Fetch properties from Express backend based on the current URL filters.
  useEffect(() => {
    const controller = new AbortController();
    // Guard against a stalled backend (e.g. cold Atlas connection): never let
    // the skeleton loader spin forever. A timeout surfaces the error panel
    // with a retry button instead of hanging the UI.
    const REQUEST_TIMEOUT_MS = 25000;
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    const fetchListings = async () => {
      setIsLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.phase) queryParams.append('phase', filters.phase);
        if (filters.beds) queryParams.append('beds', filters.beds);
        if (filters.baths) queryParams.append('baths', filters.baths);
        if (filters.possessionStatus) queryParams.append('possessionStatus', filters.possessionStatus);
        if (filters.furnished) queryParams.append('furnished', filters.furnished);
        if (filters.priceMin) queryParams.append('priceMin', filters.priceMin);
        if (filters.priceMax) queryParams.append('priceMax', filters.priceMax);
        if (filters.query) queryParams.append('query', filters.query);
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', '9');

        const response = await fetch(
          `${API_URL}/properties?${queryParams.toString()}`,
          { signal: controller.signal }
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || 'The property service could not load listings.');
        }

        if (!data || !Array.isArray(data.properties)) {
          throw new Error('The property service returned an invalid listing response.');
        }

        if (!controller.signal.aborted) {
          setProperties(data.properties);
          setTotalPages(Math.max(Number(data.totalPages) || 1, 1));
          setTotalCount(Number(data.totalCount) || 0);
        }
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          // A timeout abort belongs to this (latest) request, so show the
          // error panel. A navigation abort is superseded by a newer request
          // which manages the loading state itself, so stay silent for it.
          if (didTimeout) {
            console.error('Fetch listings timed out:', err);
            setProperties([]);
            setTotalPages(1);
            setTotalCount(0);
            setError('The property service is taking too long to respond. Please try again.');
          }
        } else if (!controller.signal.aborted) {
          console.error('Fetch listings err:', err);
          setProperties([]);
          setTotalPages(1);
          setTotalCount(0);
          setError(
            err.message === 'Failed to fetch'
              ? 'Unable to reach the property service. Please try again shortly.'
              : err.message || 'Unable to load properties right now.'
          );
        }
      } finally {
        clearTimeout(timeoutId);
        // On a timeout this request is still the latest one, so it must clear
        // the loading state. On a navigation abort a newer request owns it.
        if (!controller.signal.aborted || didTimeout) {
          setIsLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters, currentPage, reloadKey]);

  const updateListingFilters = (nextFilters, page = 1) => {
    navigate(buildListingsUrl(nextFilters, page), { replace: true });
  };

  const handleFilterChange = (name, value) => {
    const nextFilters = { ...filters, [name]: value };

    if (
      name === 'status' &&
      !isPropertyTypeAvailableForStatus(nextFilters.type, value)
    ) {
      nextFilters.type = '';
    }

    updateListingFilters(nextFilters);
  };

  const handleResetFilters = () => {
    updateListingFilters({ status: filters.status });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateListingFilters(filters, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveToggle = async (e, propId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please Sign In or Register to add properties to your favorites catalog!');
      return;
    }
    await toggleFavorite(propId);
  };

  const isSaved = (propId) => {
    return user?.savedProperties?.includes(propId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in">
      
      {/* Search Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-charcoal/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xxs tracking-[0.2em] font-bold text-primary uppercase">Active Searches</span>
          <h1 className="text-3xl font-bold font-serif text-charcoal mt-1">
            Karachi DHA Properties For {filters.status === 'RENT' ? 'Rent' : 'Sale'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Found {totalCount} matching DHA listings</p>
        </div>

        {/* View Mode and Toggles */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center space-x-2 border border-charcoal/10 px-4 py-2.5 text-xs font-semibold uppercase hover:bg-primary hover:text-white transition-all text-charcoal bg-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex bg-gray-100 p-1 border border-charcoal/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow-luxury text-primary' : 'text-gray-400 hover:text-charcoal'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-luxury text-primary' : 'text-gray-400 hover:text-charcoal'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 transition-all ${viewMode === 'map' ? 'bg-white shadow-luxury text-primary' : 'text-gray-400 hover:text-charcoal'}`}
              title="Map View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Listing Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* ========================================================
            Sidebar Filters: Desktop (hidden lg:block) & Mobile Drawer
           ======================================================== */}
        <aside className={`lg:block ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto page-fade-in' : 'hidden'} lg:static`}>
          {showMobileFilters && (
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="font-serif font-bold text-lg">Filters</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="text-xs font-bold uppercase tracking-wider text-primary border border-primary/20 px-3 py-1"
              >
                Close
              </button>
            </div>
          )}

          <div className="space-y-6 text-charcoal">
            
            {/* Search filter title */}
            <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Search Options</h3>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-primary hover:text-primary-dark uppercase flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Query */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Khayaban, Emaar, street..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="w-full bg-gray-50 border border-charcoal/10 px-3 py-2 text-xs focus:outline-none focus:border-primary/50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Buy / Rent selector */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Listing Status</label>
              <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 border border-charcoal/5">
                <button
                  onClick={() => handleFilterChange('status', 'BUY')}
                  className={`py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${filters.status === 'BUY' ? 'bg-primary text-white' : 'text-gray-400 hover:text-charcoal'}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'RENT')}
                  className={`py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${filters.status === 'RENT' ? 'bg-primary text-white' : 'text-gray-400 hover:text-charcoal'}`}
                >
                  Rent
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Property Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-gray-50 border border-charcoal/10 p-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">All Categories</option>
                {getPropertyTypeOptions(filters.status).map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* DHA Phase Selector */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">DHA Phase</label>
              <select
                value={filters.phase}
                onChange={(e) => handleFilterChange('phase', e.target.value)}
                className="w-full bg-gray-50 border border-charcoal/10 p-2.5 text-xs font-semibold focus:outline-none"
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

            {/* Price Sliders */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Price Limits (PKR)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="bg-gray-50 border border-charcoal/10 p-2 text-xs focus:outline-none placeholder-gray-400"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="bg-gray-50 border border-charcoal/10 p-2 text-xs focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Beds & Baths */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Beds</label>
                <select
                  value={filters.beds}
                  onChange={(e) => handleFilterChange('beds', e.target.value)}
                  className="bg-gray-50 border border-charcoal/10 p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bed</option>
                  <option value="2">2 Beds</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4 Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Baths</label>
                <select
                  value={filters.baths}
                  onChange={(e) => handleFilterChange('baths', e.target.value)}
                  className="bg-gray-50 border border-charcoal/10 p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bath</option>
                  <option value="2">2 Baths</option>
                  <option value="3">3 Baths</option>
                  <option value="4">4 Baths</option>
                  <option value="5">5+ Baths</option>
                </select>
              </div>
            </div>

            {/* Furnished Status */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Furnished Status</label>
              <select
                value={filters.furnished}
                onChange={(e) => handleFilterChange('furnished', e.target.value)}
                className="w-full bg-gray-50 border border-charcoal/10 p-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">Any Status</option>
                <option value="Furnished">Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
              </select>
            </div>

            {/* Possession Status */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Possession Status</label>
              <select
                value={filters.possessionStatus}
                onChange={(e) => handleFilterChange('possessionStatus', e.target.value)}
                className="w-full bg-gray-50 border border-charcoal/10 p-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">Any Status</option>
                <option value="Ready">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Off-Plan">Off-Plan</option>
              </select>
            </div>

            {showMobileFilters && (
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full btn-primary-dha py-3 mt-4"
              >
                Apply Filters
              </button>
            )}

          </div>
        </aside>

        {/* ========================================================
            Listings Content Panel
           ======================================================== */}
        <section className="lg:col-span-3">
          {isLoading ? (
            // Skeleton Loader list
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white border border-charcoal/5 p-4 space-y-4 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="h-4 bg-gray-200 w-1/3" />
                  <div className="h-6 bg-gray-200 w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 border border-charcoal/5 shadow-luxury">
              <RotateCcw className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-serif font-bold text-lg text-charcoal">Unable to Load Properties</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">{error}</p>
              <button
                onClick={() => setReloadKey((value) => value + 1)}
                className="btn-luxury py-2.5 px-6 mt-6"
              >
                Try Again
              </button>
            </div>
          ) : properties.length === 0 ? (
            // No Listings Found
            <div className="text-center py-20 bg-gray-50 border border-charcoal/5 shadow-luxury">
              <RotateCcw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
              <h3 className="font-serif font-bold text-lg text-charcoal">No Properties Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                We couldn't find any listings in DHA matching your specified filters. Try adjusting your price ranges, bedding count, or keyword query to broaden the results.
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-luxury py-2.5 px-6 mt-6"
              >
                Reset Search Filters
              </button>
            </div>
          ) : viewMode === 'map' ? (
            // ==========================================
            // High-fidelity Map View Overlay
            // ==========================================
            <div className="w-full h-[60vh] bg-gray-100 border border-charcoal/5 shadow-luxury relative overflow-hidden flex flex-col justify-end">
              <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center" 
                style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/67.06,24.81,12,0/800x600?access_token=mock')`, backgroundRepeat: 'no-repeat' }}
              />
              {/* Dynamic Mock Leaflet Grid Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#C8102E_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10" />
              
              {/* Map Property Marker Info cards */}
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="glass p-4 max-w-sm pointer-events-auto border-t-2 border-primary shadow-luxury space-y-2">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{properties[0]?.phase}</span>
                  <h4 className="font-serif font-bold text-sm text-charcoal">{properties[0]?.title}</h4>
                  <p className="text-xxs text-gray-500 font-semibold">{properties[0]?.location}</p>
                  <div className="flex justify-between items-center text-xxs font-bold pt-2 border-t border-charcoal/5">
                    <span className="text-primary">{properties[0]?.price >= 10000000 ? `${(properties[0]?.price/10000000).toFixed(2)} Crore` : `${(properties[0]?.price/100000).toFixed(2)} Lakh`}</span>
                    <Link to={`/listings/${properties[0]?._id}`} className="text-primary font-serif italic hover:underline">View details →</Link>
                  </div>
                </div>
              </div>

              {/* Banner Details */}
              <div className="relative z-10 glass p-4 text-center border-t border-charcoal/10">
                <p className="text-xxs uppercase tracking-widest text-charcoal-light font-bold">
                  Interactive Leaflet map showing property boundary markers across Karachi DHA Phases.
                </p>
              </div>
            </div>
          ) : (
            // ==========================================
            // Grid and List View Rendering
            // ==========================================
            <div className="space-y-8">
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'flex flex-col space-y-6'
              }>
                {properties.map((prop) => (
                  <div
                    key={prop._id}
                    className={`bg-white border border-charcoal/5 shadow-luxury flex transition-all duration-500 hover:shadow-glassRed ${viewMode === 'grid' ? 'flex-col' : 'flex-col md:flex-row h-auto md:h-64'}`}
                  >
                    {/* Image Frame */}
                    <div className={`relative overflow-hidden bg-charcoal shrink-0 ${viewMode === 'grid' ? 'h-52 w-full' : 'h-52 md:h-full w-full md:w-80'}`}>
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-primary text-white text-[8px] font-bold tracking-widest uppercase px-2.5 py-0.5">
                        For {prop.status === 'BUY' ? 'Sale' : 'Rent'}
                      </div>
                      <button
                        onClick={(e) => handleSaveToggle(e, prop._id)}
                        className="absolute top-3 right-3 bg-white p-2 text-charcoal hover:text-primary transition-colors hover:shadow-luxury rounded-none"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved(prop._id) ? 'fill-primary text-primary' : ''}`} />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-charcoal/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 font-serif">
                        {prop.price >= 10000000
                          ? `${(prop.price / 10000000).toFixed(2)} Crore`
                          : `${(prop.price / 100000).toFixed(2)} Lakh`
                        } {prop.status === 'RENT' && '/ Month'}
                      </div>
                    </div>

                    {/* Card Content Description */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-primary mb-1">
                          <span>{prop.phase}</span>
                          <span className="bg-gray-100 text-charcoal px-2 py-0.5 font-semibold text-[8px]">{prop.type}</span>
                        </div>
                        <h3 className="text-sm font-bold font-serif text-charcoal leading-snug hover:text-primary transition-colors cursor-pointer truncate">
                          <Link to={`/listings/${prop._id}`}>{prop.title}</Link>
                        </h3>
                        <div className="flex items-center space-x-1 text-xxs text-gray-400 mt-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{prop.location}</span>
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-charcoal/5 py-2.5 my-3.5 text-center text-[10px] font-bold text-charcoal-light">
                        <div>
                          <span className="text-gray-400 block text-[8px] uppercase tracking-wider mb-0.5">Area</span>
                          <span>{prop.area}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[8px] uppercase tracking-wider mb-0.5">Beds</span>
                          <span>{prop.beds || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[8px] uppercase tracking-wider mb-0.5">Baths</span>
                          <span>{prop.baths || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Bottom Agent Row & CTAs */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {prop.agent?.avatar ? (
                            <img src={prop.agent.avatar} alt={prop.agent.name} className="w-7 h-7 rounded-full border border-primary/20" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-[10px] font-bold">
                              {prop.agent?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] font-bold text-charcoal block uppercase leading-none">{prop.agent?.name}</span>
                            <span className="text-[8px] text-gray-400 block uppercase tracking-wider mt-0.5">DHA Advisor</span>
                          </div>
                        </div>

                        {/* WhatsApp & Call Action Row (Fatani Style) */}
                        <div className="flex space-x-1.5 shrink-0">
                          {/* Call Button */}
                          <a
                            href={`tel:${prop.agent?.phone || '+92300000000'}`}
                            className="p-2 border border-charcoal/10 text-charcoal hover:bg-primary hover:text-white transition-all duration-300 rounded-none shadow-sm"
                            title="Call Agent"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          {/* WhatsApp Button (Fatani prefilled text) */}
                          <a
                            href={`https://wa.me/${(prop.agent?.phone || '923219876543').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam o Alaikum, I am interested in your property DHA Estate Pro - ID: ${prop._id} (${prop.title}). Please share the booking details and registry documents. JazakAllah.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-green-500/20 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white transition-all duration-300 rounded-none shadow-sm"
                            title="WhatsApp Agent"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* ==========================================
                  Standard MERN Pagination
                 ========================================== */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-6 border-t border-charcoal/5 text-xs font-bold">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 border border-charcoal/10 text-charcoal hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`px-4 py-2.5 border transition-all ${currentPage === idx + 1 ? 'bg-primary text-white border-primary' : 'border-charcoal/10 text-charcoal hover:border-charcoal'}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 border border-charcoal/10 text-charcoal hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}

function ListingsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in">
      <div className="h-20 bg-gray-100 border border-charcoal/5 animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block h-[680px] bg-gray-100 border border-charcoal/5 animate-pulse" />
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 bg-gray-100 border border-charcoal/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
