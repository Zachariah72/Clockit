import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { MusicBottomNav } from "./MusicBottomNav";

interface LayoutProps {
  children: ReactNode;
  hidePlayer?: boolean;
  hideBottomNav?: boolean;
}

export const Layout = ({ children, hidePlayer, hideBottomNav }: LayoutProps) => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <main className="pb-20">{children}</main>

      {!hideBottomNav && location.pathname !== '/downloads' && location.pathname !== '/podcasts' && (
        location.pathname.startsWith('/music') ? (
          <MusicBottomNav />
        ) : (
          <BottomNav />
        )
      )}
    </div>
  );
};
