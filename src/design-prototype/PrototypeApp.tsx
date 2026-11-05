import React, { useState } from 'react';
import { PrototypeView, VisualTheme } from './types';
import { TopPrototypeBar } from './components/TopPrototypeBar';
import { UserAppWeb } from './screens/UserAppWeb';
import { UserAppMobile } from './screens/UserAppMobile';
import { AdminPanel } from './screens/AdminPanel';
import { StatesGallery } from './screens/StatesGallery';
import { FlowsViewer } from './screens/FlowsViewer';
import { DesignDocViewer } from './screens/DesignDocViewer';

interface PrototypeAppProps {
  onSwitchToOriginalApp?: () => void;
}

export const PrototypeApp: React.FC<PrototypeAppProps> = ({ onSwitchToOriginalApp }) => {
  const [currentView, setCurrentView] = useState<PrototypeView>('web-app');
  const [currentTheme, setCurrentTheme] = useState<VisualTheme>('deep-azure');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Prototype Navigation Bar */}
      <TopPrototypeBar
        currentView={currentView}
        onSelectView={setCurrentView}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        onSwitchToOriginalApp={onSwitchToOriginalApp}
      />

      {/* Main View Area */}
      <div className="flex-1">
        {currentView === 'web-app' && <UserAppWeb theme={currentTheme} />}
        {currentView === 'mobile-app' && <UserAppMobile theme={currentTheme} />}
        {currentView === 'admin-panel' && <AdminPanel theme={currentTheme} />}
        {currentView === 'states-matrix' && <StatesGallery theme={currentTheme} />}
        {currentView === 'flow-visualizer' && <FlowsViewer theme={currentTheme} />}
        {currentView === 'design-doc' && <DesignDocViewer theme={currentTheme} />}
      </div>
    </div>
  );
};
