import { useEffect } from "react";

// Custom hook to make a menu disappear when clciked outside it
export function useClickOutside(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        function listener(e) {
            if (!ref.current || ref.current.contains(e.target)) {
                return;
            }

            handler();
        }

        document.addEventListener('mousedown', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [ref, handler, enabled]);
}