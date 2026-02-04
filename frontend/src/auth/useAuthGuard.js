// Bridge between API and UI

import { RefreshTokenExpiredError } from "../utils/errors";
import { useAuth } from "./AuthContext";

export function useAuthGuard() {
    const { logout } = useAuth();

    return async (fn) => {
        try {
            await fn();
        } catch (err) {
            if (err instanceof RefreshTokenExpiredError) {
                logout();
            } else {
                throw err;
            }
        }
    };
}