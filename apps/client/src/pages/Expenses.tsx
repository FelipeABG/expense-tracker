import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getAuthenticatedClient } from "../services/api";
import { Plus, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

interface Expense {
    id: number;
    title: string;
    description: string;
    date: string;
    value: number;
    recurrence?: number;
}

export function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        value: "",
        recurrence: "",
    });
    const [filters, setFilters] = useState({
        search: "",
        date: "",
    });

    useEffect(() => {
        loadExpenses();
    }, []);

    async function loadExpenses() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.Expense.getAllforUser();

            if (response.status === 200) {
                const expensesList = response.body || [];
                setExpenses(expensesList);
                setFilteredExpenses(expensesList);
            }
        } catch (error: any) {
            console.error("Erro ao carregar despesas:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao carregar despesas";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.Expense.createForUser({
                body: {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    value: parseFloat(formData.value),
                    ...(formData.recurrence && {
                        recurrence: parseInt(formData.recurrence),
                    }),
                },
            });

            if (response.status === 201) {
                toast.success("Despesa criada com sucesso!");
                setShowCreateForm(false);
                setFormData({
                    title: "",
                    description: "",
                    date: "",
                    value: "",
                    recurrence: "",
                });
                loadExpenses();
            } else {
                // Tratar erros de validação ou outros erros
                if (response.status === 400) {
                    // Erro de validação do Zod
                    const body = response.body as any;
                    if (body && typeof body === "object" && "bodyResult" in body) {
                        const bodyResult = body.bodyResult;
                        if (bodyResult?.issues && Array.isArray(bodyResult.issues)) {
                            // Extrair todas as mensagens de erro
                            const errorMessages = bodyResult.issues.map(
                                (issue: any) => issue.message
                            );
                            // Mostrar todas as mensagens em um único toast
                            toast.error(
                                <div>
                                    <div className="font-semibold mb-1">
                                        Erros de validação:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {errorMessages.map(
                                            (msg: string, index: number) => (
                                                <li key={index} className="text-sm">
                                                    {msg}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>,
                                { duration: 5000 }
                            );
                        } else if (
                            body &&
                            typeof body === "object" &&
                            "message" in body
                        ) {
                            toast.error(String(body.message));
                        } else {
                            toast.error(
                                "Dados inválidos. Verifique os campos preenchidos."
                            );
                        }
                    } else if (
                        body &&
                        typeof body === "object" &&
                        "message" in body
                    ) {
                        toast.error(String(body.message));
                    } else {
                        toast.error(
                            "Erro ao criar despesa. Verifique os dados informados."
                        );
                    }
                } else if (response.status === 403) {
                    toast.error("Você não tem permissão para criar despesas");
                } else {
                    toast.error(
                        `Erro ao criar despesa (${response.status})`
                    );
                }
            }
        } catch (error: any) {
            console.error("Erro ao criar despesa:", error);
            let errorMessage = "Erro ao criar despesa";

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
        if (!confirm("Tem certeza que deseja deletar esta despesa?")) {
            return;
        }

        try {
            const client = getAuthenticatedClient();
            const response = await client.Expense.deleteForUser({
                params: { id },
            });

            if (response.status === 200) {
                toast.success("Despesa deletada com sucesso!");
                loadExpenses();
            }
        } catch (error: any) {
            console.error("Erro ao deletar despesa:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao deletar despesa";
            toast.error(errorMessage);
        }
    }

    useEffect(() => {
        let filtered = [...expenses];

        // Filtrar por busca (título ou descrição)
        if (filters.search) {
            filtered = filtered.filter(
                (expense) =>
                    expense.title
                        .toLowerCase()
                        .includes(filters.search.toLowerCase()) ||
                    expense.description
                        .toLowerCase()
                        .includes(filters.search.toLowerCase())
            );
        }

        // Filtrar por data
        if (filters.date) {
            filtered = filtered.filter((expense) => expense.date === filters.date);
        }

        setFilteredExpenses(filtered);
    }, [filters, expenses]);

    function clearFilters() {
        setFilters({ search: "", date: "" });
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR").format(date);
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
                    <h1 className="text-3xl font-bold">Despesas</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas despesas
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nova Despesa
                </Button>
            </div>

            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Criar Nova Despesa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Ex: Aluguel"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input
                                id="description"
                                type="text"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Ex: Pagamento mensal do aluguel"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Data</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Valor</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.value}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            value: e.target.value,
                                        })
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recurrence">
                                Recorrência (dias) - Opcional
                            </Label>
                            <Input
                                id="recurrence"
                                type="number"
                                min="0"
                                value={formData.recurrence}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        recurrence: e.target.value,
                                    })
                                }
                                placeholder="Ex: 30 (para despesas mensais)"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate}>Criar</Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormData({
                                        title: "",
                                        description: "",
                                        date: "",
                                        value: "",
                                        recurrence: "",
                                    });
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
                        Despesas ({filteredExpenses.length} de{" "}
                        {expenses.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filtros */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="filter-search">
                                Filtrar por Título/Descrição
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="filter-search"
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search: e.target.value,
                                        })
                                    }
                                    placeholder="Buscar por título ou descrição..."
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="filter-date">Filtrar por Data</Label>
                            <Input
                                id="filter-date"
                                type="date"
                                value={filters.date}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        date: e.target.value,
                                    })
                                }
                            />
                        </div>
                        {(filters.search || filters.date) && (
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

                    {/* Lista de despesas */}
                    {filteredExpenses.length === 0 ? (
                        <p className="text-muted-foreground">
                            {expenses.length === 0
                                ? "Nenhuma despesa encontrada"
                                : "Nenhuma despesa corresponde aos filtros"}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {filteredExpenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-4 border rounded-md"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {expense.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {expense.description}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Data: {formatDate(expense.date)}
                                            </span>
                                            <span className="font-semibold text-red-600">
                                                {formatCurrency(expense.value)}
                                            </span>
                                            {expense.recurrence && (
                                                <span className="text-muted-foreground">
                                                    Recorrência: a cada{" "}
                                                    {expense.recurrence} dias
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(expense.id)
                                            }
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

