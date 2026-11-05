import React, { useState } from 'react';
import { PrototypeApp } from './design-prototype/PrototypeApp';
import OriginalApp from './OriginalApp';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<'prototype' | 'original'>('prototype');

  if (appMode === 'original') {
    return (
      <div className="relative min-h-screen">
        {/* Banner to switch back to Phase 1 Design Showcase */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-neutral-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-blue-500/30 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">أنت الآن في وضع "الواجهة البرمجية الحالية (الكود الأصلي)"</span>
            <span className="hidden sm:inline text-neutral-300">· لم يتم تعديل أو حذف أي ميزة سابقة</span>
          </div>
          <button
            onClick={() => setAppMode('prototype')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>العودة لنموذج المرحلة 1 (التصميم والواجهات)</span>
          </button>
        </div>

        {/* The untouched original application */}
        <OriginalApp />
      </div>
    );
  }

  // Phase 1 Design Prototype View (Default)
  return <PrototypeApp onSwitchToOriginalApp={() => setAppMode('original')} />;
}
