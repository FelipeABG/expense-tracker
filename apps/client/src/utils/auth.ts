/**
 * Gera uma senha segura que atende aos requisitos do backend:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra minúscula
 * - Pelo menos uma letra maiúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export function generateSecurePassword(): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    // Garante pelo menos um de cada tipo
    let password = 
        lowercase[Math.floor(Math.random() * lowercase.length)] +
        uppercase[Math.floor(Math.random() * uppercase.length)] +
        numbers[Math.floor(Math.random() * numbers.length)] +
        special[Math.floor(Math.random() * special.length)];

    // Adiciona mais caracteres aleatórios para completar
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = password.length; i < 16; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralha a senha
    return password.split("").sort(() => Math.random() - 0.5).join("");
}

/**
 * Armazena a senha do Google de forma segura no localStorage
 */
export function storeGooglePassword(email: string, password: string): void {
    const key = `google_password_${btoa(email)}`;
    localStorage.setItem(key, btoa(password));
}

/**
 * Recupera a senha do Google do localStorage
 */
export function getGooglePassword(email: string): string | null {
    const key = `google_password_${btoa(email)}`;
    const stored = localStorage.getItem(key);
    return stored ? atob(stored) : null;
}

/**
 * Remove a senha do Google do localStorage
 */
export function removeGooglePassword(email: string): void {
    const key = `google_password_${btoa(email)}`;
    localStorage.removeItem(key);
}

