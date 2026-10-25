import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Acceptance Of These Terms',
    body: 'By accessing or using DHA Estate Pro, you agree to these Terms of Service. If you do not agree, please do not use the platform.'
  },
  {
    title: '2. What This Platform Is',
    body: 'DHA Estate Pro is a listing and inquiry platform that connects buyers, renters, property owners, and agents in DHA Karachi. We are not a party to any sale, purchase, or rental agreement made between users, and we do not act as a broker for any specific transaction unless separately agreed in writing.'
  },
  {
    title: '3. Listing Accuracy',
    body: 'Property details, prices, sizes, and availability are provided by agents and owners. While listings pass through an admin verification step before becoming public, details can change at any time. Always verify price, ownership documents, and possession status independently — including with the DHA authorities — before making any payment or commitment.'
  },
  {
    title: '4. Your Account',
    body: 'You are responsible for keeping your login credentials private and for all activity under your account. You must provide accurate information when registering and when submitting inquiries or viewing requests. Accounts used for fraud, spam, or misleading listings may be suspended or removed.'
  },
  {
    title: '5. Agents And Owners',
    body: 'Agents and owners are responsible for the accuracy of their own listings and for responding to inquiries and viewing requests honestly. A listing that is found to be false, duplicated, or misleading may be rejected or removed by an administrator.'
  },
  {
    title: '6. Inquiries, Viewings And Payments',
    body: 'Submitting an inquiry or requesting a viewing does not reserve a property and does not create a booking. Any payment or advance discussed with an agent or owner is strictly between you and that party; confirm all payment terms in writing before paying anything.'
  },
  {
    title: '7. Acceptable Use',
    body: 'You must not misuse the platform, attempt to access accounts or systems without permission, post false or unlawful content, or use contact details obtained here for unsolicited marketing.'
  },
  {
    title: '8. Limitation Of Liability',
    body: 'The platform is provided on an "as is" basis. To the maximum extent permitted by law, we are not liable for losses arising from reliance on listing information, or from agreements made directly between users.'
  },
  {
    title: '9. Governing Law',
    body: 'These terms are governed by the laws of Pakistan. Any dispute arising from the use of this platform shall be subject to the courts of Karachi, Pakistan.'
  },
  {
    title: '10. Changes To These Terms',
    body: 'We may update these terms from time to time. The current version will always be published on this page, and continued use of the platform after an update means you accept the revised terms.'
  }
];

export default function TermsOfService() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in text-charcoal">
      <span className="text-xxs tracking-[0.2em] font-bold text-primary uppercase">Legal</span>
      <h1 className="text-3xl font-bold font-serif text-charcoal mt-1 mb-2">Terms of Service</h1>
      <p className="text-xs text-gray-400 mb-8">
        Last updated: {new Date().getFullYear()} &middot; DHA Estate Pro, Karachi, Pakistan
      </p>

      <div className="bg-white border border-charcoal/5 shadow-luxury p-8 space-y-8">
        <p className="text-xs text-charcoal-light leading-relaxed">
          These terms govern your use of the DHA Estate Pro website and services. Please read them
          carefully — they explain what the platform does, what it does not guarantee, and what we
          expect from users.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif font-bold text-lg text-charcoal mb-2">{section.title}</h2>
            <p className="text-xs text-charcoal-light leading-relaxed">{section.body}</p>
          </section>
        ))}

        <p className="text-xs text-charcoal-light leading-relaxed border-t border-charcoal/5 pt-6">
          Questions about these terms? Reach us through the{' '}
          <Link to="/contact" className="text-primary hover:underline font-bold">Contact page</Link>.
        </p>
      </div>
    </div>
  );
}
