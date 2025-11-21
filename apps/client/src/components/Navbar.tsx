import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Home, LogOut, Shield } from "lucide-react";
import { removeAuthToken, getAuthToken } from "../services/api";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
    { path: "/inicio", label: "Dashboard", icon: Home },
    { path: "/despesas", label: "Despesas", icon: TrendingDown },
    { path: "/lucros", label: "Lucros", icon: TrendingUp },
];

const adminNavItem = {
    path: "/admin",
    label: "Admin",
    icon: Shield,
};

export function Navbar() {
    const location = useLocation();

    // Verificar se é admin pelo token
    const token = getAuthToken();
    let isAdmin = false;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            
            // Verificar se roles é array ou string
            if (Array.isArray(payload.roles)) {
                isAdmin = payload.roles.includes("Admin");
            } else if (typeof payload.roles === "string") {
                // Se for string, pode ser "Admin" ou "Admin,User" ou array serializado
                isAdmin = payload.roles.includes("Admin");
            }
            
            console.log("🔍 É Admin?", isAdmin);
        } catch (error) {
            console.error("Erro ao decodificar token:", error);
        }
    }

    const handleLogout = () => {
        removeAuthToken();
        window.location.href = "/";
    };

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold">Expense Tracker</h1>
                        <div className="flex space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                            {isAdmin && (() => {
                                const Icon = adminNavItem.icon;
                                return (
                                    <Link
                                        to={adminNavItem.path}
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            location.pathname === adminNavItem.path
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {adminNavItem.label}
                                    </Link>
                                );
                            })()}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

