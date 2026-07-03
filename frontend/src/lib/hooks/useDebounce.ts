import { useEffect, useState } from "react";

interface UseDebounce {
    <T>(value: T, delay?: number): T;
}

export const useDebounce: UseDebounce = <T,>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
};
