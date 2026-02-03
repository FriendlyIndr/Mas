// Route protection

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
    const { isAuthenticated, isAuthResolved } = useAuth();
    
    if (!isAuthResolved) {
        return <div>Checking session...</div>;
    }

    return isAuthenticated ? children : <Navigate to={'/auth'} replace={true}/>;
}