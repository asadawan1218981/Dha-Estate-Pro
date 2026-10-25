import { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ShieldAlert } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !msg) return;

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: '660000000000000000000001', // generic placeholder
          name,
          email,
          phone,
          message: `GENERAL INQUIRY: ${msg}`
        })
      });
      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMsg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-fade-in text-charcoal">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Corporate Hub</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal mt-1 mb-3">
          Get In Touch
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Contact our DHA Karachi brokerage desk directly. Whether you are listing a 1000 Sq. Yd. home, verifying title logs, or scheduling a site survey, our advisors are here to guide you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Columns - Corporate contact information & Offices */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Grid layout of offices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Head office */}
            <div className="p-6 border border-charcoal/5 shadow-luxury flex flex-col text-left space-y-3 bg-white">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-bold text-base text-charcoal">Bukhari Head Office</h3>
              <p className="text-xxs font-semibold text-gray-400 uppercase tracking-wider">Phase 6 Commercial</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Plot 42-C, Main Bukhari Commercial Area, Phase 6, DHA Karachi, Pakistan
              </p>
              <div className="pt-2 border-t border-charcoal/5 text-xxs font-bold text-primary">
                Phone: +92 21 35123456
              </div>
            </div>

            {/* Abdul Sattar Edhi Office */}
            <div className="p-6 border border-charcoal/5 shadow-luxury flex flex-col text-left space-y-3 bg-white">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-bold text-base text-charcoal">Phase 8 Branch</h3>
              <p className="text-xxs font-semibold text-gray-400 uppercase tracking-wider">A.S. Edhi Avenue</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Building 12, Abdul Sattar Edhi Avenue, Phase 8, DHA Karachi, Pakistan
              </p>
              <div className="pt-2 border-t border-charcoal/5 text-xxs font-bold text-primary">
                Phone: +92 21 35987654
              </div>
            </div>

          </div>

          {/* Quick FAQ summary */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal border-b pb-2">Direct Contact Channels</h3>
            
            <div className="space-y-3 text-xs text-gray-600 pl-2 border-l-2 border-primary/20">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span><strong className="text-charcoal">General Inquiries:</strong> info@dhaestatepro.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span><strong className="text-charcoal">Valuations Desk:</strong> +92 321 9876543 (WhatsApp enabled)</span>
              </div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                <span><strong className="text-charcoal">Office Hours:</strong> Mon - Sat: 9:00 AM - 6:00 PM PST</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Callback request form */}
        <aside className="glass p-6 shadow-luxury border-none">
          <h3 className="font-serif font-bold text-lg text-charcoal mb-4 pb-2 border-b border-charcoal/5">
            Submit Corporate Message
          </h3>

          {success ? (
            <div className="bg-primary/5 border border-primary/20 p-6 text-center space-y-3">
              <h4 className="font-bold font-serif text-primary">Message Dispatched!</h4>
              <p className="text-xxs text-charcoal-light leading-relaxed font-semibold">
                Thank you. Your message has been logged under general leads. A corporate coordinator will email/phone you shortly.
              </p>
              <button onClick={() => setSuccess(false)} className="btn-luxury py-2 text-xxs">New Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-charcoal">
              
              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daniyal Ahmed"
                  className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="daniyal@gmail.com"
                  className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">WhatsApp Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 9876543"
                  className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Message Body</label>
                <textarea
                  rows="4"
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write your general question or callback request details..."
                  className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary-dha py-3.5 text-xs flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Form</span>
              </button>

            </form>
          )}

        </aside>

      </div>

    </div>
  );
}
