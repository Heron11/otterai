import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Link, useNavigate } from '@remix-run/react';
import { PlatformNav } from '~/components/platform/layout/PlatformNav';
import { FloatingUser } from '~/components/platform/layout/FloatingUser';
import { BuildAnimationLoader } from '~/components/platform/LottieLoader';
import { TemplateCard } from '~/components/platform/templates/TemplateCard';
import { getDatabase } from '~/lib/.server/db/client';
import { getFeaturedProjects } from '~/lib/.server/projects/queries';

export const meta: MetaFunction = () => {
  return [
    { title: 'OtterAI - AI App Builder' },
    { name: 'description', content: 'Build web applications by describing what you want in plain English' },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const db = getDatabase(context.cloudflare.env);
  const featuredTemplates = await getFeaturedProjects(db, 6); // Get up to 6 featured projects

  return json({ featuredTemplates });
}

export default function HomePage() {
  const { featuredTemplates } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');

  const placeholderPhrases = useMemo(() => [
    " local food delivery app",
    "n online course platform",
    " fitness coaching website",
    " handmade crafts marketplace",
    " pet care booking system"
  ], []);
  
  const [currentPlaceholderPhraseIndex, setCurrentPlaceholderPhraseIndex] = useState(0);
  const [currentPlaceholderText, setCurrentPlaceholderText] = useState("");
  const [isPlaceholderTyping, setIsPlaceholderTyping] = useState(true);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 300;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  // Idle‑preload featured template thumbnails to avoid decode spikes on scroll
  useEffect(() => {
    const urls: string[] = (featuredTemplates || [])
      .map((t: any) => t.thumbnailUrl || t.previewUrl)
      .filter(Boolean);

    const preload = () => {
      urls.slice(0, 6).forEach((url) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = url;
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload, { timeout: 1500 });
    } else {
      setTimeout(preload, 600);
    }
  }, [featuredTemplates]);

  // Pause the typing effect when hero is not visible to avoid unnecessary re-renders
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        setIsHeroVisible(entries[0].isIntersecting);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isHeroVisible) return; // throttle when offscreen
    const currentPhrase = placeholderPhrases[currentPlaceholderPhraseIndex];

    if (isPlaceholderTyping) {
      if (currentPlaceholderText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholderText(currentPhrase.slice(0, currentPlaceholderText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsPlaceholderTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (currentPlaceholderText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholderText(currentPlaceholderText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        setCurrentPlaceholderPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length);
        setIsPlaceholderTyping(true);
      }
    }
  }, [currentPlaceholderText, currentPlaceholderPhraseIndex, isPlaceholderTyping, placeholderPhrases, isHeroVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    // Redirect to main chat page with the message as a query parameter
    navigate(`/?message=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="antialiased">
      {/* Header/Navigation - Fixed at top with high z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PlatformNav />
      </div>

      {/* Hero Section - Full viewport height */}
      <section ref={heroRef} className="relative overflow-hidden bg-bg-1 dark:bg-black min-h-screen flex items-center justify-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/bgimage.webp" 
            alt="" 
            aria-hidden="true"
            className="w-full h-full object-cover object-center blur-sm"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="1920"
            height="1080"
          />
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="relative pt-20 lg:pt-28">
            <LayoutGroup>
              <div className="relative mb-24 text-center md:max-w-4xl mx-auto">
                {/* Decorative star elements */}
                <svg className="absolute top-44 -left-36 hidden xl:block w-16 h-16 text-[#e86b47]" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27 Z" />
                </svg>
                <svg className="absolute top-10 -right-36 hidden xl:block w-16 h-16 text-[#e86b47]" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27 Z" />
                </svg>
                
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-block mb-2 md:mb-2.5 text-xs md:text-sm text-[#e86b47] font-medium tracking-tight"
                >
                  Build Anything, Instantly
                </motion.span>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="font-heading mb-4 md:mb-10 text-3xl sm:text-4xl md:text-7xl lg:text-8xl xl:text-[6.5rem] text-text-primary dark:text-white tracking-tighter leading-tight px-4"
                >
                  What should we build today?
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-full max-w-2xl mx-auto"
                >
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] bg-white/30 dark:bg-white/15 backdrop-blur-sm border border-white/40 dark:border-white/30 rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#e86b47]/50"
                  >
                    <div className="flex-1 flex flex-col relative">
                      <textarea
                        className="w-full resize-none ring-0 outline-0 bg-transparent placeholder:text-gray-600 dark:placeholder:text-gray-200 text-text-primary dark:text-white text-sm md:text-base"
                        name="query"
                        value={query}
                        placeholder={`Create a${currentPlaceholderText}`}
                        ref={textareaRef}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          adjustTextareaHeight();
                        }}
                        onInput={adjustTextareaHeight}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as any);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-end mt-3 md:mt-4 pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 tracking-tight bg-[#e86b47] hover:bg-[#d45a36] text-white focus:ring-4 focus:ring-[#e86b47]/40 rounded-full transition duration-300"
                      >
                        <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </LayoutGroup>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button 
            onClick={() => {
              const nextSection = document.querySelector('section:nth-of-type(2)');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-2 transition-colors group cursor-pointer bg-transparent border-none p-0"
            aria-label="Scroll to see more content"
          >
            <span className="text-xs font-medium tracking-wide text-black dark:text-white">More</span>
            <div className="flex flex-col items-center gap-1 text-[#e86b47] hover:text-[#e86b47]/80">
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-y-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-y-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-12 md:py-24 overflow-hidden bg-bg-2 dark:bg-neutral-950">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#e86b47]/10 dark:bg-[#e86b47]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-[#e86b47]/8 dark:bg-[#e86b47]/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#e86b47]/5 dark:bg-[#e86b47]/4 rounded-full blur-3xl"></div>
        
        <div className="container px-4 mx-auto">
          <div className="mb-12 md:mb-20 md:max-w-xl text-center mx-auto relative">
            <span className="inline-block mb-3 md:mb-4 text-xs md:text-sm text-[#e86b47] font-medium tracking-tight">How It Works</span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-7xl lg:text-8xl text-text-primary dark:text-white tracking-tighter px-4">From idea to production</h2>
          </div>
          
          {/* Removed: Describe your vision card */}
          
          {/* Two Feature Cards */}
          <div className="flex flex-wrap -m-5">
            {/* Watch Otter Build Card */}
            <div className="w-full md:w-1/2 p-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="relative px-4 lg:px-6 pt-6 pb-8 h-full bg-gradient-to-br from-bg-3/50 to-bg-2/50 dark:from-neutral-900/40 dark:to-neutral-900/20 backdrop-blur-sm overflow-hidden border border-neutral-200 dark:border-neutral-800/60 rounded-[2.5rem] shadow-soft hover:shadow-elevation transition-all duration-300"
              >
                {/* Lottie Animation */}
                <div className="mb-3 flex justify-center items-center aspect-video">
                  <BuildAnimationLoader className="w-full h-full max-w-full max-h-full" />
                </div>
                <div className="relative z-10 max-w-md text-center mx-auto px-2">
                  <h2 className="mb-3 text-5xl lg:text-6xl text-text-primary dark:text-white tracking-tighter">Watch Otter build</h2>
                  <p className="text-text-tertiary dark:text-white/60 text-sm lg:text-base">OtterAI generates your complete application phase by phase, with real-time progress tracking, automated testing, and seamless integration setup.</p>
                </div>
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-56 h-56 bg-[#e86b47]/4 dark:bg-[#e86b47]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#e86b47]/3 dark:bg-[#e86b47]/4 rounded-full blur-3xl"></div>
              </motion.div>
            </div>
            
            {/* Deploy Instantly Card */}
            <div className="hidden md:block w-full md:w-1/2 p-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="relative px-4 lg:px-6 pt-6 pb-8 h-full overflow-hidden border border-neutral-200 dark:border-neutral-800/60 rounded-[2.5rem] shadow-soft hover:shadow-elevation transition-all duration-300"
              >
                {/* Content overlay with blur */}
                <div className="absolute inset-0 bg-gradient-to-br from-bg-3/30 to-bg-2/30 dark:from-neutral-900/20 dark:to-neutral-900/10 backdrop-blur-sm"></div>
                
                {/* Background image */}
                <div 
                  className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url(/deployinstantlycard.svg)' }}
                ></div>
                
                {/* Empty space for background */}
                <div className="relative z-20 mb-3 flex justify-center items-center aspect-video"></div>
                
                {/* Text and button in bottom right */}
                <div className="absolute bottom-6 right-6 z-30 text-right">
                  <h2 className="mb-4 text-6xl lg:text-7xl text-text-primary dark:text-white tracking-tighter drop-shadow-2xl">
                    <span className="block">Deploy</span>
                    <span className="block">instantly</span>
                  </h2>
                  <Link 
                    to="/"
                    className="relative z-50 inline-block px-8 py-4 tracking-tight bg-[#e86b47] hover:bg-[#d45a36] text-white focus:ring-4 focus:ring-[#e86b47]/40 rounded-full transition duration-300 drop-shadow-lg"
                  >
                    Try now
                  </Link>
                </div>
                
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-56 h-56 bg-[#e86b47]/4 dark:bg-[#e86b47]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#e86b47]/3 dark:bg-[#e86b47]/4 rounded-full blur-3xl"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="relative py-24 overflow-hidden bg-bg-2 dark:bg-neutral-950">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#e86b47]/10 dark:bg-[#e86b47]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-[#e86b47]/8 dark:bg-[#e86b47]/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#e86b47]/5 dark:bg-[#e86b47]/4 rounded-full blur-3xl"></div>
        
        <div className="container px-4 mx-auto">
          <div className="mb-20 md:max-w-xl text-center mx-auto relative">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 text-sm text-[#e86b47] font-medium tracking-tight"
            >
              Professional Templates
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-text-primary dark:text-white tracking-tighter px-4"
            >
              Start with proven designs
            </motion.h2>
          </div>

          {/* Template Grid */}
          {featuredTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center py-16"
            >
              <div className="relative inline-block">
                <div className="text-8xl mb-6 opacity-30">📁</div>
                <div className="absolute inset-0 bg-[#e86b47]/10 rounded-full blur-2xl"></div>
              </div>
              <p className="text-text-secondary dark:text-white/70 text-base md:text-lg mb-6 px-4">
                No public templates available yet. Be the first to share a project!
              </p>
              <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 border border-[#e86b47]/20 rounded-full">
                <span className="text-[#e86b47] text-xs md:text-sm font-medium">Create your first project to get started</span>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 transform-gpu"
              >
                {featuredTemplates.slice(0, 3).map((template) => (
                  <div key={template.id} className="transform-gpu">
                    <TemplateCard template={template} />
                  </div>
                ))}
              </motion.div>

              {/* View All Templates CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <Link
                  to="/templates"
                  prefetch="intent"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full font-medium transition-all duration-300 hover:scale-105"
                >
                  Browse All Templates
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-bg-1 dark:bg-black">
        <div className="container px-4 mx-auto">
          <div className="relative pt-20 px-8 lg:px-16 pb-20 overflow-hidden rounded-[6rem] border border-[#e86b47]/30 rounded-b-[8rem]">
            {/* Background image with blur */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm rounded-b-[8rem]"
              style={{ backgroundImage: 'url(/orangecardbg.webp)' }}
            ></div>
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="text-center md:max-w-2xl mx-auto relative z-20">
              <span className="inline-block mb-4 text-sm text-white font-medium tracking-tight">Get Started</span>
              <h2 className="font-heading mb-6 text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter px-4">
                Ready to build something amazing?
              </h2>
              <p className="mb-8 text-white/90 text-lg max-w-xl mx-auto">
                Build the future with AI-powered development
              </p>
              <Link
                to="/"
                className="relative z-50 inline-block px-10 py-5 tracking-tight bg-[#e86b47] hover:bg-[#d45a36] text-white focus:ring-4 focus:ring-[#e86b47]/40 rounded-full transition duration-300 font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Start Building Now
              </Link>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#e86b47]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e86b47]/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer with Curved Transition */}
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
                  <li><Link to="/blog/introducing-otterai" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">About</Link></li>
                  <li><Link to="/blog" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Blog</Link></li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="font-semibold text-white dark:text-gray-900 mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li><Link to="/docs" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Documentation</Link></li>
                  <li><Link to="/docs/privacy-policy" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Privacy Policy</Link></li>
                  <li><Link to="/docs/terms-of-service" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Terms of Service</Link></li>
                  <li><Link to="/docs/acceptable-use" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Acceptable Use</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-gray-800 dark:border-gray-200 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-gray-300 dark:text-gray-600 text-sm mb-4 sm:mb-0">
                © 2025 OtterAI. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <Link to="/docs/privacy-policy" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Privacy Policy</Link>
                <Link to="/docs/terms-of-service" className="text-gray-300 dark:text-gray-600 hover:text-[#e86b47] transition-colors text-sm">Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
