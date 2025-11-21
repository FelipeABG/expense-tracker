import { createContext, useContext, useEffect, useState } from "react";
import { decodeJWT } from "../utils/jwt";

interface User {
    id: number;
    email: string;
    roles: string[];
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        function loadUser() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Obter dados do JWT (o token já contém todas as informações necessárias)
                const payload = decodeJWT(token);
                if (!payload) {
                    setLoading(false);
                    return;
                }

                setUser({
                    id: payload.sub || payload.id,
                    email: payload.email,
                    roles: payload.roles || [],
                });
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    const isAdmin = user?.roles.includes("Admin") || false;

    return (
        <UserContext.Provider value={{ user, loading, isAdmin }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

