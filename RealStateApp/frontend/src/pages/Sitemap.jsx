import { Link } from 'react-router-dom';

const GROUPS = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', to: '/' },
      { label: 'All Listings', to: '/listings' },
      { label: 'Off-Plan Projects', to: '/projects' },
      { label: 'Agents', to: '/agents' },
      { label: 'Blogs & Market Insights', to: '/blogs' },
      { label: 'Contact Support', to: '/contact' },
      { label: 'Sign In / Register', to: '/auth' }
    ]
  },
  {
    title: 'Buy In DHA Karachi',
    links: [
      { label: 'Houses for Sale', to: '/listings?status=BUY&type=HOUSE' },
      { label: 'Apartments for Sale', to: '/listings?status=BUY&type=APARTMENT' },
      { label: 'Portions for Sale', to: '/listings?status=BUY&type=PORTION' },
      { label: 'Residential Plots for Sale', to: '/listings?status=BUY&type=PLOT' },
      { label: 'Commercial for Sale', to: '/listings?status=BUY&type=COMMERCIAL' }
    ]
  },
  {
    title: 'Rent In DHA Karachi',
    links: [
      { label: 'Houses for Rent', to: '/listings?status=RENT&type=HOUSE' },
      { label: 'Apartments for Rent', to: '/listings?status=RENT&type=APARTMENT' },
      { label: 'Portions for Rent', to: '/listings?status=RENT&type=PORTION' },
      { label: 'Offices for Rent', to: '/listings?status=RENT&type=OFFICE' },
      { label: 'Shops for Rent', to: '/listings?status=RENT&type=SHOP' }
    ]
  },
  {
    title: 'Your Account',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Saved Favorites', to: '/dashboard?tab=favorites' },
      { label: 'My Viewings', to: '/viewings' },
      { label: 'My Payments', to: '/payments' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Sitemap', to: '/sitemap' }
    ]
  }
];

export default function Sitemap() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in text-charcoal">
      <span className="text-xxs tracking-[0.2em] font-bold text-primary uppercase">Browse</span>
      <h1 className="text-3xl font-bold font-serif text-charcoal mt-1 mb-2">Sitemap</h1>
      <p className="text-xs text-gray-400 mb-8">
        Every main section of DHA Estate Pro in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GROUPS.map((group) => (
          <div key={group.title} className="bg-white border border-charcoal/5 shadow-luxury p-6">
            <h2 className="text-xs font-bold tracking-widest uppercase text-primary mb-4 relative after:content-[''] after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              {group.title}
            </h2>
            <ul className="space-y-2.5 text-xs text-charcoal-light">
              {group.links.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
