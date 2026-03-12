"use client";

export type RoleType = "admin" | "developer" | "business-user" | "program-manager";
export type StatusType = "Active" | "Inactive" | "Pending" | "Approved" | "Rejected";

export interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: RoleType;
    status: StatusType;
    password?: string; // Only for local mock auth
    projects: number;
    createdAt: string;
    approvedAt?: string;
    approvedBy?: string;
}

const STORAGE_KEY = 'kpmg_users_db';

const defaultUsers: UserRecord[] = [
    { id: "USR-001", name: "Admin User", email: "admin@kpmg.com", role: "admin", status: "Approved", password: "admin", projects: 12, createdAt: new Date().toISOString() },
    { id: "USR-002", name: "Ujjwal Gupta", email: "ujjwal", role: "program-manager", status: "Approved", password: "ujjwal", projects: 4, createdAt: new Date().toISOString() },
    { id: "USR-003", name: "Developer", email: "developer@kpmg.com", role: "developer", status: "Approved", password: "developer", projects: 8, createdAt: new Date().toISOString() },
    { id: "USR-004", name: "Vikash Kumar", email: "vikash", role: "business-user", status: "Approved", password: "vikash", projects: 2, createdAt: new Date().toISOString() },
    // A couple of mock pending / rejected users to populate the admin dashboard initially
    { id: "USR-005", name: "Pending User", email: "pending@kpmg.com", role: "program-manager", status: "Pending", password: "password", projects: 0, createdAt: new Date().toISOString() },
    { id: "USR-006", name: "Rejected User", email: "rejected@kpmg.com", role: "developer", status: "Rejected", password: "password", projects: 0, createdAt: new Date().toISOString() },
];

export function getUsers(): UserRecord[] {
    if (typeof window === 'undefined') return defaultUsers;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    try {
        const users = JSON.parse(stored) as UserRecord[];

        // Migration: Ensure USR-002 is Ujjwal Gupta with correct credentials
        const ujjwalIdx = users.findIndex(u => u.id === "USR-002");
        if (ujjwalIdx !== -1) {
            const currentUjjwal = users[ujjwalIdx];
            if (currentUjjwal.name !== "Ujjwal Gupta" || currentUjjwal.password !== "ujjwal") {
                users[ujjwalIdx] = defaultUsers.find(u => u.id === "USR-002")!;
                saveUsers(users);
            }
        } else {
            // If USR-002 is missing for some reason, add him
            users.push(defaultUsers.find(u => u.id === "USR-002")!);
            saveUsers(users);
        }

        // Migration: Ensure USR-004 is Vikash Kumar with correct credentials and role
        const vikashIdx = users.findIndex(u => u.id === "USR-004");
        if (vikashIdx !== -1) {
            const currentVikash = users[vikashIdx];
            if (currentVikash.name !== "Vikash Kumar" || currentVikash.email !== "vikash" || currentVikash.password !== "vikash" || currentVikash.role !== "business-user") {
                users[vikashIdx] = defaultUsers.find(u => u.id === "USR-004")!;
                saveUsers(users);
            }
        } else {
            users.push(defaultUsers.find(u => u.id === "USR-004")!);
            saveUsers(users);
        }

        return users;
    } catch {
        return defaultUsers;
    }
}

export function saveUsers(users: UserRecord[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
}

export function registerUser(name: string, email: string, role: RoleType, password?: string): UserRecord {
    const users = getUsers();

    // Check if email exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered");
    }

    const newUser: UserRecord = {
        id: `USR-${(users.length + 1).toString().padStart(3, '0')}`,
        name,
        email,
        role,
        status: "Pending",
        password,
        projects: 0,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
}

export function findUserByCredentials(usernameOrEmail: string, password?: string): UserRecord | null {
    const users = getUsers();
    const identifier = usernameOrEmail.toLowerCase().trim();

    // Special bypass for the direct role keywords to make testing easy without typing full emails
    // E.g., if identifier is "admin" and password is "admin", we find the first admin.
    const directRoleMatch = users.find(u =>
        ((u.role === identifier && identifier !== 'business-user') ||
            (identifier === "business" && u.role === "program-manager") ||
            (identifier === "vikash" && u.role === "business-user")) &&
        u.password === password &&
        u.status === "Approved" // only exact matches on roles skip the email check, but must be approved
    );

    if (directRoleMatch) return directRoleMatch;

    return users.find(u =>
        u.email.toLowerCase() === identifier &&
        u.password === password
    ) || null;
}

export function approveUser(id: string, adminName: string = "System Admin"): UserRecord | null {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index].status = "Approved";
    users[index].approvedAt = new Date().toISOString();
    users[index].approvedBy = adminName;

    saveUsers(users);
    return users[index];
}

export function rejectUser(id: string): UserRecord | null {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index].status = "Rejected";
    saveUsers(users);
    return users[index];
}

export function deleteUser(id: string): void {
    const users = getUsers();
    const newUsers = users.filter(u => u.id !== id);
    saveUsers(newUsers);
}
