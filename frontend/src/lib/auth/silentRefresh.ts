import { jwtDecode } from "jwt-decode";

import { useStore } from "@/store";
import { refreshAccessToken } from "@/lib/api/baseApi";

const REFRESH_SKEW_MS = 30_000;
let timer: ReturnType<typeof setTimeout> | null = null;

export function getTokenExpiryMs(token: string): number | null {
    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        return typeof exp === "number" ? exp * 1000 : null;
    } catch {
        return null;
    }
}

export function clearRefreshTimer() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}


export function scheduleTokenRefresh(token: string | null) {
    clearRefreshTimer();
    if (!token) return;

    const expiry = getTokenExpiryMs(token);
    if (expiry == null) return;

    const runRefresh = () => void refreshAccessToken().catch(() => {
        useStore.getState().logout();
    });

    const delay = expiry - Date.now() - REFRESH_SKEW_MS;
    if (delay <= 0) {
        runRefresh();
        return;
    }

    timer = setTimeout(runRefresh, delay);
}
