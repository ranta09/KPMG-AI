"use client";

import Cookies from 'js-cookie';

// Roles: 'admin', 'business', 'developer', 'business-user'
export interface UserFlow {
    username: string;
    fullName: string;
    role: string;
    dashboardPath: string;
}

export function loginUser(role: string, username: string, fullName: string = "User") {
    let dashboardPath = '/dashboard/pm'; // Default
    if (role === 'admin') dashboardPath = '/dashboard/admin';
    if (role === 'developer') dashboardPath = '/dashboard/developer';
    if (role === 'business-user') dashboardPath = '/dashboard/business';
    if (role === 'program-manager') dashboardPath = '/dashboard/pm';

    const user: UserFlow = { username, fullName, role, dashboardPath };
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
