import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { getAuthenticatedClient } from "../services/api";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Euro } from "lucide-react";
import { toast } from "sonner";

interface Expense {
    id: number;
    title: string;
    description: string;
    value: number;
    date: string;
}

type Currency = "BRL" | "USD" | "EUR";

interface ExchangeRates {
    usd: number;
    eur: number;
}

export function Dashboard() {
    const [despesas, setDespesas] = useState<Expense[]>([]);
    const [lucros, setLucros] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>("BRL");
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
        usd: 0,
        eur: 0,
    });
    const [loadingRates, setLoadingRates] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const client = getAuthenticatedClient();
                
                // Buscar despesas
                const expensesResponse = await client.Expense.getAllforUser();

                if (expensesResponse.status === 200) {
                    setDespesas(expensesResponse.body || []);
                }

                // Buscar lucros
                const revenuesResponse = await client.Revenue.getAllforUser();

                if (revenuesResponse.status === 200) {
                    setLucros(revenuesResponse.body || []);
                }
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

    useEffect(() => {
        async function loadExchangeRates() {
            try {
                setLoadingRates(true);
                // Usando API pública gratuita para cotações
                // API alternativa: exchangerate-api.io ou similar
                const response = await fetch(
                    "https://api.exchangerate-api.com/v4/latest/BRL"
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setExchangeRates({
                        usd: data.rates.USD || 0,
                        eur: data.rates.EUR || 0,
                    });
                } else {
                    // Fallback para valores fixos caso a API falhe
                    setExchangeRates({
                        usd: 0.18, // Aproximadamente 1 BRL = 0.18 USD
                        eur: 0.17, // Aproximadamente 1 BRL = 0.17 EUR
                    });
                    console.warn("Erro ao buscar cotações, usando valores padrão");
                }
            } catch (error) {
                console.error("Erro ao buscar cotações:", error);
                // Fallback para valores fixos
                setExchangeRates({
                    usd: 0.18,
                    eur: 0.17,
                });
            } finally {
                setLoadingRates(false);
            }
        }

        loadExchangeRates();
    }, []);

    const totalDespesas = despesas.reduce((sum, item) => sum + item.value, 0);
    const totalLucros = lucros.reduce((sum, item) => sum + item.value, 0);
    const saldo = totalLucros - totalDespesas;

    function convertCurrency(value: number, from: Currency, to: Currency): number {
        if (from === to) return value;
        
        // Converter de BRL para outra moeda
        if (from === "BRL") {
            if (to === "USD") return value * exchangeRates.usd;
            if (to === "EUR") return value * exchangeRates.eur;
        }
        
        // Converter de outra moeda para BRL
        if (to === "BRL") {
            if (from === "USD") return value / exchangeRates.usd;
            if (from === "EUR") return value / exchangeRates.eur;
        }
        
        // Converter entre USD e EUR (via BRL)
        if (from === "USD" && to === "EUR") {
            const brl = value / exchangeRates.usd;
            return brl * exchangeRates.eur;
        }
        if (from === "EUR" && to === "USD") {
            const brl = value / exchangeRates.eur;
            return brl * exchangeRates.usd;
        }
        
        return value;
    }

    function formatCurrency(value: number, currency: Currency): string {
        const convertedValue = convertCurrency(value, "BRL", currency);
        
        const currencySymbols: Record<Currency, string> = {
            BRL: "R$",
            USD: "$",
            EUR: "€",
        };
        
        return `${currencySymbols[currency]} ${convertedValue.toFixed(2)}`;
    }

    const convertedSaldo = convertCurrency(saldo, "BRL", selectedCurrency);

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
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Visão geral das suas finanças
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="currency-select">Moeda:</Label>
                        <select
                            id="currency-select"
                            value={selectedCurrency}
                            onChange={(e) =>
                                setSelectedCurrency(e.target.value as Currency)
                            }
                            className="px-3 py-2 border rounded-md bg-background text-foreground"
                        >
                            <option value="BRL">Real (BRL)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                </div>
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
                            {formatCurrency(totalDespesas, selectedCurrency)}
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
                            {formatCurrency(totalLucros, selectedCurrency)}
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
                                convertedSaldo >= 0 ? "text-green-600" : "text-destructive"
                            }`}
                        >
                            {formatCurrency(saldo, selectedCurrency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {convertedSaldo >= 0
                                ? "Saldo positivo"
                                : "Saldo negativo"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Cards de Cotação */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cotação Dólar (USD)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingRates ? (
                            <p className="text-sm text-muted-foreground">
                                Carregando...
                            </p>
                        ) : (
                            <div>
                                <div className="text-2xl font-bold">
                                    R$ {(1 / exchangeRates.usd).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    1 USD = {(1 / exchangeRates.usd).toFixed(2)} BRL
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cotação Euro (EUR)
                        </CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingRates ? (
                            <p className="text-sm text-muted-foreground">
                                Carregando...
                            </p>
                        ) : (
                            <div>
                                <div className="text-2xl font-bold">
                                    R$ {(1 / exchangeRates.eur).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    1 EUR = {(1 / exchangeRates.eur).toFixed(2)} BRL
                                </p>
                            </div>
                        )}
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
                                            {formatCurrency(despesa.value, selectedCurrency)}
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
                                            {formatCurrency(lucro.value, selectedCurrency)}
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

