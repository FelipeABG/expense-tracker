import { initClient } from "@ts-rest/core";
import { contract } from "contract";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = initClient(contract, {
    baseUrl: API_URL,
    baseHeaders: {
        "Content-Type": "application/json",
    },
    credentials: "include",
});

/**
 * Adiciona o token JWT aos headers das requisições
 */
export function setAuthToken(token: string): void {
    localStorage.setItem("token", token);
}

/**
 * Remove o token JWT
 */
export function removeAuthToken(): void {
    localStorage.removeItem("token");
}

/**
 * Obtém o token JWT do localStorage
 */
export function getAuthToken(): string | null {
    return localStorage.getItem("token");
}

/**
 * Cria um cliente API com autenticação
 */
export function getAuthenticatedClient() {
    const token = getAuthToken();
    
    return initClient(contract, {
        baseUrl: API_URL,
        baseHeaders: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
    });
}

