import { Link } from '@remix-run/react';

export function Footer() {
  return (
    <section className="bg-black dark:bg-gray-50 overflow-hidden">
      {/* Curved transition */}
      <div className="py-14 bg-bg-1 dark:bg-black rounded-b-[4rem]"></div>
      
      {/* Footer - opposite theme */}
      <div className="py-24 bg-black dark:bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                {/* Dark background uses light logo */}
                <img
                  src="/darkmodelogonew.svg"
                  alt="OtterAI Logo"
                  className="dark:hidden"
                  style={{ width: '120px', height: 'auto' }}
                />
                {/* Light background uses dark logo */}
                <img
                  src="/lightmodelogonew.svg"
                  alt="OtterAI Logo"
                  className="hidden dark:block"
                  style={{ width: '120px', height: 'auto' }}
                />
              </div>
              <p className="text-gray-300 dark:text-gray-600 text-sm leading-relaxed">
                OtterAI helps you build web applications by describing what you want in plain English.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-white dark:text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link to="/pricing" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Pricing</Link></li>
                <li><Link to="/templates" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Templates</Link></li>
                <li><Link to="/dashboard" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold text-white dark:text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Careers</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold text-white dark:text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Documentation</a></li>
                <li><a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Support</a></li>
                <li><a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Community</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-8 border-t border-gray-800 dark:border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-300 dark:text-gray-600 text-sm mb-4 sm:mb-0">
              © 2025 OtterAI. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}