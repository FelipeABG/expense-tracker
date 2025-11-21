import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getAuthenticatedClient } from "../services/api";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Expense {
    id: number;
    title: string;
    description: string;
    value: number;
    date: string;
}

export function Dashboard() {
    const [despesas, setDespesas] = useState<Expense[]>([]);
    const [lucros, setLucros] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const client = getAuthenticatedClient();
                
                // Buscar despesas
                const expensesResponse = await client.Expense.getAllforUser();

                if (expensesResponse.status === 200) {
                    setDespesas(expensesResponse.body || []);
                }

                // TODO: Buscar lucros quando o endpoint estiver disponível
                // Por enquanto, usando array vazio
                setLucros([]);
            } catch (error: any) {
                console.error("Erro ao carregar dados:", error);
                const errorMessage =
                    error.body?.message ||
                    error.message ||
                    "Erro ao carregar dados";
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const totalDespesas = despesas.reduce((sum, item) => sum + item.value, 0);
    const totalLucros = lucros.reduce((sum, item) => sum + item.value, 0);
    const saldo = totalLucros - totalDespesas;

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
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral das suas finanças
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Despesas
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            R$ {totalDespesas.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {despesas.length} despesa(s) registrada(s)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Lucros
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            R$ {totalLucros.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {lucros.length} lucro(s) registrado(s)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                        <Wallet className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${
                                saldo >= 0 ? "text-green-600" : "text-destructive"
                            }`}
                        >
                            R$ {saldo.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {saldo >= 0
                                ? "Saldo positivo"
                                : "Saldo negativo"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Últimas Despesas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {despesas.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma despesa registrada
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {despesas.slice(0, 5).map((despesa) => (
                                    <div
                                        key={despesa.id}
                                        className="flex items-center justify-between p-2 rounded-md border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {despesa.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(
                                                    despesa.date
                                                ).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-destructive">
                                            R$ {despesa.value.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimos Lucros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lucros.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhum lucro registrado
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {lucros.slice(0, 5).map((lucro) => (
                                    <div
                                        key={lucro.id}
                                        className="flex items-center justify-between p-2 rounded-md border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {lucro.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(
                                                    lucro.date
                                                ).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-green-600">
                                            R$ {lucro.value.toFixed(2)}
                                        </p>
                                    </div>
                        ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

