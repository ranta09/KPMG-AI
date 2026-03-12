"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth";
import NeuralNetworkCanvas from "@/components/NeuralNetworkCanvas";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const { findUserByCredentials } = await import("@/lib/usersStore");
            const dbUser = findUserByCredentials(username, password);

            if (!dbUser) {
                setError("Invalid username or password");
                return;
            }

            if (dbUser.status === "Pending") {
                setError("Your account is awaiting admin approval.");
                return;
            }

            if (dbUser.status === "Rejected") {
                setError("Your account request was rejected. Please contact administrator.");
                return;
            }

            if (dbUser.status === "Approved") {
                // Set authenticated cookie session
                const user = loginUser(dbUser.role, dbUser.name, dbUser.name);
                router.push(user.dashboardPath);
            } else {
                setError("Account inactive or suspended.");
            }

        } catch (err) {
            setError("Error processing login.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
            {/* Background elements */}
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
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 text-sm mt-2">Sign in to KPMG Enterprise AI</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none transition-all text-slate-900 bg-white"
                                placeholder="Enter username"
                                required
                            />
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
                                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none transition-all text-slate-900 bg-white"
                                placeholder="Enter password"
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

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-[#00338D] hover:bg-[#001f5c] text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md"
                        >
                            Sign In
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[#00338D] font-semibold hover:underline">
                        Sign up
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
