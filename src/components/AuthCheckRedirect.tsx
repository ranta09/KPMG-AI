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
            // Fix for legacy redirects if paths were renamed
            let targetPath = user.dashboardPath;
            let needsCookieUpdate = false;

            if (targetPath.includes('/dashboard/analyst')) {
                targetPath = targetPath.replace('/dashboard/analyst', '/dashboard/business');
                needsCookieUpdate = true;
            } else if (targetPath.includes('/dashboard/business-user')) {
                targetPath = targetPath.replace('/dashboard/business-user', '/dashboard/pm');
                needsCookieUpdate = true;
            }

            if (needsCookieUpdate) {
                // Update the cookie so we don't keep hitting the old path
                const updatedUser = { ...user, dashboardPath: targetPath };
                const Cookies = require('js-cookie');
                Cookies.set('kpmg_auth_user', JSON.stringify(updatedUser), { expires: 1 });
            }

            router.replace(targetPath);
        } else if (!user && pathname.startsWith("/dashboard")) {
            router.replace("/login");
        }

        setIsChecking(false);
    }, [pathname, router]);

    if (isChecking) return null; // Or return a silent loader here if needed

    return null;
}
