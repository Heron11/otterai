import { useState } from 'react';
import { useUser } from '~/lib/hooks/platform/useUser';

export function ProfileForm() {
  const { userProfile, updateProfile } = useUser();
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    updateProfile({ name, email });
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">
          Profile Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
              Avatar
            </label>
            {userProfile?.avatar && (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-20 h-20 rounded-full"
              />
            )}
            <p className="mt-2 text-sm text-bolt-elements-textSecondary">
              Avatar is generated automatically based on your email
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-[#e86b47] text-white rounded-md font-medium hover:bg-[#d45a36] transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}



