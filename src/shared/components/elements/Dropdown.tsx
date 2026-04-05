'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { DropdownProps, DropdownItem } from './types/dropdown.types';

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  placement = 'bottom-left',
  maxHeight = 'max-h-80',
  loading = false,
  emptyMessage = 'No items available',
  openOnHover = false,
  showSearch = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseEnter = () => {
    if (openOnHover) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (openOnHover) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !openOnHover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, openOnHover]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getDropdownPosition = () => {
    switch (placement) {
      case 'bottom-right':
        return 'top-full right-0 mt-3';
      case 'top-left':
        return 'bottom-full left-0 mb-3';
      case 'top-right':
        return 'bottom-full right-0 mb-3';
      default:
        return 'top-full left-0 mt-3';
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <div
        className={cn(
          'inline-flex items-center justify-between w-full transition-all duration-200 focus:outline-none',
          triggerClassName
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={openOnHover ? undefined : () => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 bg-white rounded-2xl shadow-2xl overflow-hidden w-72',
            'ring-1 ring-slate-100',
            getDropdownPosition(),
            dropdownClassName
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Search */}
          {showSearch && !loading && (
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="px-4 py-10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
              <p className="text-slate-400 text-xs">Loading categories...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-10 text-sm text-slate-400 text-center">
              {searchTerm ? `No results for "${searchTerm}"` : emptyMessage}
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Categories
                </span>
                {showSearch && searchTerm && (
                  <span className="text-xs text-slate-400">{filteredItems.length} found</span>
                )}
              </div>

              {/* Items list */}
              <div
                className={cn(
                  'pb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent',
                  maxHeight
                )}
              >
                {filteredItems.map((item, index) => (
                  <button
                    key={item.id || index}
                    className="group flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-150 relative"
                    role="menuitem"
                    onClick={() => handleItemClick(item)}
                  >
                    {/* Amber left accent on hover */}
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-500 rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-150" />

                    {item.icon && (
                      <div className="mr-3 flex-shrink-0 text-slate-400 group-hover:text-amber-500 transition-colors">
                        {item.icon}
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate group-hover:text-amber-600/70">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <svg
                      className="w-3.5 h-3.5 ml-2 flex-shrink-0 text-slate-300 group-hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Footer — view all */}
          {!loading && filteredItems.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
              <button
                onClick={() =>
                  handleItemClick({ id: 'all', label: 'All Categories', href: '/products' })
                }
                className="w-full text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors text-center"
              >
                View all products →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
