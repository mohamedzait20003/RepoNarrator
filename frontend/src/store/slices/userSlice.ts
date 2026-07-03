import type { UserProfile, Role } from "@/lib/models/userModel";

export interface UserSlice {
    userRole: Role | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    userData: UserProfile | null;

    logout: () => void;
    setAccessToken: (accessToken: string) => void;
    login: (role: Role, accessToken: string, userData: UserProfile) => void;
}

export const CreateUserSlice = (set: any): UserSlice => ({
    isAuthenticated: false,
    userData: null,
    userRole: null,
    accessToken: null,

    logout: () => set({
        isAuthenticated: false,
        userData: null,
        userRole: null,
        accessToken: null,
    }),

    login: (role, accessToken, userData) => set({
        isAuthenticated: true,
        userRole: role,
        accessToken,
        userData,
    }),

    setAccessToken: (accessToken) => set({ accessToken }),
});