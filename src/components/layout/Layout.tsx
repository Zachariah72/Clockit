import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { MusicBottomNav } from "./MusicBottomNav";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { DesktopHeader } from "./DesktopHeader";

interface LayoutProps {
  children: ReactNode;
  hidePlayer?: boolean;
  hideBottomNav?: boolean;
  hideSidebar?: boolean;
  hideRightPanel?: boolean;
}

export const Layout = ({ children, hidePlayer, hideBottomNav, hideSidebar, hideRightPanel }: LayoutProps) => {
  const location = useLocation();
  
  // Check if we're on desktop/large screens
  const isLargeDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

  return (
    <div className="min-h-screen bg-black transition-colors duration-300 flex text-white">
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      {!hideSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!hideSidebar ? 'md:pl-[244px]' : ''} ${!hideRightPanel ? 'lg:pr-[320px]' : ''}`}>
        {/* Desktop Header - Only on large screens */}
        <DesktopHeader />
        
        <main className="flex-1 pb-20 md:pb-0 h-full">
          <div className="max-w-[1200px] mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel - Only on large screens */}
      {!hideRightPanel && <RightPanel />}

      {/* Mobile/Tablet Bottom Nav */}
      {!hideBottomNav && !isLargeDesktop && location.pathname !== '/downloads' && location.pathname !== '/podcasts' && (
        location.pathname.startsWith('/music') ? (
          <MusicBottomNav />
        ) : (
          <BottomNav />
        )
      )}
    </div>
  );
};
