import { PlatformNav } from './PlatformNav';
import { Footer } from './Footer';
import { FloatingUser } from './FloatingUser';

interface PlatformLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function PlatformLayout({ children, showFooter = true }: PlatformLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bolt-elements-background-depth-2 overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <PlatformNav />
      </div>
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <FloatingUser />
    </div>
  );
}



