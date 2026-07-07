import { useStore } from "@/store";
import { redirect } from "@tanstack/react-router";
import type { Role } from "@/lib/models/userModel";


const useRoleGuard = (allowed: Role | readonly Role[]) => {
    const { isAuthenticated, userRole } = useStore.getState();

    if (!isAuthenticated)
        throw redirect({ to: "/auth/sign-in" });

    const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

    if (!userRole || !allowedRoles.includes(userRole))
        throw redirect({ to: "/" });
};

export default useRoleGuard;
