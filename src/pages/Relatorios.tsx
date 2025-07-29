import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Calendar,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useCategorias } from "@/hooks/useCategorias";

interface ChartData {
  periodo: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface CategoryData {
  categoria: string;
  valor: number;
  cor: string;
}

interface FilteredTransaction {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: "receita" | "despesa";
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

// Função para formatar a data para exibição (DD/MM/YYYY)
const formatarData = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
};

// Função para formatar data em português
const formatarDataBR = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
};

// Função para obter a data atual no formato do banco (YYYY-MM-DD)
const getDataAtual = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

// Função para obter o primeiro dia da semana no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaSemana = () => {
  const now = new Date();
  const primeiroDiaSemana = new Date(now);
  primeiroDiaSemana.setDate(now.getDate() - now.getDay());
  return `${primeiroDiaSemana.getFullYear()}-${String(
    primeiroDiaSemana.getMonth() + 1
  ).padStart(2, "0")}-${String(primeiroDiaSemana.getDate()).padStart(2, "0")}`;
};

// Função para obter o primeiro dia do mês no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaMes = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
};

// Função para obter o último dia do mês no formato do banco (YYYY-MM-DD)
const getUltimoDiaMes = () => {
  const now = new Date();
  const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(ultimoDia.getDate()).padStart(2, "0")}`;
};

// Função para obter o primeiro dia do trimestre no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaTrimestre = () => {
  const now = new Date();
  const mes = Math.floor(now.getMonth() / 3) * 3 + 1;
  return `${now.getFullYear()}-${String(mes).padStart(2, "0")}-01`;
};

// Função para obter o primeiro dia do ano no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaAno = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

const Relatorios = () => {
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [dataInicial, setDataInicial] = useState(getPrimeiroDiaMes());
  const [dataFinal, setDataFinal] = useState(getUltimoDiaMes());
  const { toast } = useToast();
  const { transacoes, loading: loadingTransacoes } = useTransacoes();
  const { categorias, loading: loadingCategorias } = useCategorias();

  // Função para aplicar filtro de data
  const aplicarFiltroData = (dataString: string) => {
    if (!dataInicial && !dataFinal) {
      return true; // Se não há filtro de data, retorna todas
    }

    const dataItem = dataString.split('T')[0]; // Pega apenas a data (YYYY-MM-DD)

    if (dataInicial && dataFinal) {
      // Filtro com data inicial e final
      return dataItem >= dataInicial && dataItem <= dataFinal;
    } else if (dataInicial) {
      // Apenas data inicial
      return dataItem >= dataInicial;
    } else if (dataFinal) {
      // Apenas data final
      return dataItem <= dataFinal;
    }

    return true;
  };

  // Função para validar datas
  const validarDatas = () => {
    if (dataInicial && dataFinal && dataInicial > dataFinal) {
      toast({
        title: "Erro",
        description: "A data inicial não pode ser maior que a data final",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Função para lidar com mudança de data inicial
  const handleDataInicialChange = (value: string) => {
    setDataInicial(value);
    if (value && dataFinal && value > dataFinal) {
      toast({
        title: "Aviso",
        description: "A data inicial não pode ser maior que a data final",
        variant: "destructive",
      });
    }
  };

  // Função para lidar com mudança de data final
  const handleDataFinalChange = (value: string) => {
    setDataFinal(value);
    if (value && dataInicial && dataInicial > value) {
      toast({
        title: "Aviso",
        description: "A data final não pode ser menor que a data inicial",
        variant: "destructive",
      });
    }
  };

  // Função para limpar filtros
  const limparFiltros = () => {
    setDataInicial(getPrimeiroDiaMes());
    setDataFinal(getUltimoDiaMes());
  };

  const processedData = useMemo(() => {
    if (loadingTransacoes || !transacoes.length) {
      return {
        chartData: [] as ChartData[],
        categoryData: [] as CategoryData[],
        filteredTransactions: [] as FilteredTransaction[],
      };
    }

    const hoje = getDataAtual();

    // Filtrar transações baseado no período
    const filteredByPeriod = transacoes.filter((transacao) => {
      return aplicarFiltroData(transacao.data);
    });

    // Calcular dados do gráfico - sempre agrupar por mês
    let chartData: ChartData[] = [];

    // Agrupar por mês
    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    // Pegar os últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const ano = data.getFullYear();
      const mes = data.getMonth();

      const transacoesMes = filteredByPeriod.filter((t) => {
        const [anoTransacao, mesTransacao] = t.data.split("T")[0].split("-");
        return Number(anoTransacao) === ano && Number(mesTransacao) - 1 === mes;
      });

      const receitas = transacoesMes
        .filter((t) => t.tipo === "receita")
        .reduce((sum, t) => sum + Number(t.valor), 0);
      const despesas = transacoesMes
        .filter((t) => t.tipo === "despesa")
        .reduce((sum, t) => sum + Number(t.valor), 0);

              chartData.push({
          periodo: `${meses[mes]} ${ano}`,
          receitas,
          despesas,
          saldo: receitas - despesas,
        });
      }

    // Calcular dados por categoria
    const categoryMap = new Map<string, CategoryData>();

    filteredByPeriod
      .filter((t) => t.tipo === "despesa")
      .forEach((transaction) => {
        const categoryName = transaction.categorias?.nome || "Sem categoria";
        const categoryColor = transaction.categorias?.cor || "#6B7280";

        if (categoryMap.has(categoryName)) {
          const existingCategory = categoryMap.get(categoryName)!;
          categoryMap.set(categoryName, {
            ...existingCategory,
            valor: existingCategory.valor + Number(transaction.valor),
          });
        } else {
          categoryMap.set(categoryName, {
            categoria: categoryName,
            valor: Number(transaction.valor),
            cor: categoryColor,
          });
        }
      });

    const categoryData = Array.from(categoryMap.values());

    // Filtrar transações para a tabela
    const filteredTransactions = filteredByPeriod
      .filter((transaction) => {
        if (selectedCategory === "todas") return true;
        if (selectedCategory === "receita")
          return transaction.tipo === "receita";
        if (selectedCategory === "despesa")
          return transaction.tipo === "despesa";
        return true;
      })
      .map((transaction) => ({
        id: transaction.id,
        data: transaction.data,
        descricao: transaction.descricao,
        categoria: transaction.categorias?.nome || "Sem categoria",
        valor: Number(transaction.valor),
        tipo: transaction.tipo,
      }))
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 50);

    return {
      chartData,
      categoryData,
      filteredTransactions,
    };
  }, [transacoes, selectedCategory, loadingTransacoes, dataInicial, dataFinal]);

  const { chartData, categoryData, filteredTransactions } = processedData;

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "#22c55e",
    },
    despesas: {
      label: "Despesas",
      color: "#ef4444",
    },
    saldo: {
      label: "Saldo",
      color: "#3b82f6",
    },
  };

  const handleExportReport = () => {
    try {
      // Preparar dados para exportação
      const reportData = {
        periodo: dataInicial && dataFinal ? `${formatarDataBR(dataInicial)} - ${formatarDataBR(dataFinal)}` : "Mês atual",
        dataGeracao: new Date().toLocaleDateString("pt-BR"),
        resumo: {
          totalReceitas: totalReceitas,
          totalDespesas: totalDespesas,
          saldoTotal: saldoTotal,
        },
        dadosMensais: chartData,
        categorias: categoryData,
        transacoes: filteredTransactions,
      };

      // Criar CSV das transações
      const csvHeader = "Data,Descrição,Categoria,Valor,Tipo\n";
      const csvData = filteredTransactions
        .map(
          (transaction) =>
            `${transaction.data},"${transaction.descricao}","${transaction.categoria}",${transaction.valor},${transaction.tipo}`
        )
        .join("\n");

      const csvContent = csvHeader + csvData;

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio-financeiro-${dataInicial && dataFinal ? `${dataInicial}-${dataFinal}` : "mes-atual"}-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Relatório exportado com sucesso!",
        description: "O arquivo CSV foi baixado para seu computador.",
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        title: "Erro ao exportar relatório",
        description:
          "Ocorreu um erro ao tentar exportar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Calcular totais baseado nos dados do período atual
  const totalReceitas = chartData.reduce(
    (acc: number, item: ChartData) => acc + (item.receitas || 0),
    0
  );
  const totalDespesas = chartData.reduce(
    (acc: number, item: ChartData) => acc + (item.despesas || 0),
    0
  );
  const saldoTotal = totalReceitas - totalDespesas;

  // Obter chave correta para o eixo X
  const getXAxisKey = () => {
    return "periodo";
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Relatórios
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Visualize e analise seus dados financeiros
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Button
              onClick={handleExportReport}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtro de período */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => handleDataInicialChange(e.target.value)}
                className="w-40 h-8 text-sm"
                placeholder="Data inicial"
                max={dataFinal || undefined}
              />
              <span className="text-sm text-gray-500">até</span>
              <Input
                type="date"
                value={dataFinal}
                onChange={(e) => handleDataFinalChange(e.target.value)}
                className="w-40 h-8 text-sm"
                placeholder="Data final"
                min={dataInicial || undefined}
              />
            </div>
            {(dataInicial || dataFinal) && (
              <Button
                variant="outline"
                size="sm"
                onClick={limparFiltros}
                className="h-8 text-xs"
              >
                Limpar
              </Button>
            )}
          </div>
          {(dataInicial || dataFinal) && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {dataInicial && dataFinal && (
                <span>{formatarDataBR(dataInicial)} - {formatarDataBR(dataFinal)}</span>
              )}
              {dataInicial && !dataFinal && (
                <span>A partir de {formatarDataBR(dataInicial)}</span>
              )}
              {!dataInicial && dataFinal && (
                <span>Até {formatarDataBR(dataFinal)}</span>
              )}
            </div>
          )}
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-green-600">
                R$ {totalReceitas.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground">
                {dataInicial && dataFinal
                  ? `${formatarDataBR(dataInicial)} - ${formatarDataBR(dataFinal)}`
                  : "Mês atual"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground">
                {dataInicial && dataFinal
                  ? `${formatarDataBR(dataInicial)} - ${formatarDataBR(dataFinal)}`
                  : "Mês atual"}
              </p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg md:text-2xl font-bold ${
                  saldoTotal >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                R$ {saldoTotal.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground">
                {saldoTotal >= 0 ? "Resultado positivo" : "Resultado negativo"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes tipos de relatórios */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="overview" className="text-sm">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-sm">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-sm">
              Transações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Gráfico de barras - Receitas vs Despesas */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <FileText className="w-5 h-5 mr-2 text-orange-500" />
                    Receitas vs Despesas - {dataInicial && dataFinal
                      ? `${formatarDataBR(dataInicial)} - ${formatarDataBR(dataFinal)}`
                      : "Mês atual"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey={getXAxisKey()}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} width={80} />
                        <ChartTooltip />
                        <Bar dataKey="receitas" fill="#22c55e" />
                        <Bar dataKey="despesas" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de linha - Evolução do saldo */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    Evolução do Saldo - {dataInicial && dataFinal
                      ? `${formatarDataBR(dataInicial)} - ${formatarDataBR(dataFinal)}`
                      : "Mês atual"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey={getXAxisKey()}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} width={80} />
                        <ChartTooltip />
                        <Line
                          type="monotone"
                          dataKey="saldo"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Gráfico de pizza - Despesas por categoria */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <PieChartIcon className="w-5 h-5 mr-2 text-orange-500" />
                    Despesas por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="valor"
                          label={{ fontSize: 12 }}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de categorias */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">
                    Detalhamento por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {categoryData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.cor }}
                          />
                          <span className="font-medium text-sm md:text-base">
                            {item.categoria}
                          </span>
                        </div>
                        <span className="font-bold text-sm md:text-base">
                          R$ {item.valor.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="w-full">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-base md:text-lg">
                  Transações - {dataInicial && dataFinal
                    ? `${formatarDataBR(dataInicial)} - ${formatarDataBR(dataFinal)}`
                    : "Mês atual"}
                </CardTitle>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right w-[150px]">
                          Valor
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatarData(transaction.data)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.descricao}
                          </TableCell>
                          <TableCell>{transaction.categoria}</TableCell>
                          <TableCell
                            className={`text-right font-medium whitespace-nowrap ${
                              transaction.tipo === "receita"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.tipo === "receita" ? "+" : "-"}R${" "}
                            {Math.abs(transaction.valor).toLocaleString(
                              "pt-BR"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-4 text-sm md:text-base text-muted-foreground">
                      Nenhuma transação encontrada para o filtro selecionado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;
