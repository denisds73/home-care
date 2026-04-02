import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-300 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3" aria-label="HomeCare home">
              <svg className="w-7 h-7 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>
              <span className="text-lg font-bold font-brand text-white">Home<span style={{ color: '#7C3AED' }}>Care</span></span>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400">Premium home appliance services. Expert technicians for AC, TV, Fridge & more.</p>
            <div className="flex gap-3 mt-4">
              {['M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
              ].map((d, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-700/60 hover:bg-[#7C3AED] flex items-center justify-center transition" aria-label={['Facebook', 'Twitter', 'LinkedIn'][i]}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={d}/></svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-brand">Services</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { name: 'AC Services', to: '/services/ac' },
                { name: 'TV Repair', to: '/services/tv' },
                { name: 'Refrigerator', to: '/services/refrigerator' },
                { name: 'Microwave', to: '/services/microwave' },
                { name: 'Water Purifier', to: '/services/water_purifier' },
                { name: 'Washing Machine', to: '/services/washing_machine' },
              ].map(link => (
                <li key={link.to}><Link to={link.to} className="hover:text-white transition">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-brand">Company</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { name: 'About Us', to: '/about' },
                { name: 'Contact', to: '/contact' },
                { name: 'FAQ', to: '/faq' },
                { name: 'Blog', to: '/blog' },
              ].map(link => (
                <li key={link.to}><Link to={link.to} className="hover:text-white transition">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-brand">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { name: 'Terms of Service', to: '/terms' },
                { name: 'Privacy Policy', to: '/privacy' },
                { name: 'Refund Policy', to: '/refund' },
              ].map(link => (
                <li key={link.to}><Link to={link.to} className="hover:text-white transition">{link.name}</Link></li>
              ))}
            </ul>
            <div className="mt-5">
              <h4 className="text-sm font-bold text-white mb-2 font-brand">Contact</h4>
              <p className="text-xs">support@homecare.in</p>
              <p className="text-xs mt-1">+91 80-1234-5678</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} HomeCare Services. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            <span>100% Secure Payments</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
