"use client";

import Cookies from 'js-cookie';

// Roles: 'admin', 'business', 'developer', 'analyst'
export interface UserFlow {
    username: string;
    role: string;
    dashboardPath: string;
}

export function loginUser(role: string, username: string) {
    let dashboardPath = '/dashboard/business-user'; // Default
    if (role === 'admin') dashboardPath = '/dashboard/admin';
    if (role === 'developer') dashboardPath = '/dashboard/developer';
    if (role === 'analyst') dashboardPath = '/dashboard/analyst';

    const user: UserFlow = { username, role, dashboardPath };
    if (typeof window !== 'undefined') {
        Cookies.set('kpmg_auth_user', JSON.stringify(user), { expires: 1 });
    }
    return user;
}

export function logoutUser() {
    if (typeof window !== 'undefined') {
        Cookies.remove('kpmg_auth_user');
    }
}

export function getLoggedInUser(): UserFlow | null {
    if (typeof window !== 'undefined') {
        const userStr = Cookies.get('kpmg_auth_user');
        if (userStr) {
            try {
                return JSON.parse(userStr) as UserFlow;
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}
