import React, { useState, useEffect } from 'react';
import { PrototypeApp } from './design-prototype/PrototypeApp';
import OriginalApp from './OriginalApp';
import { Layers, ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  // Check whether current URL is on /design-prototype or #design-prototype
  const isPrototypeRoute = () => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return pathname.includes('design-prototype') || hash.includes('design-prototype');
  };

  const [isPrototype, setIsPrototype] = useState<boolean>(isPrototypeRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsPrototype(isPrototypeRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToPrototype = () => {
    window.history.pushState({}, '', '#design-prototype');
    setIsPrototype(true);
  };

  const navigateToOriginal = () => {
    window.history.pushState({}, '', window.location.pathname);
    setIsPrototype(false);
  };

  if (isPrototype) {
    return <PrototypeApp onSwitchToOriginalApp={navigateToOriginal} />;
  }

  // Default: Original untouched SULY AI Platform
  return (
    <div className="relative min-h-screen">
      {/* Unobtrusive Floating Link to Phase 1 Design Prototype */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={navigateToPrototype}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/95 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 shadow-2xl backdrop-blur-md text-xs font-medium transition-all group hover:scale-[1.02]"
          title="استعراض نموذج المرحلة 1 لتصميم الواجهات وتجربة الاستخدام"
        >
          <Layers className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span>استعراض نموذج تصميم المرحلة الأولى (تصور واجهات فقط)</span>
          <ArrowLeft className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Untouched Original Application */}
      <OriginalApp />
    </div>
  );
}
