import React, { useState, useEffect, useRef } from 'react';
import { Compass, Check, ChevronDown, Sparkles, Clock, Info, Tag } from 'lucide-react';
import { getVisaOptionsForRoute, VisaOption } from '../lib/visaRequirements';

interface DestinationVisaSelectorProps {
  destinationCountry: string;
  value: string;
  onChange: (selectedVisaType: string) => void;
  purposeOfTravel?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const DestinationVisaSelector: React.FC<DestinationVisaSelectorProps> = ({
  destinationCountry,
  value,
  onChange,
  purposeOfTravel = 'relocation',
  label = "Target Visa Category / Program",
  placeholder = "Select visa category...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI-powered state management
  const [availableOptions, setAvailableOptions] = useState<VisaOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Fetch visa options dynamically from server (Gemini AI with static fallback)
  useEffect(() => {
    // 1. Immediately load static fallbacks as initial state so the UI is responsive
    const staticAssessment = getVisaOptionsForRoute('', '', destinationCountry ? [destinationCountry] : [], purposeOfTravel);
    setAvailableOptions(staticAssessment.options || []);
    setIsAiGenerated(false);

    if (!destinationCountry) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const fetchVisaOptions = async () => {
      try {
        const response = await fetch('/api/mobility/visa-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originCountry: '',
            destinationCountry,
            purposeOfTravel,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch AI visa options');
        }

        const data = await response.json();
        if (isMounted && data.options && data.options.length > 0) {
          setAvailableOptions(data.options);
          setIsAiGenerated(data.isAiGenerated ?? true);
          
          // Auto-select the first option if the current value is not in the new list and is not custom
          const matchesCurrentValue = data.options.some(
            (o: VisaOption) => o.name.toLowerCase() === value.toLowerCase()
          );
          if (!matchesCurrentValue && !isCustomMode && data.options.length > 0) {
            onChange(data.options[0].name);
          }
        }
      } catch (err) {
        console.warn('AI visa options generation failed, using static fallback:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVisaOptions();

    return () => {
      isMounted = false;
    };
  }, [destinationCountry, purposeOfTravel]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update customText if value changes from outside
  useEffect(() => {
    setCustomText(value);
  }, [value]);

  const handleSelectOption = (opt: VisaOption) => {
    onChange(opt.name);
    setCustomText(opt.name);
    setIsCustomMode(false);
    setIsOpen(false);
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    onChange(text);
  };

  const currentMatchedOption = availableOptions.find(
    o => o.name.toLowerCase() === value.toLowerCase() || value.toLowerCase().includes(o.name.toLowerCase())
  );

  return (
    <div className={`space-y-1.5 font-mono ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[10px] uppercase font-extrabold text-slate-700">
            {label}
          </label>
          {destinationCountry && (
            <span className="text-[10px] text-blue-700 font-bold flex items-center gap-1">
              {isLoading ? (
                <>
                  <Sparkles className="w-3 h-3 animate-spin text-amber-500" />
                  <span className="text-amber-600 animate-pulse">AI Researching Visa Programs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">{isAiGenerated ? 'AI Generated' : `${availableOptions.length} Prefilled`} Programs</span>
                </>
              )}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Main Select Field / Button */}
        <div
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          className={`w-full bg-white border border-slate-300 hover:border-blue-600 p-2.5 rounded-lg text-slate-900 font-extrabold cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors shadow-sm ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
          <div className="flex items-center gap-2 truncate">
            {isLoading ? (
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
            ) : (
              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className={value ? "text-slate-900 font-extrabold truncate" : "text-slate-400 font-medium truncate"}>
              {isLoading ? "Consulting AI Advisor..." : (value || placeholder)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {value && !isLoading && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-extrabold rounded uppercase border border-emerald-300">
                Selected
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dynamic Selection Box / Flyout Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-300 rounded-xl shadow-2xl p-3 space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar animate-fadeIn text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] uppercase font-extrabold text-slate-700">
              <span className="flex items-center gap-1">
                <span>Visas for</span>
                <span className="text-blue-700 font-extrabold capitalize">{purposeOfTravel.replace('_', ' ')}</span>
                <span>({destinationCountry || 'General'})</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCustomMode(!isCustomMode);
                }}
                className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
              >
                {isCustomMode ? "Use Prefilled List" : "Type Custom Category"}
              </button>
            </div>

            {/* Custom Manual Input Mode */}
            {isCustomMode ? (
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                <span className="text-[10px] text-slate-700 font-extrabold uppercase block">Enter Custom Program Name</span>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  placeholder="e.g. Specialized Research Visa"
                  className="w-full bg-white border border-slate-300 p-2 rounded text-slate-900 font-bold focus:outline-none focus:border-blue-600 text-xs shadow-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase text-[10px] rounded shadow-sm cursor-pointer"
                >
                  Confirm Custom Category
                </button>
              </div>
            ) : (
              /* List of Available Destination Visa Categories */
              <div className="space-y-1.5">
                {availableOptions.map((opt) => {
                  const isSelected = value === opt.name;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col space-y-1 group ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 text-slate-900'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate font-extrabold text-slate-900 group-hover:text-blue-700">
                          <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{opt.name}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-bold text-slate-800">
                          {opt.category}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600 font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{opt.processingTime}</span>
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-600 leading-tight font-medium pt-0.5 line-clamp-2">
                        {opt.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Custom Entry Option Trigger */}
            {!isCustomMode && (
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-[10px] font-extrabold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>+ Type Custom Category / Other Program</span>
              </button>
            )}

          </div>
        )}
      </div>

      {/* Selected Visa Option Detail Snippet */}
      {currentMatchedOption && !isOpen && (
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-[10px] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-emerald-900 font-extrabold">
            <span>{currentMatchedOption.category}</span>
            <span className="text-amber-800 font-bold">Est. {currentMatchedOption.processingTime}</span>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed">
            {currentMatchedOption.description}
          </p>
        </div>
      )}
    </div>
  );
};
