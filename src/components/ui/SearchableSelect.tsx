"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    required = false,
    disabled = false,
    label,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const normalizedSearch = search.trim().toLowerCase();

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(normalizedSearch) ||
        opt.value.toLowerCase().includes(normalizedSearch)
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl text-sm transition-all outline-none bg-white
                    ${disabled ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "border-slate-300 text-slate-700 hover:border-slate-400 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] shadow-sm"}
                    ${isOpen ? "ring-2 ring-[#00338D] border-[#00338D]" : ""}
                `}
                disabled={disabled}
            >
                <span className={`truncate ${!selectedOption ? "text-slate-400" : ""}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-[300] min-w-full w-max max-w-[320px] mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden left-0"
                    >
                        <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                            <Search size={14} className="text-slate-400 ml-1" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 py-1"
                            />
                        </div>
                        <div className="max-h-[240px] overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                                            ${opt.value === value ? "bg-[#00338D]/5 text-[#00338D] font-medium" : "text-slate-700 hover:bg-slate-50"}
                                        `}
                                    >
                                        <span className="flex-1 break-words pr-2">{opt.label}</span>
                                        {opt.value === value && <Check size={14} className="text-[#00338D] flex-shrink-0" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
                                    No results found for "{search}"
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
