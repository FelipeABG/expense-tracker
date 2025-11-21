import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getAuthenticatedClient } from "../services/api";
import { Plus, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

interface User {
    id: number;
    email: string;
    roles: string[];
}

export function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [filters, setFilters] = useState({ email: "", role: "" });

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.User.getAll({
                query: undefined,
            });

            if (response.status === 200) {
                const usersList = response.body.users || [];
                setUsers(usersList);
                setFilteredUsers(usersList);
            }
        } catch (error: any) {
            console.error("Erro ao carregar usuários:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao carregar usuários";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.User.create({
                body: {
                    email: formData.email,
                    password: formData.password,
                },
            });

            if (response.status === 201) {
                toast.success("Usuário criado com sucesso!");
                setShowCreateForm(false);
                setFormData({ email: "", password: "" });
                loadUsers();
            } else {
                // Tratar erros de validação ou outros erros
                if (response.status === 400) {
                    // Erro de validação do Zod
                    const body = response.body as any;
                    if (body && typeof body === "object" && "bodyResult" in body) {
                        const bodyResult = body.bodyResult;
                        if (bodyResult?.issues && Array.isArray(bodyResult.issues)) {
                            // Extrair todas as mensagens de erro
                            const errorMessages = bodyResult.issues.map((issue: any) => issue.message);
                            // Mostrar todas as mensagens em um único toast
                            toast.error(
                                <div>
                                    <div className="font-semibold mb-1">Erros de validação:</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {errorMessages.map((msg: string, index: number) => (
                                            <li key={index} className="text-sm">{msg}</li>
                                        ))}
                                    </ul>
                                </div>,
                                { duration: 5000 }
                            );
                        } else if (body && typeof body === "object" && "message" in body) {
                            toast.error(String(body.message));
                        } else {
                            toast.error("Dados inválidos. Verifique os campos preenchidos.");
                        }
                    } else if (body && typeof body === "object" && "message" in body) {
                        toast.error(String(body.message));
                    } else {
                        toast.error("Erro ao criar usuário. Verifique os dados informados.");
                    }
                } else if (response.status === 409) {
                    if (response.body && typeof response.body === "object" && "message" in response.body) {
                        toast.error(String(response.body.message));
                    } else {
                        toast.error("Email já cadastrado");
                    }
                } else if (response.status === 403) {
                    toast.error("Você não tem permissão para criar usuários");
                } else {
                    toast.error(`Erro ao criar usuário (${response.status})`);
                }
            }
        } catch (error: any) {
            console.error("Erro ao criar usuário:", error);
            let errorMessage = "Erro ao criar usuário";
            
            // Tentar diferentes formatos de erro
            if (error?.body?.message) {
                errorMessage = error.body.message;
            } else if (error?.body?.error) {
                errorMessage = error.body.error;
            } else if (error?.response?.body?.message) {
                errorMessage = error.response.body.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }
            
            toast.error(errorMessage);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja deletar este usuário?")) {
            return;
        }

        try {
            const client = getAuthenticatedClient();
            const response = await client.User.deleteById({
                params: { id },
            });

            if (response.status === 200) {
                toast.success("Usuário deletado com sucesso!");
                loadUsers();
            }
        } catch (error: any) {
            console.error("Erro ao deletar usuário:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao deletar usuário";
            toast.error(errorMessage);
        }
    }

    useEffect(() => {
        let filtered = [...users];

        // Filtrar por email
        if (filters.email) {
            filtered = filtered.filter((user) =>
                user.email.toLowerCase().includes(filters.email.toLowerCase())
            );
        }

        // Filtrar por role
        if (filters.role) {
            filtered = filtered.filter((user) =>
                user.roles?.some((role) =>
                    role.toLowerCase().includes(filters.role.toLowerCase())
                )
            );
        }

        setFilteredUsers(filtered);
    }, [filters, users]);

    function clearFilters() {
        setFilters({ email: "", role: "" });
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Administração</h1>
                    <p className="text-muted-foreground">
                        Gerenciar usuários do sistema
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Novo Usuário
                </Button>
            </div>

            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Criar Novo Usuário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="usuario@exemplo.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="Senha segura"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate}>Criar</Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormData({ email: "", password: "" });
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Usuários ({filteredUsers.length} de {users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filtros */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="filter-email">Filtrar por Email</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="filter-email"
                                    type="text"
                                    value={filters.email}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="Buscar por email..."
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="filter-role">Filtrar por Role</Label>
                            <Input
                                id="filter-role"
                                type="text"
                                value={filters.role}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        role: e.target.value,
                                    })
                                }
                                placeholder="Admin, User..."
                            />
                        </div>
                        {(filters.email || filters.role) && (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Limpar
                            </Button>
                        )}
                    </div>

                    {/* Lista de usuários */}
                    {filteredUsers.length === 0 ? (
                        <p className="text-muted-foreground">
                            {users.length === 0
                                ? "Nenhum usuário encontrado"
                                : "Nenhum usuário corresponde aos filtros"}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 border rounded-md"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {user.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Roles: {user.roles?.join(", ") || "Nenhum"}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Deletar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

