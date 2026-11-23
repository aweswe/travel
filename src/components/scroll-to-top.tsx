'use client';

import * as React from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <aside aria-label="Quick actions" className="scroll-to-top-container">
      <button
        type="button"
        onClick={scrollToTop}
        className="scroll-to-top-btn"
        aria-label="Scroll back to top"
        title="Scroll back to top"
      >
        <ArrowUp size={20} strokeWidth={2.4} />
        <span className="sr-only">Scroll back to top</span>
      </button>
      <style jsx>{`
        .scroll-to-top-container {
          position: fixed;
          bottom: calc(28px + env(safe-area-inset-bottom, 0px));
          right: calc(28px + env(safe-area-inset-right, 0px));
          z-index: 45;
          animation: fadeIn 0.25s ease-out forwards;
        }
        .scroll-to-top-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--red);
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 24px rgba(215, 62, 36, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s;
        }
        .scroll-to-top-btn:hover {
          transform: translateY(-4px) scale(1.08);
          background: #b52e16;
          box-shadow: 0 12px 28px rgba(215, 62, 36, 0.5);
        }
        .scroll-to-top-btn:active {
          transform: translateY(0) scale(0.96);
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 760px) {
          .scroll-to-top-container {
            bottom: 20px;
            right: 18px;
          }
          .scroll-to-top-btn {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </aside>
  );
}
