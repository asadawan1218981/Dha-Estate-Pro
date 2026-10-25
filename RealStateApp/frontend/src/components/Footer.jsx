import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { buildListingsUrl } from '../lib/listingFilters';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const handleQuickLink = (status, type) => {
    navigate(buildListingsUrl({ status, type }));
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white pt-16 pb-8 border-t-2 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <span className="text-xl font-bold tracking-widest text-white flex items-center">
              DHA<span className="text-primary ml-1.5 font-serif font-semibold italic">ESTATE PRO</span>
            </span>
            <p className="text-gray-400 text-xs leading-relaxed">
              DHA Estate Pro is Karachi's ultra-premium digital real estate platform, specialized in luxury villas, residential plots, commercial units, and corporate rentals in DHA Phase 1-8 and DHA City.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-primary mb-6 relative after:content-[''] after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              Quick Links
            </h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li>
                <button onClick={() => handleQuickLink('BUY', 'HOUSE')} className="hover:text-primary transition-colors text-left focus:outline-none">
                  Buy Luxury Houses
                </button>
              </li>
              <li>
                <button onClick={() => handleQuickLink('BUY', 'PLOT')} className="hover:text-primary transition-colors text-left focus:outline-none">
                  Residential Plots for Sale
                </button>
              </li>
              <li>
                <button onClick={() => handleQuickLink('RENT', 'APARTMENT')} className="hover:text-primary transition-colors text-left focus:outline-none">
                  Apartments for Rent
                </button>
              </li>
              <li>
                <Link to="/projects" className="hover:text-primary transition-colors">
                  Off-Plan Projects
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-primary transition-colors">
                  DHA Market Insights
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Office Addresses (Fatani-style) */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-primary mb-6 relative after:content-[''] after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              Our Offices
            </h3>
            <div className="space-y-4 text-xs text-gray-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Head Office:</h4>
                  <p>Plot 42-C, Main Bukhari Commercial Area, Phase 6, DHA Karachi, Pakistan</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Corporate Branch:</h4>
                  <p>Building 12, Abdul Sattar Edhi Avenue, Phase 8, DHA Karachi, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-primary mb-6 relative after:content-[''] after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              Newsletter
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Subscribe to stay updated with monthly pricing changes, legal notifications, and off-plan launches in DHA Karachi.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs focus:outline-none focus:border-primary/50 text-white placeholder-gray-500 rounded-none transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 bg-primary px-3 hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer Sub-bottom */}
        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xxs text-gray-500 font-semibold uppercase tracking-wider">
          <p>© {currentYear} DHA ESTATE PRO. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
