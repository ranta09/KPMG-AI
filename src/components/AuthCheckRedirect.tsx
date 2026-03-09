"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth";

export default function AuthCheckRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const user = getLoggedInUser();

        // Redirect logic
        if (user && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
            router.replace(user.dashboardPath);
        } else if (!user && pathname.startsWith("/dashboard")) {
            router.replace("/login");
        }

        setIsChecking(false);
    }, [pathname, router]);

    if (isChecking) return null; // Or return a silent loader here if needed

    return null;
}
