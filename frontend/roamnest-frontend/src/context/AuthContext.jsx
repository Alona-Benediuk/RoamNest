import { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await authApi.getMe();
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const data = await authApi.login(email, password);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        // После входа сразу запрашиваем профиль, чтобы получить роль
        const userData = await authApi.getMe();
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try { await authApi.logout(); } catch (e) {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);