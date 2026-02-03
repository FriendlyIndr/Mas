// Knows if the user is logged in
// Reacts to session expiry

import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('http://localhost:3000/auth/me', {
                    credentials: 'include',
                });

                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                setIsAuthenticated(false);
            }
        };

        checkSession();
    }, []);
    
    const logout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Logout request failed:', err);
        } finally {
            setIsAuthenticated(false);
            navigate('/auth');
        }
    }

    const login = () => setIsAuthenticated(true);

    return (
        <AuthContext.Provider value={{ isAuthenticated, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);