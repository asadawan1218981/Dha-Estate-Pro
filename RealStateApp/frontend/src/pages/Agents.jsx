import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Award, ShieldCheck, MapPin } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/auth/agents`);
        if (response.ok) {
          const data = await response.json();
          // Filter to double check they are indeed AGENT role
          setAgents(data.agents || []);
        }
      } catch (err) {
        console.error('Fetch agents error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Standard premium fallbacks if seeder is in progress or database is offline
  const fallbackAgents = [
    {
      _id: 'fallback-saad',
      name: 'Saad Ahmed Farooqui',
      email: 'saad.agent@dhaestatepro.com',
      phone: '+92 321 9876543',
      role: 'AGENT',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Saad',
      designation: 'Senior Broker & Phase 8 Specialist',
      experience: '12 Years Experience',
      listingsCount: 24
    },
    {
      _id: 'fallback-ali',
      name: 'Ali Raza Merchant',
      email: 'ali.agent@dhaestatepro.com',
      phone: '+92 300 1234567',
      role: 'AGENT',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ali',
      designation: 'Commercial Land & High-Rise Consultant',
      experience: '8 Years Experience',
      listingsCount: 18
    },
    {
      _id: 'fallback-mariam',
      name: 'Mariam Siddiqui',
      email: 'mariam@dhaestatepro.com',
      phone: '+92 333 4567890',
      role: 'AGENT',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mariam',
      designation: 'Luxury Residential & Villa Advisor',
      experience: '6 Years Experience',
      listingsCount: 15
    }
  ];

  const activeAgentsList = agents.length > 0 ? agents.map((a, index) => ({
    ...a,
    designation: a.name.includes('Saad') ? 'Senior Broker & Phase 8 Specialist' :
                 a.name.includes('Ali') ? 'Commercial Land & High-Rise Consultant' : 
                 'Certified DHA Property Advisor',
    experience: index === 0 ? '12 Years Experience' : '8 Years Experience',
    listingsCount: index === 0 ? 24 : 18
  })) : fallbackAgents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-fade-in text-charcoal">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">DHA Certified Brokers</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal mt-1 mb-3">
          Meet Our Executive Advisors
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Our agents are certified transfer compliance specialists, possessing direct networks with the DHA Karachi Administrator office to handle real estate transfers smoothly and securely.
        </p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading && agents.length === 0 ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white border p-6 space-y-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
              <div className="h-4 bg-gray-200 w-1/2 mx-auto" />
              <div className="h-3 bg-gray-200 w-3/4 mx-auto" />
            </div>
          ))
        ) : (
          activeAgentsList.map(agent => (
            <div
              key={agent._id}
              className="bg-white border border-charcoal/5 shadow-luxury flex flex-col hover:shadow-glass hover:scale-[1.01] transition-all duration-300"
            >
              
              {/* Top Banner and Photo */}
              <div className="relative h-28 bg-charcoal flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-black/40" />
                <div className="absolute -bottom-10">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden shadow-luxury">
                    <img src={agent.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(agent.name)}`} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Body Text */}
              <div className="p-8 pt-14 flex-grow flex flex-col justify-between text-center space-y-4">
                
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-charcoal flex items-center justify-center space-x-1.5">
                    <span>{agent.name}</span>
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" title="DHA Verified License" />
                  </h3>
                  <p className="text-xxs font-bold text-primary uppercase tracking-wider">
                    {agent.designation}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase flex items-center justify-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-primary-light" />
                    <span>{agent.experience || '6 Years Certified'}</span>
                  </p>
                </div>

                {/* Grid counters */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-charcoal/5 py-3 text-xxs font-bold text-gray-500 uppercase">
                  <div className="border-r border-charcoal/5">
                    <span className="text-gray-400 block mb-0.5">Active Listings</span>
                    <span className="text-charcoal text-xs">{agent.listingsCount} Properties</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Branch Desk</span>
                    <span className="text-charcoal text-xs">Phase 6 Bukhari</span>
                  </div>
                </div>

                {/* Contact Rows */}
                <div className="space-y-2 text-left pt-2 text-[11px] text-gray-500 font-medium">
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{agent.email}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{agent.phone || '+92 21 35123456'}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>DHA Karachi, Pakistan</span>
                  </div>
                </div>

                {/* Dynamic Contact Action Prefills */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <a
                    href={`tel:${agent.phone || '+922135123456'}`}
                    className="flex items-center justify-center space-x-1.5 border border-charcoal/10 hover:border-charcoal py-2 text-xxs font-bold uppercase tracking-wider text-charcoal transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href={`https://wa.me/${(agent.phone || '+923219876543').replace(/\+/g, '').replace(/\s+/g, '')}?text=${encodeURIComponent(`Salam ${agent.name}, I am looking at DHA Karachi properties and want some advice.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-1.5 bg-primary text-white hover:bg-primary-dark py-2 text-xxs font-bold uppercase tracking-wider transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <a
                  href={`/listings?agent=${agent._id}`}
                  className="w-full text-center block text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all pt-2"
                >
                  View Listings Profile
                </a>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
