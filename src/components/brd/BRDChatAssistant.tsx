"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, Check, ChevronRight, FileText, Search, RotateCcw, X, Edit2, Mic, Video, Paperclip, FolderDot } from "lucide-react";
import { findBestMatch } from "@/utils/fuzzyMatch";

interface Message {
    id: string;
    role: "assistant" | "user";
    content: string | React.ReactNode;
    type?: "text" | "options" | "summary" | "config-summary";
    options?: { label: string; value: string }[];
    stepLabel?: string;
}

interface BRDChatAssistantProps {
    onComplete: (data: any, refs: string[]) => void;
    onSwitchToForm: () => void;
    onClose: () => void;
    projectList: { code: string; name: string }[];
    buildTypes: Record<string, string[]>;
    existingBRDs: any[];
}

export function BRDChatAssistant({ onComplete, onSwitchToForm, onClose, projectList, buildTypes, existingBRDs }: BRDChatAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
    const [pendingOption, setPendingOption] = useState<{ label: string; value: string } | null>(null);
    const [optionFilter, setOptionFilter] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        projectCode: "",
        projectName: "",
        version: "v1.0",
        mainCategory: "",
        subCategory: "",
        requirement: "",
    });
    const [showStructure, setShowStructure] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);

    const playPopSound = () => {
        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (!AudioContextClass) return;

            const audioCtx = new AudioContextClass();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(350, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);

            // Cleanup context after sound finishes to avoid memory issues
            setTimeout(() => {
                if (audioCtx.state !== 'closed') {
                    audioCtx.close();
                }
            }, 200);
        } catch (e) {
            // Silently fail if audio is blocked by browser policy
        }
    };

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        // Try to restore from localStorage
        const savedState = localStorage.getItem("brd_chat_state");
        if (savedState) {
            try {
                const { messages: savedMessages, step: savedStep, formData: savedData, selectedRefs: savedRefs } = JSON.parse(savedState);
                if (savedMessages && savedMessages.length > 0) {
                    setMessages(savedMessages);
                    setStep(savedStep || 0);
                    setFormData(savedData || formData);
                    setSelectedRefs(savedRefs || []);
                    return; // Skip initial greeting if we restored state
                }
            } catch (e) {
                console.error("Failed to restore chat state:", e);
                localStorage.removeItem("brd_chat_state");
            }
        }

        // Initial greeting if no state restored
        addAssistantMessage("Step 1 — Document Title\nPlease provide a title for the Business Requirement Document.");
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (messages.length > 0) {
            const stateToSave = {
                messages,
                step,
                formData,
                selectedRefs
            };
            localStorage.setItem("brd_chat_state", JSON.stringify(stateToSave));
        }
    }, [messages, step, formData, selectedRefs]);

    const handleReset = () => {
        localStorage.removeItem("brd_chat_state");
        setMessages([]);
        setStep(0);
        setSelectedRefs([]);
        setFormData({
            title: "",
            projectCode: "",
            projectName: "",
            version: "v1.0",
            mainCategory: "",
            subCategory: "",
            requirement: "",
        });
        // re-trigger initial message
        const timer = setTimeout(() => {
            addAssistantMessage("Step 1 — Document Title\nPlease provide a title for the Business Requirement Document.");
        }, 100);
        return () => clearTimeout(timer);
    };

    const handleBack = () => {
        if (step === 0 || messages.length === 0) return;

        // Find the index of the last user message
        const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.role === "user");
        if (lastUserMsgIndex === -1) return;

        const actualIndex = messages.length - 1 - lastUserMsgIndex;

        // Move back one step
        const prevStep = Math.max(0, step - 1);
        setStep(prevStep);

        // Find the assistant message that preceded this user message to avoid duplicates
        let slicePoint = actualIndex;
        if (actualIndex > 0 && messages[actualIndex - 1].role === "assistant") {
            slicePoint = actualIndex - 1;
        }

        // Remove everything from the slice point onwards
        setMessages(prev => prev.slice(0, slicePoint));

        // Re-trigger the previous step options/prompt
        setTimeout(() => {
            repeatCurrentOptionsForStep(prevStep);
        }, 100);
    };

    const repeatCurrentOptionsForStep = (stepToRepeat: number) => {
        const options = getOptionsForStep(stepToRepeat);
        const labels: Record<number, string> = {
            0: "Step 1 — Document Title\nPlease provide a clear, descriptive title for the Business Requirement Document.",
            1: "Step 2 — Project Selection\nPlease select the enterprise project associated with this document.",
            2: "Step 3 — Solution Area\nDefine the primary Solution Area for this Requirement Document.",
            3: "Step 4 — Primary Technology\nIdentify the core technology stack focus within this solution area.",
            4: `Step 5 — Technology Version\nSpecify the version for **${formData.subCategory || "the technology"}**. The recommended baseline is **v1.0**.`,
            5: "Step 6 — Business Requirements\nPlease provide a comprehensive description of requirements, including strategic objectives, problem statement, and expected business outcomes.",
            6: "Step 7 — Source Material (Optional)\nProvide additional context by uploading source materials.",
            7: "Step 8 — Structure Recommendation\nReview the AI-architected structure optimized for this requirement set.",
            8: "Step 9 — Style References\nSelect existing projects to serve as style and context references."
        };

        if (msgTypeForStep(stepToRepeat) === "options") {
            addAssistantMessage(labels[stepToRepeat] || "Please select an option:", "options", options);
        } else {
            addAssistantMessage(labels[stepToRepeat] || "Please provide your input:");
        }
    };

    useEffect(() => {
        if (lastMessageRef.current) {
            // Use block: 'start' to ensure the top of the message is visible if it's long,
            // but wrap in a small timeout to ensure content has rendered
            const timer = setTimeout(() => {
                lastMessageRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: messages[messages.length - 1]?.role === "assistant" ? "start" : "end"
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isTyping]);

    const renderContent = (content: string) => {
        if (typeof content !== "string") return content;

        // Simple regex to handle **bold** text
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i} className="font-bold text-[#00338D]">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const handleJumpToStep = (targetStep: number, fieldName: string) => {
        setStep(targetStep);
        addAssistantMessage(`Adjusting **${fieldName}**. Please provide the updated information below.`);

        // Re-prompt based on step
        const prompStep = () => {
            switch (targetStep) {
                case 1: addAssistantMessage("Please select the enterprise project associated with this document.", "options", projectList.map(p => ({ label: `${p.code} — ${p.name}`, value: p.code }))); break;
                case 2: addAssistantMessage("Define the primary Solution Area for this Requirement Document.", "options", Object.keys(buildTypes).map(k => ({ label: k, value: k }))); break;
                case 3:
                    const techOptions = buildTypes[formData.mainCategory]?.map(t => ({ label: t, value: t })) || [];
                    addAssistantMessage("Identify the core technology stack focus within this solution area.", "options", techOptions);
                    break;
                case 4: addAssistantMessage("Step 5 — Technology Version\nDefine the specific version for **" + formData.subCategory + "**. The recommended baseline is **v1.0**.", "options", [{ label: "Use Recommended: v1.0", value: "v1.0" }]); break;
                case 5: addAssistantMessage("Step 6 — Business Requirements\nPlease provide a comprehensive description of requirements, including strategic objectives, problem statement, and expected business outcomes."); break;
                case 6:
                    addAssistantMessage("Step 7 — Source Material (Optional)\nUpload or select source files for AI to use during BRD generation.", "options", [
                        { label: "Audio Recording — Upload audio for AI transcription", value: "audio" },
                        { label: "Video Recording — Upload video for AI analysis", value: "video" },
                        { label: "Document — Upload PDF, DOCX, or TXT files", value: "document" },
                        { label: "Skip Source Material", value: "skip_source" }
                    ]);
                    break;
                case 7: addAssistantMessage("Step 8 — Structure Recommendation\nWould you like to review an AI-optimized structure for this requirement?", "options", [
                    { label: "View Recommendation", value: "yes_rec" },
                    { label: "Skip Recommendation", value: "no_rec" }
                ]); break;
                case 8:
                    addAssistantMessage("Step 9 — Style References\nSelect existing projects to serve as style and context references.", "options", [
                        ...existingBRDs.slice(0, 3).map(b => ({ label: `Reference: ${b.id}`, value: b.id })),
                        { label: "No References Required", value: "skip_refs" }
                    ]);
                    break;
            }
        }

        // Short delay to allow the "Adjusting..." message to breathe
        setTimeout(prompStep, 1000);
    };

    const addAssistantMessage = (content: string, type: Message["type"] = "text", options?: Message["options"]) => {
        setIsTyping(true);
        setTimeout(() => {
            const newMessage: Message = {
                id: Math.random().toString(36).substr(2, 9),
                role: "assistant",
                content,
                type,
                options
            };
            setMessages(prev => [...prev, newMessage]);
            setIsTyping(false);
            playPopSound();
        }, 800);
    };

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role: "user",
            content: text
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        processStep(text);
    };

    const processStep = (val: string) => {
        // Handle Confirmation Flow
        if (pendingOption) {
            const normalized = val.toLowerCase().trim();
            if (["yes", "y", "correct", "true", "yeah", "confirm"].includes(normalized)) {
                const confirmedVal = pendingOption.value;
                setPendingOption(null);
                executeStepAction(confirmedVal);
            } else if (["no", "n", "incorrect", "false", "nope", "wrong"].includes(normalized)) {
                setPendingOption(null);
                addAssistantMessage("Selection cancelled. Please select an option from the list or type exactly what you're looking for.");
                // Re-prompt current step options
                repeatCurrentOptions();
            } else {
                addAssistantMessage("Please confirm with 'Yes' or 'No'. Is the identified match correct?");
            }
            return;
        }

        executeStepAction(val);
    };

    const repeatCurrentOptions = () => {
        switch (step) {
            case 1:
                addAssistantMessage("Select the project associated with this BRD.", "options", projectList.map(p => ({ label: `${p.code} — ${p.name}`, value: p.code })));
                break;
            case 2:
                addAssistantMessage("Define the primary Solution Area for this document.", "options", Object.keys(buildTypes).map(k => ({ label: k, value: k })));
                break;
            case 3:
                const techOptions = buildTypes[formData.mainCategory]?.map(t => ({ label: t, value: t })) || [];
                addAssistantMessage("Identify the specific technology focus within the selected Solution Area.", "options", techOptions);
                break;
            case 4:
                addAssistantMessage("Specify the version for **" + formData.subCategory + "**. The recommended baseline is **v1.0**.", "options", [{ label: "Use Recommended: v1.0", value: "v1.0" }]);
                break;
            case 6:
                addAssistantMessage("Step 7 — Source Material (Optional)\nSelect source material type or skip to continue.", "options", [
                    { label: "Audio Recording — Upload audio for AI transcription", value: "audio" },
                    { label: "Video Recording — Upload video for AI analysis", value: "video" },
                    { label: "Document — Upload PDF, DOCX, or TXT files", value: "document" },
                    { label: "Skip Source Material", value: "skip_source" }
                ]);
                break;
            case 7:
                addAssistantMessage("Step 8 — Structure Recommendation\nWould you like to review an AI-optimized structure for this requirement?", "options", [
                    { label: "View Recommendation", value: "yes_rec" },
                    { label: "Skip Recommendation", value: "no_rec" }
                ]);
                break;
            case 8:
                addAssistantMessage("Step 9 — Style References\nSelect existing projects to serve as style and context references.", "options", [
                    ...existingBRDs.slice(0, 3).map(b => ({ label: `Reference: ${b.id}`, value: b.id })),
                    { label: "No References Required", value: "skip_refs" }
                ]);
                break;
        }
    };

    const executeStepAction = (val: string) => {
        // Don't increment beyond the final action step to allow looping (e.g. edit flow)
        const nextStep = step < 9 ? step + 1 : 9;

        // Handle Fuzzy Matching for Option-based steps
        if (msgTypeForStep(step) === "options") {
            const options = getOptionsForStep(step);
            const exactMatch = options.find(o => o.value.toLowerCase() === val.toLowerCase() || o.label.toLowerCase() === val.toLowerCase());

            if (!exactMatch) {
                // Step 4 (Technology Version) allows free-form input alongside buttons
                if (step !== 4) {
                    const { option, score } = findBestMatch(val, options);
                    if (option && score > 0.6) {
                        setPendingOption(option);
                        addAssistantMessage(`Match identified: **${option.label}**. Is this correct?`, "options", [
                            { label: "Yes, correct", value: "yes" },
                            { label: "No, incorrect", value: "no" }
                        ]);
                        return;
                    } else {
                        addAssistantMessage("Selection not recognized. Please select from the available options below.");
                        repeatCurrentOptions();
                        return;
                    }
                }
            } else {
                val = exactMatch.value; // Use the canonical value
            }
        }

        setStep(nextStep);

        switch (step) {
            case 0: // Title received
                setFormData(prev => ({ ...prev, title: val }));
                addAssistantMessage(`Document title identified: **${val}**.`);
                addAssistantMessage("Step 2 — Project Selection\nPlease select the enterprise project associated with this document.", "options", projectList.map(p => ({ label: `${p.code} — ${p.name}`, value: p.code })));
                break;
            case 1: // Project selected
                const proj = projectList.find(p => p.code === val);
                const projLabel = proj ? `${proj.code} — ${proj.name}` : val;
                setFormData(prev => ({ ...prev, projectCode: val, projectName: proj?.name || "" }));
                addAssistantMessage(`Project association validated: **${projLabel}**.`);
                addAssistantMessage("Step 3 — Solution Area\nDefine the primary Solution Area for this Requirement Document.", "options", Object.keys(buildTypes).map(k => ({ label: k, value: k })));
                break;
            case 2: // Solution Area selected
                setFormData(prev => ({ ...prev, mainCategory: val }));
                addAssistantMessage(`Primary Solution Area established: **${val}**.`);
                addAssistantMessage("", "config-summary");

                const techOptions = buildTypes[val]?.map(t => ({ label: t, value: t })) || [];
                addAssistantMessage("Step 4 — Primary Technology\nIdentify the core technology stack focus within this solution area.", "options", techOptions);
                break;
            case 3: // Technology selected
                setFormData(prev => ({ ...prev, subCategory: val }));
                addAssistantMessage(`Core technology stack confirmed: **${val}**.`);
                addAssistantMessage(`Step 5 — Technology Version\nSpecify the version for **${val}**. The recommended baseline is **v1.0**.`, "options", [{ label: "Use Recommended: v1.0", value: "v1.0" }]);
                break;
            case 4: // Version selected
                setFormData(prev => ({ ...prev, version: val }));
                addAssistantMessage(`Technology version confirmed: **${val}**.`);
                addAssistantMessage("Step 6 — Business Requirements\nPlease provide a comprehensive description of requirements, including strategic objectives, problem statement, and expected business outcomes.");
                break;
            case 5: // Requirements received
                if (val.length < 20) {
                    setStep(step); // Stay on current step
                    addAssistantMessage("Initial input analyzed as incomplete. Please provide a substantive description including:\n• Strategic Objectives\n• Operational Challenges\n• Targeted Business Outcomes");
                    return;
                }
                setFormData(prev => ({ ...prev, requirement: val }));
                addAssistantMessage("Functional requirements captured and validated.");
                addAssistantMessage("", "config-summary");
                addAssistantMessage("Step 7 — Source Material (Optional)\nProvide additional context by uploading source materials.", "options", [
                    { label: "Audio Recording — Upload audio for AI transcription", value: "audio" },
                    { label: "Video Recording — Upload video for AI analysis", value: "video" },
                    { label: "Document — Upload PDF, DOCX, or TXT files", value: "document" },
                    { label: "Skip Source Material", value: "skip_source" }
                ]);
                break;
            case 6: // Source Material selection
                if (val !== "skip_source") {
                    addAssistantMessage(`Source material type selected: **${val}**. You can drag and drop your files here or proceed.`);
                }
                addAssistantMessage("Step 8 — Structure Recommendation\nReview the AI-architected structure optimized for this requirement set.", "options", [
                    { label: "View Recommendation", value: "yes_rec" },
                    { label: "Skip Recommendation", value: "no_rec" }
                ]);
                break;
            case 7: // Recommendation choice
                if (val === "yes_rec") {
                    addAssistantMessage("AI Structural Recommendation Generated", "summary");
                } else {
                    addAssistantMessage("Step 9 — Style References\nSelect existing projects to serve as style and context references.", "options", [
                        ...existingBRDs.slice(0, 3).map(b => ({ label: `Reference: ${b.id}`, value: b.id })),
                        { label: "No References Required", value: "skip_refs" }
                    ]);
                }
                break;
            case 8: // Reference selection
                if (val !== "skip_refs" && val !== "Continue to References" && val !== "generate") {
                    setSelectedRefs(prev => [...prev, val]);
                    addAssistantMessage(`Reference project linked: **${val}**.`);
                    addAssistantMessage("Define additional reference context or finalize for generation.", "options", [
                        ...existingBRDs.filter(b => b.id !== val).slice(0, 2).map(b => ({ label: `Add Reference: ${b.id}`, value: b.id })),
                        { label: "Finalize Selection", value: "generate" }
                    ]);
                } else {
                    addAssistantMessage("Data validation complete. Document structural model is ready for generation.", "options", [
                        { label: "Generate Complete BRD", value: "confirm_gen" },
                        { label: "Review/Edit Inputs", value: "edit" }
                    ]);
                }
                break;
            case 9: // Final Action
                if (val === "generate" || val === "confirm_gen") {
                    addAssistantMessage("Execution started. Generating Business Requirement Document...", "summary");
                    // Trigger completion after a brief delay to show the "Execution started" message
                    setTimeout(() => onComplete(formData, selectedRefs), 800);
                } else if (val === "edit" || val === "Review/Edit Inputs") {
                    addAssistantMessage("Review and refine your configuration below. Select any field to modify its value, or proceed to finalize the generation.");
                    addAssistantMessage("", "config-summary");
                    addAssistantMessage("Ready to proceed?", "options", [
                        { label: "Generate Complete BRD", value: "confirm_gen" },
                        { label: "Review/Edit Inputs", value: "edit" }
                    ]);
                }
                break;
        }
    };

    const msgTypeForStep = (s: number): string => {
        const optionSteps = [1, 2, 3, 4, 6, 7, 8, 9];
        return optionSteps.includes(s) ? "options" : "text";
    };

    const getOptionsForStep = (s: number): { label: string; value: string }[] => {
        switch (s) {
            case 1: return projectList.map(p => ({ label: `${p.code} — ${p.name}`, value: p.code }));
            case 2: return Object.keys(buildTypes).map(k => ({ label: k, value: k }));
            case 3: return buildTypes[formData.mainCategory]?.map(t => ({ label: t, value: t })) || [];
            case 4: return [{ label: "Use Recommended: v1.0", value: "v1.0" }];
            case 6: return [
                { label: "Audio Recording — Upload audio for AI transcription", value: "audio" },
                { label: "Video Recording — Upload video for AI analysis", value: "video" },
                { label: "Document — Upload PDF, DOCX, or TXT files", value: "document" },
                { label: "Skip Source Material", value: "skip_source" }
            ];
            case 7: return [{ label: "View Recommendation — AI structural guidance", value: "yes_rec" }, { label: "Skip Recommendation — Use baseline structure", value: "no_rec" }];
            case 8: return [
                ...existingBRDs.slice(0, 3).map(b => ({ label: `Reference: ${b.id}`, value: b.id })),
                { label: "No References Required", value: "skip_refs" },
                { label: "Finalize Selection", value: "generate" }
            ];
            case 9: return [
                { label: "Generate Complete BRD", value: "confirm_gen" },
                { label: "Review/Edit Inputs", value: "edit" }
            ];
            default: return [];
        }
    };

    const handleOptionSelect = (option: { label: string; value: string }) => {
        setOptionFilter(""); // Clear filter on selection
        handleSend(option.value);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#00338D]" />
                    <div>
                        <h3 className="text-xs font-bold text-slate-800">BRD Generator</h3>
                        <p className="text-[9px] text-slate-500 font-medium whitespace-nowrap">Create smart requirements</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-1.5 text-slate-400 hover:text-[#00338D] hover:bg-[#00338D]/5 rounded-lg transition-all flex items-center gap-1.5 interactive group"
                        title="Reset Conversation"
                    >
                        <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                        <span className="text-[10px] font-bold">Reset</span>
                    </button>
                    <button
                        onClick={onSwitchToForm}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-all interactive"
                    >
                        Manual Form
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors interactive text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            ref={messages.indexOf(msg) === messages.length - 1 ? lastMessageRef : null}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "assistant" ? "bg-[#00338D] text-white" : "bg-emerald-500 text-white"
                                    }`}>
                                    {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="space-y-3">
                                    <div className={`p-4 rounded-2xl text-sm shadow-sm relative overflow-hidden ${msg.role === "assistant"
                                        ? "bg-white/80 backdrop-blur-md border border-white/50 text-slate-700 rounded-tl-none ring-1 ring-slate-200/50"
                                        : "bg-gradient-to-br from-[#00338D] to-[#00266e] text-white rounded-tr-none shadow-[#00338D]/20 shadow-lg"
                                        }`}>
                                        {msg.role === "assistant" && typeof msg.content === "string" && msg.content.startsWith("Step") ? (
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-[#00338D] uppercase tracking-wider bg-[#00338D]/5 py-1 px-2 rounded-md border border-[#00338D]/10 inline-block mb-1">
                                                    {msg.content.split('\n')[0]}
                                                </div>
                                                <div className="text-slate-700 leading-relaxed font-medium">
                                                    {renderContent(msg.content.split('\n').slice(1).join('\n'))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap leading-relaxed font-medium">
                                                {renderContent(msg.content as string)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Config Summary Panel */}
                                    {msg.type === "config-summary" && (
                                        <div className="bg-[#00338D]/5 backdrop-blur-sm border border-[#00338D]/10 rounded-2xl p-5 space-y-3 shadow-inner">
                                            <div className="flex items-center gap-2 pb-3 border-b border-[#00338D]/10 text-[#00338D]">
                                                <FileText size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Current BRD Configuration</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-y-1">
                                                {[
                                                    { label: "Title", value: formData.title, step: 0 },
                                                    { label: "Project", value: formData.projectCode, step: 1 },
                                                    { label: "Solution Area", value: formData.mainCategory, step: 2 },
                                                    { label: "Technology", value: formData.subCategory, step: 3 },
                                                    { label: "Version", value: formData.version, step: 4 },
                                                ].map((field, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleJumpToStep(field.step, field.label)}
                                                        className="flex justify-between items-center py-2 px-3 hover:bg-white/50 rounded-xl transition-all group/field interactive text-left"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">{field.label}</span>
                                                            <span className="text-slate-700 font-bold text-[11px] truncate max-w-[150px]">{field.value || "—"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                                                            <span className="text-[9px] font-bold text-[#00338D]">Change</span>
                                                            <Edit2 size={10} className="text-[#00338D]" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                    {msg.type === "options" && msg.options && (
                                        <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in slide-in-from-left-2 transition-all">
                                            {/* Quick Search for long lists or Project Selection (Step 2) */}
                                            {(msg.options.length > 5 || (typeof msg.content === "string" && msg.content.includes("Step 2"))) && msg.id === messages[messages.length - 1]?.id && (
                                                <div className="relative mb-2">
                                                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Filter options..."
                                                        value={optionFilter}
                                                        onChange={(e) => setOptionFilter(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] focus:ring-1 focus:ring-[#00338D] outline-none transition-all font-bold placeholder:text-slate-300 shadow-sm"
                                                    />
                                                </div>
                                            )}

                                            <div className={`grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 ${msg.options.length >= 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                                                {msg.options
                                                    .filter(opt =>
                                                        msg.id !== messages[messages.length - 1]?.id ||
                                                        opt.label.toLowerCase().includes(optionFilter.toLowerCase())
                                                    )
                                                    .map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleOptionSelect(opt)}
                                                            className={`text-left border transition-all shadow-sm flex items-center justify-between interactive group font-bold
                                                                ${msg.options && msg.options.length > 4
                                                                    ? "px-3 py-2 bg-white border-slate-100 text-slate-600 hover:border-[#00338D]/30 hover:bg-white hover:text-[#00338D] rounded-lg text-[10px] h-full"
                                                                    : "px-4 py-2.5 bg-white border-slate-200 text-slate-700 hover:border-[#00338D]/40 hover:bg-[#00338D]/5 hover:text-[#00338D] rounded-xl text-[11px]"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                {opt.value === 'audio' && <Mic size={14} className="text-[#00338D] flex-shrink-0" />}
                                                                {opt.value === 'video' && <Video size={14} className="text-purple-500 flex-shrink-0" />}
                                                                {opt.value === 'document' && <FileText size={14} className="text-emerald-500 flex-shrink-0" />}
                                                                {opt.value === 'v1.0' && <FolderDot size={14} className="text-[#00338D] flex-shrink-0" />}
                                                                {opt.value === 'yes_rec' && <Sparkles size={14} className="text-amber-500 flex-shrink-0" />}
                                                                {opt.value === 'no_rec' && <X size={14} className="text-slate-400 flex-shrink-0" />}
                                                                {opt.value === 'skip_source' && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
                                                                <div className="flex flex-col">
                                                                    <span className="line-clamp-1">{opt.label.split(' — ')[0]}</span>
                                                                    {opt.label.includes(' — ') && <span className="text-[8px] text-slate-400 font-medium line-clamp-1">{opt.label.split(' — ')[1]}</span>}
                                                                </div>
                                                            </div>
                                                            {opt.value !== 'audio' && opt.value !== 'video' && opt.value !== 'document' && opt.value !== 'skip_source' && (
                                                                <ChevronRight size={10} className="text-slate-300 group-hover:text-[#00338D] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                                                            )}
                                                        </button>
                                                    ))}

                                                {msg.options.length > 5 && msg.id === messages[messages.length - 1]?.id &&
                                                    msg.options.filter(opt => opt.label.toLowerCase().includes(optionFilter.toLowerCase())).length === 0 && (
                                                        <div className="text-[10px] text-slate-400 text-center py-4 italic font-bold bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                            No matching options found.
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    )}

                                    {msg.type === "summary" && step === 7 && (
                                        <div className="bg-gradient-to-br from-white to-slate-50 border border-[#00338D]/20 rounded-2xl p-6 space-y-5 shadow-xl ring-1 ring-[#00338D]/5 relative overflow-hidden group">
                                            {/* Decorative Background Element */}
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00338D]/5 rounded-full blur-2xl group-hover:bg-[#00338D]/10 transition-colors" />

                                            <div className="space-y-1 relative">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                                                        {formData.mainCategory || "S/4HANA Finance"} Structure
                                                    </h4>
                                                    <button
                                                        onClick={() => setShowStructure(!showStructure)}
                                                        className="text-[10px] font-bold text-[#00338D] hover:underline bg-[#00338D]/5 px-2 py-1 rounded-md transition-colors mr-1"
                                                    >
                                                        {showStructure ? "Hide" : "View"}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-[#00338D] bg-[#00338D]/10 px-2 py-0.5 rounded-full tracking-wider uppercase">AI Optimized</span>
                                                    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">BRD-AI-REC</span>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {showStructure && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="space-y-2 overflow-hidden border-t border-slate-100 pt-3"
                                                    >
                                                        {[
                                                            "1. Document Control",
                                                            "2. Executive Summary",
                                                            "3. Purpose and Scope",
                                                            "4. System Landscape",
                                                            "5. Business Process Overview",
                                                            "6. Detailed Business Process",
                                                            "7. Business Requirements",
                                                            "8. Functional Requirements",
                                                            "9. RICEFW Classification",
                                                            "10. Interface Design",
                                                            "11. Data Requirements",
                                                            "12. Security and Authorization",
                                                            "13. Reporting Requirements",
                                                            "14. Error Handling",
                                                            "15. Performance Requirements",
                                                            "16. Test Strategy",
                                                            "17. Transport Management",
                                                            "18. Open Points",
                                                            "19. Appendices"
                                                        ].map((s, i) => (
                                                            <div key={i} className="flex gap-2 items-center text-[9px] text-slate-600 font-bold">
                                                                <div className="w-1 h-1 rounded-full bg-[#00338D]/40" />
                                                                {s}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 relative">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                                            <div className="w-3 h-3 rounded-full bg-[#00338D]/20" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSend("Continue to References")}
                                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-all interactive"
                                                    >
                                                        Skip
                                                    </button>
                                                    <button
                                                        onClick={() => handleSend("Continue to References")}
                                                        className="px-5 py-2 bg-[#00338D] text-white rounded-xl text-[11px] font-bold hover:bg-[#00266e] transition-all flex items-center gap-2 shadow-lg shadow-[#00338D]/20 active:scale-[0.98] interactive"
                                                    >
                                                        Continue <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {msg.type === "summary" && step >= 8 && (
                                        <div className="bg-white/90 backdrop-blur-lg border border-[#00338D]/20 rounded-2xl p-5 space-y-3 shadow-xl ring-1 ring-[#00338D]/5">
                                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-emerald-600">
                                                <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                    <Check size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 tracking-tight">Requirement Gathering Complete</span>
                                            </div>

                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest py-1 border-b border-slate-50">Next Actions</div>

                                            <div className="flex flex-col gap-2 pt-1">
                                                <button
                                                    onClick={() => onComplete(formData, selectedRefs)}
                                                    className="w-full py-2.5 bg-gradient-to-r from-[#00338D] to-[#005CB9] text-white rounded-xl text-xs font-bold hover:from-[#00266e] hover:to-[#00338D] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00338D]/30 active:scale-[0.98] interactive"
                                                >
                                                    <Sparkles size={14} /> Generate Complete BRD
                                                </button>
                                                <button
                                                    onClick={() => handleSend("edit")}
                                                    className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 interactive"
                                                >
                                                    Edit Inputs
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-[#00338D] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Bot size={16} />
                                </div>
                                <div className="p-3 bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none shadow-sm italic text-xs flex gap-1">
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce delay-75">.</span>
                                    <span className="animate-bounce delay-150">.</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2">
                    {step > 0 && (
                        <button
                            onClick={handleBack}
                            className="p-2.5 text-slate-400 hover:text-[#00338D] hover:bg-slate-50 border border-slate-200 rounded-xl transition-all interactive group"
                            title="Go Back"
                        >
                            <RotateCcw size={18} className="group-active:rotate-[-45deg] transition-transform" />
                        </button>
                    )}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={isTyping ? "AI is thinking..." : "Type your message..."}
                            disabled={isTyping}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-transparent outline-none transition-all"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#00338D] text-white rounded-lg flex items-center justify-center hover:bg-[#00266e] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md mt-0"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <p className="text-[10px] text-slate-400">AI Assistant will guide you through the process</p>
                </div>
            </div>
        </div>
    );
}
