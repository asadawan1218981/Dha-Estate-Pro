import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { buildListingsUrl } from '../lib/listingFilters';
import { Menu, X, User as UserIcon, LogOut, Heart, PlusSquare, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleDropdownClick = (status, type) => {
    navigate(buildListingsUrl({ status, type }));
  };

  const navToBuyOrRent = (status) => {
    navigate(buildListingsUrl({ status }));
  };

  const buyCategories = [
    { label: 'Houses', type: 'HOUSE' },
    { label: 'Apartments', type: 'APARTMENT' },
    { label: 'Portions', type: 'PORTION' },
    { label: 'Plots', type: 'PLOT' },
    { label: 'Commercial', type: 'COMMERCIAL' }
  ];

  const rentCategories = [
    { label: 'Houses', type: 'HOUSE' },
    { label: 'Apartments', type: 'APARTMENT' },
    { label: 'Portions', type: 'PORTION' },
    { label: 'Offices', type: 'OFFICE' },
    { label: 'Shops', type: 'SHOP' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-luxury py-4">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Elegant Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={() => navigate('/')}>
            <span className="text-xl font-bold tracking-widest text-charcoal flex items-center">
              DHA<span className="text-primary ml-1.5 font-serif font-semibold italic">ESTATE PRO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-charcoal">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            
            {/* Buy Dropdown */}
            <div className="relative group py-2">
              <button 
                onClick={() => navToBuyOrRent('BUY')}
                className="flex items-center space-x-1 hover:text-primary transition-colors focus:outline-none"
              >
                <span>Buy</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-charcoal/5 shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1">
                  {buyCategories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleDropdownClick('BUY', cat.type)}
                      className="block w-full text-left px-4 py-2.5 text-xxs font-semibold uppercase hover:bg-primary/5 hover:text-primary transition-colors text-charcoal-light"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rent Dropdown */}
            <div className="relative group py-2">
              <button 
                onClick={() => navToBuyOrRent('RENT')}
                className="flex items-center space-x-1 hover:text-primary transition-colors focus:outline-none"
              >
                <span>Rent</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-charcoal/5 shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1">
                  {rentCategories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleDropdownClick('RENT', cat.type)}
                      className="block w-full text-left px-4 py-2.5 text-xxs font-semibold uppercase hover:bg-primary/5 hover:text-primary transition-colors text-charcoal-light"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
            <Link to="/agents" className="hover:text-primary transition-colors">Agents</Link>
            <Link to="/blogs" className="hover:text-primary transition-colors">Blogs</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Desktop Right Side Action Widget */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-xs font-semibold text-charcoal hover:text-primary focus:outline-none">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-primary/20" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-sm">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Dashboard Options */}
                <div className="absolute right-0 mt-2 w-52 bg-white border border-charcoal/5 shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-1 text-xs uppercase tracking-wider font-semibold">
                    <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-charcoal-light">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/viewings" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-charcoal-light">
                      <span>Viewings</span>
                    </Link>
                    <Link to="/payments" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-charcoal-light">
                      <span>Payments</span>
                    </Link>
                    <Link to="/dashboard?tab=favorites" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-charcoal-light">
                      <Heart className="w-4 h-4 text-primary" />
                      <span>Favorites</span>
                    </Link>
                    {(user?.role === 'AGENT' || user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                      <Link to="/dashboard/add-property" className="flex items-center space-x-2 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-charcoal-light">
                        <PlusSquare className="w-4 h-4 text-primary" />
                        <span>Add Property</span>
                      </Link>
                    )}
                    <button 
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-left text-charcoal-light border-t border-charcoal/5"
                    >
                      <LogOut className="w-4 h-4 text-primary" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="btn-luxury px-5 py-2.5"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-charcoal hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-charcoal/5 py-4 px-4 space-y-3 shadow-luxury page-fade-in uppercase tracking-wider text-xs font-semibold">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-charcoal hover:text-primary">Home</Link>
          
          {/* Mobile Buy */}
          <div className="space-y-1">
            <span className="block text-xxs font-bold text-charcoal-light/50 tracking-widest pt-2">BUY CATEGORIES</span>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {buyCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    handleDropdownClick('BUY', cat.type);
                    setIsOpen(false);
                  }}
                  className="text-left py-1 text-charcoal hover:text-primary text-xxs font-semibold"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Rent */}
          <div className="space-y-1">
            <span className="block text-xxs font-bold text-charcoal-light/50 tracking-widest pt-2">RENT CATEGORIES</span>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {rentCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    handleDropdownClick('RENT', cat.type);
                    setIsOpen(false);
                  }}
                  className="text-left py-1 text-charcoal hover:text-primary text-xxs font-semibold"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <Link to="/projects" onClick={() => setIsOpen(false)} className="block py-2 text-charcoal hover:text-primary">Projects</Link>
          <Link to="/agents" onClick={() => setIsOpen(false)} className="block py-2 text-charcoal hover:text-primary">Agents</Link>
          <Link to="/blogs" onClick={() => setIsOpen(false)} className="block py-2 text-charcoal hover:text-primary">Blogs</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 text-charcoal hover:text-primary pb-2 border-b border-charcoal/5">Contact</Link>
          
          <div className="pt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 py-2 text-charcoal hover:text-primary">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>My Dashboard</span>
                </Link>
                <Link to="/viewings" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 py-2 text-charcoal hover:text-primary">
                  <span>Viewings</span>
                </Link>
                <Link to="/payments" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 py-2 text-charcoal hover:text-primary">
                  <span>Payments</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left py-2 text-primary hover:text-primary-dark"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="btn-luxury block text-center py-3 w-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
