'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check, LucideIcon } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon | ReactNode;
  badge?: string | number;
  description?: string;
}

interface ResponsiveDropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  fullWidth?: boolean;
}

export default function ResponsiveDropdown<T extends string = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  fullWidth = true,
}: ResponsiveDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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

  const renderIcon = (icon: LucideIcon | ReactNode | React.ComponentType<{ size?: number; className?: string }> | undefined) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return <span className="shrink-0 flex items-center">{icon}</span>;
    }
    const IconComponent = icon as React.ComponentType<{ size?: number; className?: string }>;
    return <IconComponent size={15} className="shrink-0 text-[#E52A83] dark:text-purple-400" />;
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {label && (
        <label className="block text-xs font-semibold text-[#6E6072] dark:text-zinc-400 mb-1.5 pl-0.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer text-xs sm:text-sm font-medium ${
          isOpen
            ? 'border-[#B31372] ring-2 ring-[#B31372]/25 dark:border-purple-400/60 dark:ring-purple-500/25 bg-[#FFFFFF] dark:bg-[#16091F]'
            : 'border-[#E8E4EF] hover:border-[#B31372]/40 bg-[#FFFFFF] hover:bg-[#FAF8FB] dark:border-purple-400/25 dark:hover:border-purple-400/40 dark:bg-[#130c26]/90 dark:hover:bg-[#1a1233]'
        } text-[#261827] dark:text-white shadow-2xs ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          {selectedOption?.icon && renderIcon(selectedOption.icon)}
          <span className="truncate font-semibold text-[#261827] dark:text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4DCE9] text-[#B31372] dark:bg-purple-500/20 dark:text-purple-300 font-bold font-mono shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#8C7E92] dark:text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#B31372] dark:text-purple-300' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF]/98 dark:bg-[#16091F]/98 backdrop-blur-2xl shadow-xl z-50 p-1.5 space-y-0.5 custom-scrollbar animate-[fadeIn_0.1s_ease-out] ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.id === value;

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full min-h-[40px] text-left px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between gap-2.5 text-xs sm:text-sm ${
                  isSelected
                    ? 'bg-[#F4DCE9] text-[#B31372] dark:bg-purple-500/25 dark:text-purple-100 font-semibold shadow-2xs'
                    : 'text-[#4A3B4D] dark:text-zinc-300 hover:bg-[#FAF8FB] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 truncate">
                  {option.icon && renderIcon(option.icon)}
                  <div className="truncate">
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <p className="text-[10px] text-[#8C7E92] dark:text-zinc-400 font-normal truncate">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {option.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        isSelected
                          ? 'bg-[#E52A83] text-white dark:bg-purple-500 dark:text-white'
                          : 'bg-[#F0EDF5] text-[#6E6072] dark:bg-white/[0.08] dark:text-zinc-400'
                      }`}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && <Check size={14} className="text-[#B31372] dark:text-purple-300 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { ResponsiveDropdown };
