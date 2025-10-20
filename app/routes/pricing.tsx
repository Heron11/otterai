import type { MetaFunction } from '@remix-run/cloudflare';
import { motion } from 'framer-motion';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { PricingTable } from '~/components/platform/pricing/PricingTable';
import { useUser } from '~/lib/hooks/platform/useUser';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pricing - OtterAI' },
    { name: 'description', content: 'Choose the perfect plan for your needs' },
  ];
};

export default function PricingPage() {
  const { userProfile } = useUser();

  return (
    <PlatformLayout showFooter={true}>
      <div className="min-h-screen bg-bg-1 dark:bg-black overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          {/* Background decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#e86b47]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-[#e86b47]/8 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-[#e86b47]/3 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-full mb-6">
                <div className="w-2 h-2 bg-[#e86b47] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[#e86b47]">Simple, transparent pricing</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-text-primary dark:text-white mb-6 break-words">
                Choose your
                <span className="font-semibold text-[#e86b47] block">perfect plan</span>
              </h1>
              
              <p className="text-lg text-text-secondary dark:text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                Start building with AI today. No hidden fees, no surprises. 
                Scale as you grow with plans that fit your needs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="pb-20"
        >
          <PricingTable currentTier={userProfile?.tier} />
        </motion.section>

      </div>
    </PlatformLayout>
  );
}



