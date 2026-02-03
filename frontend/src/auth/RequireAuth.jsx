// Route protection

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to={'/auth'} replace={true}/>;
}