/**
 * Seventh Path Mindful Navigation Component
 * Spiritual navigation with breathing transitions and gentle interactions
 */

import React, { useState, useEffect } from 'react';
import { BreathingAnimation } from '../animations/BreathingAnimation';
import { useCalmMode } from '../../contexts/ZenThemeContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface MindfulNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  variant?: 'tabs' | 'sidebar' | 'bottom' | 'breadcrumb';
  className?: string;
}

export function MindfulNavigation({
  items,
  activeItem,
  onItemClick,
  variant = 'tabs',
  className = '',
}: MindfulNavigationProps) {
  const calmMode = useCalmMode();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;
    onItemClick?.(item);
  };

  const renderTabs = () => (
    <nav className={`nav ${className}`}>
      <div className="nav-tabs">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          const isHovered = hoveredItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              disabled={item.disabled}
              className={`
                nav-tab
                ${isActive ? 'nav-tab--active' : ''}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isHovered ? 'hover-lift' : ''}
              `}
            >
              <div className="nav-tab-icon">
                {item.icon}
              </div>
              <span className="nav-tab-label">
                {item.label}
              </span>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-sage text-on-sage rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );

  const renderSidebar = () => (
    <nav className={`nav-sidebar ${className}`}>
      <div className="nav-sidebar-nav">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`
                nav-sidebar-item
                ${isActive ? 'nav-sidebar-item--active' : ''}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="nav-tab-icon">
                  {item.icon}
                </div>
                <span className="nav-tab-label">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="ml-auto px-2 py-1 text-xs bg-sage text-on-sage rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );

  const renderBottom = () => (
    <nav className={`nav-tab-bar ${className}`}>
      {items.map((item) => {
        const isActive = activeItem === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`
              nav-tab
              ${isActive ? 'nav-tab--active' : ''}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="nav-tab-icon">
              {item.icon}
            </div>
            <span className="nav-tab-label">
              {item.label}
            </span>
            {item.badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-sage text-on-sage rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const renderBreadcrumb = () => (
    <nav className={`nav-breadcrumb ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`
                nav-breadcrumb-item
                ${isLast ? 'nav-breadcrumb-item--current' : ''}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {item.icon && (
                <div className="nav-tab-icon mr-2">
                  {item.icon}
                </div>
              )}
              {item.label}
            </button>
            {!isLast && (
              <span className="nav-breadcrumb-separator">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );

  const renderNavigation = () => {
    switch (variant) {
      case 'tabs':
        return renderTabs();
      case 'sidebar':
        return renderSidebar();
      case 'bottom':
        return renderBottom();
      case 'breadcrumb':
        return renderBreadcrumb();
      default:
        return renderTabs();
    }
  };

  // Apply breathing animation to the entire navigation in calm mode
  if (calmMode) {
    return (
      <BreathingAnimation intensity="subtle" duration={6000}>
        {renderNavigation()}
      </BreathingAnimation>
    );
  }

  return renderNavigation();
}

// Specialized navigation components
export function HabitNavigation({ 
  activeItem, 
  onItemClick, 
  className = '' 
}: Omit<MindfulNavigationProps, 'items' | 'variant'>) {
  const items: NavigationItem[] = [
    {
      id: 'today',
      label: 'Today',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <MindfulNavigation
      items={items}
      activeItem={activeItem}
      onItemClick={onItemClick}
      variant="bottom"
      className={className}
    />
  );
}

export function MeditationNavigation({ 
  activeItem, 
  onItemClick, 
  className = '' 
}: Omit<MindfulNavigationProps, 'items' | 'variant'>) {
  const items: NavigationItem[] = [
    {
      id: 'breathing',
      label: 'Breathing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: 'meditation',
      label: 'Meditation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <MindfulNavigation
      items={items}
      activeItem={activeItem}
      onItemClick={onItemClick}
      variant="tabs"
      className={className}
    />
  );
}

export default MindfulNavigation;
