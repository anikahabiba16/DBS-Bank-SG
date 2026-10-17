import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Observer } from 'tailwindcss-intersect';

const IntersectObserver = () => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    const timer = setTimeout(() => {
      try {
        Observer.restart();
      } catch {}
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

export default IntersectObserver;
