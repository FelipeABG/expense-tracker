import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { Expenses } from "./pages/Expenses";
import { Profits } from "./pages/Profits";
import { Goals } from "./pages/Goals";
import { getAuthToken } from "./services/api";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { Toaster } from "./components/ui/sonner";

const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = getAuthToken();
    return token ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            getAuthToken() ? (
                                <Navigate to="/inicio" replace />
                            ) : (
                                <Login />
                            )
                        }
                    />
                    <Route
                        path="/inicio"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/despesas"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Expenses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/lucros"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Profits />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/metas"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Goals />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
        </UserProvider>
        <Toaster />
        </ThemeProvider>
    );
}

export default App;
