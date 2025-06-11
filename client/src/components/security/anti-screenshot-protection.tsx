import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AntiScreenshotProtectionProps {
  children: React.ReactNode;
  enabled?: boolean;
  onScreenshotAttempt?: () => void;
}

export default function AntiScreenshotProtection({ 
  children, 
  enabled = true, 
  onScreenshotAttempt 
}: AntiScreenshotProtectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let keyListener: (e: KeyboardEvent) => void;
    let visibilityListener: () => void;
    let focusListener: () => void;
    let blurListener: () => void;

    // Detect screenshot attempts
    const detectScreenshot = () => {
      setIsBlurred(true);
      setWarningVisible(true);
      onScreenshotAttempt?.();
      
      // Auto-hide warning after 3 seconds
      setTimeout(() => {
        setWarningVisible(false);
        setIsBlurred(false);
      }, 3000);
    };

    // Common screenshot key combinations
    keyListener = (e: KeyboardEvent) => {
      // Windows: Win + PrtScn, PrtScn, Alt + PrtScn
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        detectScreenshot();
        return false;
      }

      // Windows Snipping Tool: Win + Shift + S
      if (e.key === 'S' && e.shiftKey && e.metaKey) {
        e.preventDefault();
        detectScreenshot();
        return false;
      }

      // Mac: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        detectScreenshot();
        return false;
      }

      // Developer tools
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        detectScreenshot();
        return false;
      }
    };

    // Detect when user switches away (might be taking screenshot)
    visibilityListener = () => {
      if (document.visibilityState === 'hidden') {
        setIsBlurred(true);
      } else {
        setTimeout(() => setIsBlurred(false), 500);
      }
    };

    // Detect when window loses focus
    blurListener = () => {
      setIsBlurred(true);
    };

    focusListener = () => {
      setTimeout(() => setIsBlurred(false), 500);
    };

    // Add event listeners
    document.addEventListener('keydown', keyListener);
    document.addEventListener('visibilitychange', visibilityListener);
    window.addEventListener('blur', blurListener);
    window.addEventListener('focus', focusListener);

    // Disable right-click context menu
    const contextMenuListener = (e: Event) => {
      e.preventDefault();
      return false;
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('contextmenu', contextMenuListener);
    }

    // Disable text selection
    const disableSelection = () => {
      if (containerRef.current) {
        containerRef.current.style.userSelect = 'none';
        containerRef.current.style.webkitUserSelect = 'none';
        containerRef.current.style.mozUserSelect = 'none';
        containerRef.current.style.msUserSelect = 'none';
      }
    };

    disableSelection();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', keyListener);
      document.removeEventListener('visibilitychange', visibilityListener);
      window.removeEventListener('blur', blurListener);
      window.removeEventListener('focus', focusListener);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('contextmenu', contextMenuListener);
      }
    };
  }, [enabled, onScreenshotAttempt]);

  // Add CSS to prevent highlighting and dragging
  const protectionStyles: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitUserDrag: 'none',
    KhtmlUserDrag: 'none',
    MozUserDrag: 'none',
    ODragImage: 'none',
    userDrag: 'none',
    position: 'relative'
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} style={protectionStyles}>
      {/* Security Warning */}
      {warningVisible && (
        <Alert className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Screenshot attempt detected. This document is protected.
          </AlertDescription>
        </Alert>
      )}

      {/* Protection Overlay */}
      {isBlurred && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center">
          <div className="text-center text-white">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Document Protected</h3>
            <p className="text-gray-300">Return focus to view content</p>
          </div>
        </div>
      )}

      {/* Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute text-gray-200/20 text-4xl font-bold transform rotate-45 select-none"
            style={{
              top: `${20 + (i * 15)}%`,
              left: `${10 + (i % 2) * 40}%`,
              fontSize: '3rem',
              lineHeight: '1',
              fontWeight: 900
            }}
          >
            RISKIFY PROTECTED
          </div>
        ))}
      </div>

      {/* Content */}
      <div className={`relative z-20 ${isBlurred ? 'filter blur-lg' : ''}`}>
        {children}
      </div>
    </div>
  );
}