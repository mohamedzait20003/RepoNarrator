import { redirect } from "@tanstack/react-router";

import { useStore } from "@/store";
import { redirectHome } from "@/lib/auth/account";
import type { Role } from "@/lib/models/userModel";

/**
 * Restricts a route to the given role(s). Anonymous users go to sign-in;
 * authenticated users with the wrong role are bounced to their own home
 * (so a user hitting /admin lands on their customer dashboard, and vice-versa).
 */
const useRoleGuard = (allowed: Role | readonly Role[]) => {
    const { isAuthenticated, userRole, userData } = useStore.getState();

    if (!isAuthenticated)
        throw redirect({ to: "/auth/sign-in" });

    const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

    if (!userRole || !allowedRoles.includes(userRole))
        redirectHome(userRole, userData?.name ?? null);
};

export default useRoleGuard;
