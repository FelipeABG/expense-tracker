import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getAuthenticatedClient } from "../services/api";
import { Plus, Trash2, Edit, Target } from "lucide-react";
import { toast } from "sonner";

interface Goal {
    id: number;
    description: string;
    value: number;
    limitDate: string;
}

export function Goals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        description: "",
        value: "",
        limitDate: "",
    });
    const [balance, setBalance] = useState(0);
    const [monthlyAverage, setMonthlyAverage] = useState(0);

    useEffect(() => {
        loadGoals();
        loadBalance();
    }, []);

    async function loadBalance() {
        try {
            const client = getAuthenticatedClient();
            
            // Buscar despesas
            const expensesResponse = await client.Expense.getAllforUser();
            const expenses = expensesResponse.status === 200 ? (expensesResponse.body || []) : [];
            
            // Buscar lucros
            const revenuesResponse = await client.Revenue.getAllforUser();
            const revenues = revenuesResponse.status === 200 ? (revenuesResponse.body || []) : [];

            const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.value, 0);
            const totalRevenues = revenues.reduce((sum: number, item: any) => sum + item.value, 0);
            const currentBalance = totalRevenues - totalExpenses;
            
            setBalance(currentBalance);

            // Calcular média mensal de lucros (últimos 3 meses ou todos se tiver menos)
            const now = new Date();
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            
            const recentRevenues = revenues.filter((rev: any) => {
                const revDate = new Date(rev.date);
                return revDate >= threeMonthsAgo;
            });

            if (recentRevenues.length > 0) {
                const recentTotal = recentRevenues.reduce((sum: number, item: any) => sum + item.value, 0);
                const months = Math.max(1, Math.ceil((now.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                setMonthlyAverage(recentTotal / months);
            } else {
                // Se não tiver receitas recentes, usar média de todas
                const allMonths = Math.max(1, Math.ceil((now.getTime() - new Date(Math.min(...revenues.map((r: any) => new Date(r.date).getTime()))).getTime()) / (1000 * 60 * 60 * 24 * 30)));
                setMonthlyAverage(revenues.length > 0 ? totalRevenues / allMonths : 0);
            }
        } catch (error) {
            console.error("Erro ao carregar saldo:", error);
        }
    }

    async function loadGoals() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.FinancialGoal.getAllforUser();

            if (response.status === 200) {
                setGoals(response.body || []);
            }
        } catch (error: any) {
            console.error("Erro ao carregar metas:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao carregar metas";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        try {
            const client = getAuthenticatedClient();
            const response = await client.FinancialGoal.createForUser({
                body: {
                    description: formData.description,
                    value: parseFloat(formData.value),
                    limitDate: formData.limitDate,
                },
            });

            if (response.status === 201) {
                toast.success("Meta criada com sucesso!");
                setShowCreateForm(false);
                setFormData({
                    description: "",
                    value: "",
                    limitDate: "",
                });
                loadGoals();
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
                            "Erro ao criar meta. Verifique os dados informados."
                        );
                    }
                } else {
                    toast.error(
                        `Erro ao criar meta (${response.status})`
                    );
                }
            }
        } catch (error: any) {
            console.error("Erro ao criar meta:", error);
            let errorMessage = "Erro ao criar meta";

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
            
            if (formData.description) updateBody.description = formData.description;
            if (formData.value) updateBody.value = parseFloat(formData.value);
            if (formData.limitDate) updateBody.limitDate = formData.limitDate;

            const response = await client.FinancialGoal.updateForUser({
                params: { id },
                body: updateBody,
            });

            if (response.status === 200) {
                toast.success("Meta atualizada com sucesso!");
                setEditingId(null);
                setFormData({
                    description: "",
                    value: "",
                    limitDate: "",
                });
                loadGoals();
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
                            "Erro ao atualizar meta. Verifique os dados informados."
                        );
                    }
                } else if (response.status === 403) {
                    toast.error("Você não tem permissão para editar esta meta");
                } else if (response.status === 404) {
                    toast.error("Meta não encontrada");
                } else {
                    toast.error(
                        `Erro ao atualizar meta (${response.status})`
                    );
                }
            }
        } catch (error: any) {
            console.error("Erro ao atualizar meta:", error);
            let errorMessage = "Erro ao atualizar meta";

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

    function handleEdit(goal: Goal) {
        setEditingId(goal.id);
        setShowCreateForm(false);
        setFormData({
            description: goal.description,
            value: goal.value.toString(),
            limitDate: goal.limitDate,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({
            description: "",
            value: "",
            limitDate: "",
        });
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja deletar esta meta?")) {
            return;
        }

        try {
            const client = getAuthenticatedClient();
            const response = await client.FinancialGoal.deleteForUser({
                params: { id },
            });

            if (response.status === 200) {
                toast.success("Meta deletada com sucesso!");
                loadGoals();
            }
        } catch (error: any) {
            console.error("Erro ao deletar meta:", error);
            const errorMessage =
                error.body?.message ||
                error.message ||
                "Erro ao deletar meta";
            toast.error(errorMessage);
        }
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

    // Calcular tempo para alcançar a meta
    function calculateTimeToReach(goalValue: number): string {
        const remaining = goalValue - balance;
        
        if (remaining <= 0) {
            return "Meta já alcançada!";
        }

        if (monthlyAverage <= 0) {
            return "Não é possível calcular (sem receitas)";
        }

        const months = remaining / monthlyAverage;
        
        if (months < 1) {
            const days = Math.ceil(months * 30);
            return `Aproximadamente ${days} dia${days !== 1 ? 's' : ''}`;
        } else if (months < 12) {
            const wholeMonths = Math.floor(months);
            const days = Math.ceil((months - wholeMonths) * 30);
            if (days > 0) {
                return `Aproximadamente ${wholeMonths} mês${wholeMonths !== 1 ? 'es' : ''} e ${days} dia${days !== 1 ? 's' : ''}`;
            }
            return `Aproximadamente ${wholeMonths} mês${wholeMonths !== 1 ? 'es' : ''}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = Math.floor(months % 12);
            if (remainingMonths > 0) {
                return `Aproximadamente ${years} ano${years !== 1 ? 's' : ''} e ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`;
            }
            return `Aproximadamente ${years} ano${years !== 1 ? 's' : ''}`;
        }
    }

    function getProgress(goalValue: number): number {
        if (goalValue <= 0) return 100;
        const progress = (balance / goalValue) * 100;
        return Math.min(100, Math.max(0, progress));
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
                    <h1 className="text-3xl font-bold">Metas Financeiras</h1>
                    <p className="text-muted-foreground">
                        Defina e acompanhe seus objetivos financeiros
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nova Meta
                </Button>
            </div>

            {/* Card de Saldo e Média Mensal */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Saldo Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(balance)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Média Mensal de Receitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(monthlyAverage)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Baseado nos últimos 3 meses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {(showCreateForm || editingId !== null) && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingId !== null
                                ? "Editar Meta"
                                : "Criar Nova Meta"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                placeholder="Ex: Comprar um carro"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="value">Valor da Meta (R$)</Label>
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
                            <div className="space-y-2">
                                <Label htmlFor="limitDate">Data Limite</Label>
                                <Input
                                    id="limitDate"
                                    type="date"
                                    value={formData.limitDate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            limitDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
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
                                                description: "",
                                                value: "",
                                                limitDate: "",
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
                        Metas ({goals.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {goals.length === 0 ? (
                        <p className="text-muted-foreground">
                            Nenhuma meta encontrada
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {goals.map((goal) => {
                                const progress = getProgress(goal.value);
                                const timeToReach = calculateTimeToReach(goal.value);
                                const remaining = goal.value - balance;
                                
                                return (
                                    <div
                                        key={goal.id}
                                        className="p-4 border rounded-md space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="h-5 w-5 text-primary" />
                                                    <h3 className="text-lg font-semibold">
                                                        {goal.description}
                                                    </h3>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <p className="text-muted-foreground">
                                                        <span className="font-medium">Valor da Meta:</span>{" "}
                                                        {formatCurrency(goal.value)}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="font-medium">Data Limite:</span>{" "}
                                                        {formatDate(goal.limitDate)}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="font-medium">Falta:</span>{" "}
                                                        <span className={remaining > 0 ? "text-destructive font-semibold" : "text-green-600 font-semibold"}>
                                                            {remaining > 0 ? formatCurrency(remaining) : "Meta alcançada!"}
                                                        </span>
                                                    </p>
                                                    <p className="text-primary font-medium">
                                                        <span className="font-semibold">Tempo estimado:</span> {timeToReach}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(goal)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(goal.id)
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Deletar
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Progresso: {progress.toFixed(1)}%
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {formatCurrency(balance)} / {formatCurrency(goal.value)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

