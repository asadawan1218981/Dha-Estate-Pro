import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'When you create an account, we collect your name, email address, and phone number. When you contact an agent, request a viewing, or submit an inquiry, we collect the details you provide in that form (including your message and the property it relates to). We also collect basic usage information, such as the pages you visit, so we can improve the platform.'
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to operate your account, show you your saved favorites, pass your inquiries and viewing requests to the relevant agent or property owner, and send you service-related updates. We do not sell your personal information to third parties.'
  },
  {
    title: '3. Sharing Your Information',
    body: 'Your contact details are shared with the agent or owner of a property only when you submit an inquiry, viewing request, or contact form for that property. We may also share information with service providers who help run the platform (such as hosting and database providers), and when required by law.'
  },
  {
    title: '4. Saved Favorites',
    body: 'Properties you mark with the heart icon are saved to your account so you can return to them later. You can remove a property from your favorites at any time by clicking the heart icon again, and your saved list is visible only to you.'
  },
  {
    title: '5. Data Security',
    body: 'Your password is stored in encrypted form and your account is protected by login authentication. However, no method of transmission over the internet is completely secure, so we cannot guarantee absolute security.'
  },
  {
    title: '6. Cookies',
    body: 'We use browser storage to keep you signed in and to remember your preferences, such as your recent searches. You can clear your browser storage at any time, but you will be signed out.'
  },
  {
    title: '7. Your Rights',
    body: 'You can update your name and phone number from your dashboard at any time. If you want your account and its data removed, please contact us through the contact page and we will process your request.'
  },
  {
    title: '8. Changes To This Policy',
    body: 'We may update this policy from time to time. The current version will always be published on this page, and significant changes will be highlighted here.'
  }
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in text-charcoal">
      <span className="text-xxs tracking-[0.2em] font-bold text-primary uppercase">Legal</span>
      <h1 className="text-3xl font-bold font-serif text-charcoal mt-1 mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-8">
        Last updated: {new Date().getFullYear()} &middot; DHA Estate Pro, Karachi, Pakistan
      </p>

      <div className="bg-white border border-charcoal/5 shadow-luxury p-8 space-y-8">
        <p className="text-xs text-charcoal-light leading-relaxed">
          DHA Estate Pro (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a real estate platform for properties in
          DHA Karachi. This policy explains what information we collect, why we collect it, and the
          choices you have. By using this website, you agree to this policy.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif font-bold text-lg text-charcoal mb-2">{section.title}</h2>
            <p className="text-xs text-charcoal-light leading-relaxed">{section.body}</p>
          </section>
        ))}

        <p className="text-xs text-charcoal-light leading-relaxed border-t border-charcoal/5 pt-6">
          Questions about this policy? Reach us through the{' '}
          <Link to="/contact" className="text-primary hover:underline font-bold">Contact page</Link>.
        </p>
      </div>
    </div>
  );
}
