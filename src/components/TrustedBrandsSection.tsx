"use client";

import { motion } from "framer-motion";

const brands = [
    { name: "Stripe", src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" },
    { name: "Notion", src: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
    { name: "Shopify", src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" },
    { name: "HubSpot", src: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg" },
    { name: "Slack", src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg" },
    { name: "Figma", src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" }
];

// Double the list for seamless infinite scrolling
const marqueeBrands = [...brands, ...brands];

export default function TrustedBrandsSection() {
    return (
        <section className="py-16 bg-transparent relative z-10 border-y border-slate-100/50 overflow-hidden">
            <div className="container mx-auto px-6 mb-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-lg font-semibold text-slate-500 tracking-wide uppercase"
                >
                    Trusted by product teams everywhere
                </motion.h2>
            </div>

            <div
                className="relative flex overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}
            >
                <div className="flex w-max animate-marquee hover:pause whitespace-nowrap items-center">
                    {marqueeBrands.map((brand, index) => (
                        <div
                            key={index}
                            className="px-12 py-4 transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 cursor-default select-none flex items-center justify-center min-w-[200px]"
                        >
                            <img src={brand.src} alt={brand.name} className="h-8 md:h-10 w-auto object-contain pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
