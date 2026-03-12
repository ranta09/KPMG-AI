"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Search, Check, AlertCircle, User } from "lucide-react";
import { getUsers, UserRecord } from "@/lib/usersStore";

interface ReviewEmailModalProps {
    onClose: () => void;
    onSend: (email: string) => void;
}

export default function ReviewEmailModal({ onClose, onSend }: ReviewEmailModalProps) {
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [suggestions, setSuggestions] = useState<UserRecord[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const allUsers = getUsers().filter(u => u.status === "Approved");

    useEffect(() => {
        if (search.trim().length > 0 && !selectedUser) {
            const filtered = allUsers.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);

            if (filtered.length === 0) {
                setError("No matching business user found. Please select a valid stakeholder from the list.");
            } else {
                setError(null);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            if (!selectedUser && search.trim().length > 0) {
                // Keep error if they typed something but nothing matched
            } else {
                setError(null);
            }
        }
    }, [search, selectedUser]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (user: UserRecord) => {
        setSelectedUser(user);
        setSearch(user.email);
        setShowSuggestions(false);
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (selectedUser && val !== selectedUser.email) {
            setSelectedUser(null);
        }
    };

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="bg-yellow-100 text-[#00338D] font-bold">{part}</span>
                : part
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                            <Send size={24} />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">Send For Review</h3>
                    <p className="text-sm text-slate-500 mb-6 font-medium">Enter the email address of the business stakeholder who needs to approve this document.</p>

                    <div className="space-y-4 relative" ref={dropdownRef}>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1 tracking-wider">Stakeholder Email</label>
                            <div className="relative group">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedUser ? "text-emerald-500" : "text-slate-400"}`} size={18} />
                                <input
                                    type="email"
                                    value={search}
                                    onChange={handleInputChange}
                                    placeholder="Search stakeholder by name or email"
                                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm transition-all outline-none ${selectedUser
                                            ? "border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20"
                                            : error
                                                ? "border-red-300 bg-red-50/10 focus:ring-2 focus:ring-red-200"
                                                : "border-slate-200 focus:ring-2 focus:ring-[#00338D]/20 focus:border-[#00338D]"
                                        }`}
                                    autoFocus
                                />
                                {selectedUser && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-[10px] font-bold">
                                        VALIDATED <Check size={14} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="py-2">
                                        {suggestions.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() => handleSelect(u)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                                                    <User size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {highlightText(u.name, search)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {highlightText(u.email, search)}
                                                    </p>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                    {u.role.toUpperCase()}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error Message */}
                        {error && !selectedUser && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"
                            >
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span className="text-xs font-semibold leading-relaxed">{error}</span>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-10">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all interactive"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => selectedUser && onSend(selectedUser.email)}
                            disabled={!selectedUser}
                            className="flex-1 px-4 py-4 bg-[#00338D] text-white font-bold text-sm rounded-2xl hover:bg-[#00266e] disabled:opacity-30 disabled:grayscale transition-all interactive shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2"
                        >
                            Send for Review <Send size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
