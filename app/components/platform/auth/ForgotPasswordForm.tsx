import { useState } from 'react';
import { Link } from '@remix-run/react';
import { forgotPassword } from '~/lib/stores/platform/auth';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    forgotPassword(email);
    
    // Mock delay
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-bolt-elements-background-depth-1 rounded-lg p-8 border border-bolt-elements-borderColor">
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-4">
              Check your email
            </h2>
            
            <p className="text-bolt-elements-textSecondary mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-all"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-bolt-elements-background-depth-1 rounded-lg p-8 border border-bolt-elements-borderColor">
        <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">
          Reset your password
        </h2>
        
        <p className="text-bolt-elements-textSecondary mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send reset instructions'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}



