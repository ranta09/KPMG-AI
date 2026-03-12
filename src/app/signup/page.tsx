"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Lock, Mail, Building, ArrowLeft, Eye, EyeOff } from "lucide-react";
import NeuralNetworkCanvas from "@/components/NeuralNetworkCanvas";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"program-manager" | "developer" | "business-user" | "admin" | "">("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !role || !password) {
            setError("All fields are required.");
            return;
        }

        try {
            // dynamically import to avoid SSR issues with localStorage inside nextjs
            import("@/lib/usersStore").then(({ registerUser }) => {
                try {
                    registerUser(name, email, role as any, password);
                    setSuccess(true);
                } catch (err: any) {
                    setError(err.message || "Registration failed");
                }
            });
        } catch (err: any) {
            setError("An error occurred during registration.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#00A3E0] opacity-10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#00338D] opacity-10 blur-[120px] pointer-events-none" />

            <NeuralNetworkCanvas />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 z-10"
            >
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#00338D] transition-colors mb-6 font-medium">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-[#00338D] text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-md">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-500 text-sm mt-2">Join KPMG Enterprise AI Platform</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Pending</h2>
                        <p className="text-slate-600 mb-6 text-sm">
                            Your account has been created successfully but requires <strong>admin approval</strong> before you can log in.
                        </p>
                        <Link href="/login" className="inline-flex items-center justify-center w-full bg-[#00338D] text-white py-2.5 rounded-lg font-semibold hover:bg-[#001f5c] transition-colors shadow-md">
                            Return to Login
                        </Link>
                    </motion.div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSignup}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] outline-none text-slate-900 bg-white"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] outline-none text-slate-900 bg-white"
                                    placeholder="john@enterprise.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Job Role</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Building size={18} />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] outline-none text-slate-900 bg-white appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select your role</option>
                                    <option value="program-manager">Program Manager</option>
                                    <option value="business-user">Business User</option>
                                    <option value="developer">Developer</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] outline-none text-slate-900 bg-white"
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#00338D] transition-colors interactive"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                className="w-full bg-[#00338D] hover:bg-[#001f5c] text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#00338D] font-semibold hover:underline">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
