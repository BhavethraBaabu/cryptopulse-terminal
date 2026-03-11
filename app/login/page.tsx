'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoginPage = () => {
    return (
        <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-500 border border-dark-400 mb-4 shadow-xl shadow-black/20">
                        <Image src="/logo.svg" alt="CoinPulse" width={48} height={48} className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
                    <p className="text-purple-100">Enter your credentials to access your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-dark-500 border border-dark-400 rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-purple-100 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-green-500 text-purple-100">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        className="block w-full pl-11 pr-4 py-3 bg-dark-400 border border-transparent rounded-xl text-white placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-medium text-purple-100">Password</label>
                                    <Link href="#" className="text-sm font-medium text-green-500 hover:text-green-400 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-green-500 text-purple-100">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        className="block w-full pl-11 pr-4 py-3 bg-dark-400 border border-transparent rounded-xl text-white placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-400 text-dark-900 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20 group"
                        >
                            Sign In
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-dark-400"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-dark-500 px-2 text-purple-100">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Auth */}
                        <div className="grid grid-cols-1 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 bg-dark-400 hover:bg-dark-400/80 text-white rounded-xl border border-dark-400 transition-all">
                                <Github size={20} />
                                GitHub
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-purple-100">
                    Don&apos;t have an account?{' '}
                    <Link href="#" className="font-semibold text-green-500 hover:text-green-400 transition-colors">
                        Create one now
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default LoginPage;
