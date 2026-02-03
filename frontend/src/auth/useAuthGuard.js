// Bridge between API and UI

import { SessionExpireError } from "../utils/errors";
import { useAuth } from "./AuthContext";

export function useAuthGuard() {
    const { logout, login, resolveAuth } = useAuth();

    return async (fn) => {
        try {
            await fn();
        } catch (err) {
            if (err instanceof SessionExpireError) {
                logout();
            } else {
                throw err;
            }
        }
    };
}