import { redirect } from "@tanstack/react-router";

import { useStore } from "@/store";
import { roleHome } from "@/lib/auth/roleHome";

/**
 * Keeps already-authenticated users off guest-only pages (sign-in, sign-up,
 * forgot-password) by redirecting them to their role's home.
 */
const useGuestGuard = () => {
    const { isAuthenticated, userRole } = useStore.getState();
    if (isAuthenticated) throw redirect({ to: roleHome(userRole) });
};

export default useGuestGuard;
