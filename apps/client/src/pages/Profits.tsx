import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getAuthenticatedClient } from "../services/api";
import { Plus, Trash2, Search, X, Edit, BarChart3, PieChart } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Profit {
    id: number;
    title: string;
    description: string;
    date: string;
    value: number;
    recurrence?: number;
}

export function Profits() {
    const [profits, setProfits] = useState<Profit[]>([]);
    const [filteredProfits, setFilteredProfits] = useState<Profit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
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
    const [chartView, setChartView] = useState<"monthly" | "yearly">("monthly");
    const [chartType, setChartType] = useState<"bar" | "pie">("bar");

    useEffect(() => {
        loadProfits();
    }, []);

    async function loadProfits() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.Revenue.getAllforUser();

            if (response.status === 200) {
                const profitsList = response.body || [];
                setProfits(profitsList);
                setFilteredProfits(profitsList);
            }
        } catch (error: any) {
            console.error("Erro ao carregar lucros:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao carregar lucros";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.Revenue.createForUser({
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
                toast.success("Lucro criado com sucesso!");
                setShowCreateForm(false);
                setFormData({
                    title: "",
                    description: "",
                    date: "",
                    value: "",
                    recurrence: "",
                });
                loadProfits();
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
                            "Erro ao criar lucro. Verifique os dados informados."
                        );
                    }
                } else {
                    toast.error(
                        `Erro ao criar lucro (${response.status})`
                    );
                }
            }
        } catch (error: any) {
            console.error("Erro ao criar lucro:", error);
            let errorMessage = "Erro ao criar lucro";

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

    async function handleUpdate(id: number) {
        try {
            const client = getAuthenticatedClient();
            const updateBody: any = {};
            
            if (formData.title) updateBody.title = formData.title;
            if (formData.description) updateBody.description = formData.description;
            if (formData.date) updateBody.date = formData.date;
            if (formData.value) updateBody.value = parseFloat(formData.value);
            if (formData.recurrence) {
                updateBody.recurrence = parseInt(formData.recurrence);
            }

            const response = await client.Revenue.updateForUser({
                params: { id },
                body: updateBody,
            });

            if (response.status === 200) {
                toast.success("Lucro atualizado com sucesso!");
                setEditingId(null);
                setFormData({
                    title: "",
                    description: "",
                    date: "",
                    value: "",
                    recurrence: "",
                });
                loadProfits();
            } else {
                if (response.status === 400) {
                    const body = response.body as any;
                    if (body && typeof body === "object" && "bodyResult" in body) {
                        const bodyResult = body.bodyResult;
                        if (bodyResult?.issues && Array.isArray(bodyResult.issues)) {
                            const errorMessages = bodyResult.issues.map(
                                (issue: any) => issue.message
                            );
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
                            "Erro ao atualizar lucro. Verifique os dados informados."
                        );
                    }
                } else if (response.status === 403) {
                    toast.error("Você não tem permissão para editar este lucro");
                } else if (response.status === 404) {
                    toast.error("Lucro não encontrado");
                } else {
                    toast.error(
                        `Erro ao atualizar lucro (${response.status})`
                    );
                }
            }
        } catch (error: any) {
            console.error("Erro ao atualizar lucro:", error);
            let errorMessage = "Erro ao atualizar lucro";

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

    function handleEdit(profit: Profit) {
        setEditingId(profit.id);
        setShowCreateForm(false);
        setFormData({
            title: profit.title,
            description: profit.description,
            date: profit.date,
            value: profit.value.toString(),
            recurrence: profit.recurrence?.toString() || "",
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({
            title: "",
            description: "",
            date: "",
            value: "",
            recurrence: "",
        });
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja deletar este lucro?")) {
            return;
        }

        try {
            const client = getAuthenticatedClient();
            const response = await client.Revenue.deleteForUser({
                params: { id },
            });

            if (response.status === 200) {
                toast.success("Lucro deletado com sucesso!");
                loadProfits();
            }
        } catch (error: any) {
            console.error("Erro ao deletar lucro:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao deletar lucro";
            toast.error(errorMessage);
        }
    }

    useEffect(() => {
        let filtered = [...profits];

        // Filtrar por busca (título ou descrição)
        if (filters.search) {
            filtered = filtered.filter(
                (profit) =>
                    profit.title
                        .toLowerCase()
                        .includes(filters.search.toLowerCase()) ||
                    profit.description
                        .toLowerCase()
                        .includes(filters.search.toLowerCase())
            );
        }

        // Filtrar por data
        if (filters.date) {
            filtered = filtered.filter((profit) => profit.date === filters.date);
        }

        setFilteredProfits(filtered);
    }, [filters, profits]);

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

    // Processar dados para o gráfico
    function getChartData() {
        const dataMap = new Map<string, number>();

        profits.forEach((profit) => {
            const date = new Date(profit.date);
            let key: string;

            if (chartView === "monthly") {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            } else {
                key = String(date.getFullYear());
            }

            const currentValue = dataMap.get(key) || 0;
            dataMap.set(key, currentValue + profit.value);
        });

        const chartData = Array.from(dataMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Formatar nomes para exibição
        return chartData.map((item) => {
            if (chartView === "monthly") {
                const [year, month] = item.name.split("-");
                const monthNames = [
                    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
                ];
                return {
                    ...item,
                    name: `${monthNames[parseInt(month) - 1]}/${year}`,
                };
            } else {
                return {
                    ...item,
                    name: item.name,
                };
            }
        });
    }

    const chartData = getChartData();
    const COLORS = ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#ef4444"];

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
                    <h1 className="text-3xl font-bold">Lucros</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus lucros e receitas
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Novo Lucro
                </Button>
            </div>

            {/* Gráfico */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Gráfico de Lucros</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="chart-view">Período:</Label>
                                <select
                                    id="chart-view"
                                    value={chartView}
                                    onChange={(e) =>
                                        setChartView(e.target.value as "monthly" | "yearly")
                                    }
                                    className="px-3 py-1 border rounded-md bg-background text-foreground text-sm"
                                >
                                    <option value="monthly">Mensal</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="chart-type">Tipo:</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={chartType === "bar" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setChartType("bar")}
                                        className="flex items-center gap-1"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        Barras
                                    </Button>
                                    <Button
                                        variant={chartType === "pie" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setChartType("pie")}
                                        className="flex items-center gap-1"
                                    >
                                        <PieChart className="h-4 w-4" />
                                        Pizza
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {chartData.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Nenhum lucro para exibir no gráfico
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            {chartType === "bar" ? (
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) =>
                                            formatCurrency(value)
                                        }
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="value"
                                        fill="#22c55e"
                                        name="Lucros"
                                    />
                                </BarChart>
                            ) : (
                                <RechartsPieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) =>
                                            formatCurrency(value)
                                        }
                                    />
                                    <Legend />
                                </RechartsPieChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {(showCreateForm || editingId !== null) && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingId !== null
                                ? "Editar Lucro"
                                : "Criar Novo Lucro"}
                        </CardTitle>
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
                                placeholder="Ex: Salário"
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
                                placeholder="Ex: Salário mensal"
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
                                placeholder="Ex: 30 (para receitas mensais)"
                            />
                        </div>
                        <div className="flex gap-2">
                            {editingId !== null ? (
                                <>
                                    <Button
                                        onClick={() => handleUpdate(editingId)}
                                    >
                                        Salvar
                                    </Button>
                                    <Button variant="outline" onClick={cancelEdit}>
                                        Cancelar
                                    </Button>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Lucros ({filteredProfits.length} de{" "}
                        {profits.length})
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

                    {/* Lista de lucros */}
                    {filteredProfits.length === 0 ? (
                        <p className="text-muted-foreground">
                            {profits.length === 0
                                ? "Nenhum lucro encontrado"
                                : "Nenhum lucro corresponde aos filtros"}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {filteredProfits.map((profit) => (
                                <div
                                    key={profit.id}
                                    className="flex items-center justify-between p-4 border rounded-md"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {profit.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {profit.description}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Data: {formatDate(profit.date)}
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(profit.value)}
                                            </span>
                                            {profit.recurrence && (
                                                <span className="text-muted-foreground">
                                                    Recorrência: a cada{" "}
                                                    {profit.recurrence} dias
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(profit)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(profit.id)
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

