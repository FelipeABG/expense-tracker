/**
 * Decodifica o token JWT (sem verificar assinatura, apenas para ler o payload)
 */
export function decodeJWT(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Erro ao decodificar token:", error);
        return null;
    }
}

/**
 * Obtém os roles do usuário do token JWT
 */
export function getUserRoles(): string[] {
    const token = localStorage.getItem("token");
    if (!token) {
        return [];
    }

    const payload = decodeJWT(token);
    return payload?.roles || [];
}

/**
 * Verifica se o usuário é Admin
 */
export function isAdmin(): boolean {
    const roles = getUserRoles();
    return roles.includes("Admin");
}

