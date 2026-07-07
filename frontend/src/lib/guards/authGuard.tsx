import { redirect } from "@tanstack/react-router";
import { useStore } from "@/store";

const useAuthGuard = () => {
    if (!useStore.getState().isAuthenticated)
        throw redirect({ to: "/auth/sign-in" });
};

export default useAuthGuard;
