// Knows if the user is logged in
// Reacts to session expiry

import { use, useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthResolved, setIsAuthResolved] = useState(false);

    const navigate = useNavigate();
    
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
            setIsAuthResolved(true);
            navigate('/auth');
        }
    }

    const login = () => {
        setIsAuthenticated(true);
        setIsAuthResolved(true);
    };

    function resolveAuth() {
        setIsAuthResolved(true);
    }

    useEffect(() => {
        async function bootstrapAuth() {
            try {
                const res = await fetch('http://localhost:3000/auth/me', {
                    credentials: 'include',
                });

                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsAuthResolved(true);
            }
        }

        bootstrapAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAuthResolved, logout, login, resolveAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);