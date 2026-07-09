import { useStore } from "@/store";
import { redirectHome } from "@/lib/auth/account";

/**
 * Keeps already-authenticated users off guest-only pages (sign-in, sign-up,
 * forgot-password) by redirecting them to their role's home.
 */
const useGuestGuard = () => {
    const { isAuthenticated, userRole, userData } = useStore.getState();
    if (isAuthenticated) redirectHome(userRole, userData?.name ?? null);
};

export default useGuestGuard;
