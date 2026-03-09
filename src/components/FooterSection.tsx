import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function FooterSection() {
    return (
        <footer className="bg-white text-slate-600 pt-16 pb-8 border-t border-slate-200">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Top Section: Links & Logo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                    {/* Logo Area */}
                    <div className="md:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <img src="/kpmg-logo.svg" alt="KPMG Logo" className="h-9 md:h-11 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-slate-900">Contact</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all">Contact Us</Link></li>
                            <li><Link href="#" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all">Submit RFP</Link></li>
                        </ul>
                    </div>

                    {/* Media Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-slate-900">Media</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all">Press Releases</Link></li>
                            <li><Link href="#" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all">Events</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-slate-900">Company</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://kpmg.com/xx/en/home/misc/kpmg-international-hotline.html" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all inline-flex items-center gap-1">
                                    KPMG International hotline <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </li>
                            <li><Link href="#" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all">Careers</Link></li>
                            <li><Link href="#" className="text-sm text-slate-600 hover:text-[#00338D] hover:underline transition-all">About Us</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Legal & Copyright */}
                <div className="border-t border-slate-200 pt-8">
                    <div className="flex justify-end mb-6">
                        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <li><Link href="#" className="text-xs font-semibold text-slate-600 hover:text-[#00338D] hover:underline">Legal</Link></li>
                            <li><Link href="#" className="text-xs font-semibold text-slate-600 hover:text-[#00338D] hover:underline">Privacy</Link></li>
                            <li><Link href="#" className="text-xs font-semibold text-slate-600 hover:text-[#00338D] hover:underline">Accessibility</Link></li>
                            <li><Link href="#" className="text-xs font-semibold text-slate-600 hover:text-[#00338D] hover:underline">Help</Link></li>
                            <li><button className="text-xs font-semibold text-slate-600 hover:text-[#00338D] hover:underline">Manage Choices</button></li>
                        </ul>
                    </div>

                    <div className="text-xs text-slate-500 leading-relaxed max-w-5xl">
                        <p className="mb-4">
                            © 2026 KPMG Assurance and Consulting Services LLP, an Indian Limited Liability Partnership and a member firm of the KPMG global organization of independent member firms affiliated with KPMG International Limited, a private English company limited by guarantee. All rights reserved.
                        </p>
                        <p>
                            For more detail about the structure of the KPMG global organization please visit{" "}
                            <a href="https://kpmg.com/governance" target="_blank" rel="noopener noreferrer" className="text-slate-700 font-medium hover:text-[#00338D] hover:underline inline-flex items-center gap-1">
                                https://kpmg.com/governance <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
