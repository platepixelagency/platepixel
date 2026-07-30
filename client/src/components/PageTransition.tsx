import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OrbLoader } from './OrbLoader';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // Scroll smoothly to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Play quick smooth transition trigger
    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (transitioning) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <OrbLoader label="Loading Workspace..." size="md" />
      </div>
    );
  }

  return (
    <div key={location.pathname} className="animate-page-switch">
      {children}
    </div>
  );
};
