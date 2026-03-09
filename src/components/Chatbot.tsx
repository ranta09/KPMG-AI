"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Paperclip, Mic, Bot, User, Trash2 } from "lucide-react";
import { getLoggedInUser } from "@/lib/auth";

type Message = {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
};

type RoleData = {
    title: string;
    greeting: string;
    prompts: string[];
};

const roleConfig: Record<string, RoleData> = {
    admin: {
        title: "Admin AI",
        greeting: "Hello Admin. I can generate activity reports, check access levels, or summarize system health. How can I assist?",
        prompts: ["Show inactive users", "Generate monthly project summary", "Who has CRITICAL project access?"]
    },
    developer: {
        title: "Developer AI",
        greeting: "Hi Developer. Need help summarizing PDDs or generating API structures?",
        prompts: ["Summarize PRJ-001 requirements", "Generate REST API structure for inventory module", "Show my assigned issues"]
    },
    analyst: {
        title: "BA Assistant",
        greeting: "Hello Analyst. I can help convert notes to PDD or identify requirement gaps.",
        prompts: ["Convert this text to structured PDD", "Find gaps in onboarding requirement", "Suggest acceptance criteria"]
    },
    business: {
        title: "Business UI",
        greeting: "Hi there! I can help you check project statuses or submit new requirements.",
        prompts: ["What is the status of PRJ-003?", "Submit change request for login flow", "Clarify PDD requirement"]
    },
    default: {
        title: "AI Co-pilot",
        greeting: "Hello! How can I assist you with the Enterprise platform today?",
        prompts: ["What can you do?", "Help me navigate", "Show my profile"]
    }
};

const mockAIResponses: Record<string, string> = {
    "Show inactive users": "I found 14 inactive users in the last 30 days. Would you like me to export a CSV report or bulk deactivate them?",
    "Generate monthly project summary": "Generating... The platform saw 12 new projects this month. 4 are currently in UAT. Overall delivery velocity is up 18%.",
    "Who has CRITICAL project access?": "There are currently 6 users with explicit access to CRITICAL tagged projects: Sarah Chen, Michael Jenkins, and 4 System Admins.",
    "Summarize PRJ-001 requirements": "PRJ-001 (Global Marketing Platform) requires migrating the core CMS, integrating SSO via Okta, and establishing a new responsive UI framework using Next.js.",
    "Generate REST API structure for inventory module": "```json\n{\n  \"GET /api/inventory\": \"List items\",\n  \"POST /api/inventory\": \"Create item\",\n  \"PUT /api/inventory/:id\": \"Update item\"\n}\n```",
    "Convert this text to structured PDD": "I've structured your notes into a formal PDD format. The objective is clearly defined, but I recommend adding specific Acceptance Criteria for the login flow.",
    "Find gaps in onboarding requirement": "Analyzing... The onboarding requirement is missing error handling logic for duplicate email registrations and lacks a defined timeout for the 2FA SMS code.",
    "What is the status of PRJ-003?": "PRJ-003 (Legacy System Migration) is currently in the 'PDD Draft' stage. Leading manager is Robert Wilson.",
    "Submit change request for login flow": "I've drafted a Change Request (CR-892) for the login flow modifications. Would you like me to route this to the assigned Business Analyst for review?"
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [role, setRole] = useState<string>("default");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const user = getLoggedInUser();
        if (user && roleConfig[user.role]) {
            setRole(user.role);
            // Initialize with greeting if empty
            if (messages.length === 0) {
                setMessages([{
                    id: Date.now().toString(),
                    text: roleConfig[user.role].greeting,
                    sender: "ai",
                    timestamp: new Date()
                }]);
            }
        }
    }, [messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text, sender: "user", timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI network delay based on role complexity
        setTimeout(() => {
            const aiResponseText = mockAIResponses[text] || "I understand. I'm an enterprise AI mock, so I have limited contextual data for that specific request, but I've logged it for the next sprint.";

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: "ai",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200 + Math.random() * 800);
    };

    const config = roleConfig[role] || roleConfig.default;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#00338D] text-white p-4 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm tracking-wide">{config.title}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                        <span className="text-[10px] text-blue-100 uppercase tracking-wider font-medium">Enterprise Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setMessages([messages[0]])}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-200 hover:text-white"
                                    title="Clear Chat"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-200 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-gradient-to-br from-[#00A3E0] to-[#00338D] text-white'}`}>
                                            {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div>
                                            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                                    ? 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tr-sm'
                                                    : 'bg-[#F0F7FF] border border-blue-100 text-slate-800 shadow-sm rounded-tl-sm'
                                                }`}>
                                                {msg.text.includes('```') ? (
                                                    <pre className="bg-slate-900 text-blue-300 p-3 rounded-lg text-xs overflow-x-auto mt-1 border border-slate-800">
                                                        {msg.text.replace(/```\w*\n?|```/g, '')}
                                                    </pre>
                                                ) : msg.text}
                                            </div>
                                            <div className={`text-[10px] text-slate-400 mt-1.5 px-1 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A3E0] to-[#00338D] text-white flex items-center justify-center shadow-sm">
                                            <Bot size={14} />
                                        </div>
                                        <div className="bg-[#F0F7FF] border border-blue-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[42px]">
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#00338D]/40 rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#00338D]/60 rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#00338D]/80 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            {/* Prompts */}
                            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                                {config.prompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-[#00338D]/30 hover:bg-blue-50/50 text-slate-600 text-xs rounded-full transition-colors flex-shrink-0"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-end gap-2 relative">
                                <div className="absolute left-3 bottom-3 flex gap-2 text-slate-400">
                                    <button className="hover:text-[#00338D] transition-colors"><Paperclip size={18} /></button>
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(input);
                                        }
                                    }}
                                    placeholder="Message Enterprise AI..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-[#00338D] focus:border-[#00338D] transition-all min-h-[44px] max-h-[120px]"
                                    rows={1}
                                />
                                <div className="absolute right-3 bottom-3 flex gap-2 text-slate-400">
                                    <button className="hover:text-[#00338D] transition-colors"><Mic size={18} /></button>
                                </div>
                                <button
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim() || isTyping}
                                    className={`p-3 rounded-xl flex-shrink-0 transition-all shadow-sm ${input.trim() && !isTyping ? 'bg-[#00338D] text-white hover:bg-[#00266e]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#00338D] hover:bg-[#00266e] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#00338D]/30 transition-colors border-2 border-white"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
}
