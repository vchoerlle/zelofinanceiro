import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Utensils,
  TrendingUp as Investment,
  Car,
  AlertTriangle,
  Package,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useItensMercado } from "@/hooks/useItensMercado";
import { useDividas } from "@/hooks/useDividas";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useManutencoesPendentes } from "@/hooks/useManutencoesPendentes";
import { useProfile } from "@/hooks/useProfile";

// Função para formatar a data corretamente
const formatarData = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
};

// Função para obter a data atual no formato do banco (YYYY-MM-DD)
const getDataAtual = () => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
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

// Função para obter o primeiro dia do ano no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaAno = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

// Função para comparar datas no formato do banco (YYYY-MM-DD)
const compararDatas = (data1: string, data2: string) => {
  return data1.split("T")[0] === data2;
};

// Função para formatar o nome do mês
const formatarMes = (data: Date) => {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${meses[data.getMonth()]} de ${data.getFullYear()}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("mês");

  // Usar dados reais dos hooks
  const { transacoes, loading: loadingTransacoes } = useTransacoes();
  const { itensMercado, loading: loadingItens } = useItensMercado();
  const { dividas, loading: loadingDividas } = useDividas();
  const { veiculos, loading: loadingVeiculos } = useVeiculos();
  const { profile } = useProfile();

  // Usar apenas um veículo para as manutenções se existir
  const primeiroVeiculo = veiculos && veiculos.length > 0 ? veiculos[0] : null;
  // Remover o hook de manutenções pendentes por enquanto até resolver as dependências

  // Processar dados com useMemo para performance
  const processedData = useMemo(() => {
    if (loadingTransacoes || !transacoes.length) {
      return {
        transacoesFiltradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        saldoPeriodo: 0,
        percentualDespesas: 0,
      };
    }

    const hoje = getDataAtual();

    const transacoesFiltradas = transacoes.filter((transacao) => {
      const dataTransacao = transacao.data.split("T")[0];

      switch (selectedPeriod) {
        case "dia":
          return dataTransacao === hoje;
        case "semana":
          return dataTransacao >= getPrimeiroDiaSemana();
        case "mes":
          return dataTransacao >= getPrimeiroDiaMes();
        case "ano":
          return dataTransacao >= getPrimeiroDiaAno();
        default:
          return true;
      }
    });

    const totalReceitas = transacoesFiltradas
      .filter((t) => t.tipo === "receita")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);

    const totalDespesas = transacoesFiltradas
      .filter((t) => t.tipo === "despesa")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);

    const saldoPeriodo = totalReceitas - totalDespesas;
    const percentualDespesas =
      totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0;

    return {
      transacoesFiltradas: transacoesFiltradas.sort((a, b) =>
        b.data.localeCompare(a.data)
      ),
      totalReceitas,
      totalDespesas,
      saldoPeriodo,
      percentualDespesas,
    };
  }, [transacoes, selectedPeriod, loadingTransacoes]);

  const {
    transacoesFiltradas,
    totalReceitas,
    totalDespesas,
    saldoPeriodo,
    percentualDespesas,
  } = processedData;

  // Função para obter ícone da categoria
  const obterIconeCategoria = (
    categoria: string,
    tipo: "receita" | "despesa"
  ) => {
    const icones: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      Salário: DollarSign,
      Freelances: DollarSign,
      Investimentos: Investment,
      Moradia: Home,
      Alimentação: Utensils,
      Transporte: Car,
      default: tipo === "receita" ? DollarSign : TrendingDown,
    };
    return icones[categoria] || icones.default;
  };

  // Função para obter cor da categoria baseada na cor real da categoria
  const obterCorCategoria = (
    categoriaObj: { cor?: string } | null | undefined,
    tipo: "receita" | "despesa"
  ) => {
    if (categoriaObj?.cor) {
      // Converter cor hex para classe Tailwind ou usar a cor diretamente
      return "bg-primary"; // Usar cor do design system
    }

    const cores: { [key: string]: string } = {
      default: tipo === "receita" ? "bg-green-500" : "bg-red-500",
    };
    return cores.default;
  };

  // Cálculos adicionais
  const despesasPendentes = totalDespesas * 0.1; // Estimativa

  // Itens com estoque baixo (usar nomes corretos das propriedades)
  const itensEstoqueBaixo = itensMercado.filter(
    (item) => item.status === "estoque_baixo" || item.status === "sem_estoque"
  );

  // Dívidas vencidas (usar nomes corretos das propriedades)
  const dividasVencidas = dividas.filter(
    (divida) => divida.status === "vencida"
  );
  const totalDividasVencidas = dividasVencidas.reduce(
    (total, divida) => total + Number(divida.valor_restante),
    0
  );

  // Preparar transações para exibição (últimas 5)
  const transacoesParaExibicao = transacoesFiltradas
    .slice(0, 5)
    .map((transacao) => ({
      id: transacao.id,
      description: transacao.descricao,
      date: formatarData(transacao.data),
      category: transacao.categorias?.nome || "Sem categoria",
      categoryColor: obterCorCategoria(transacao.categorias, transacao.tipo),
      amount: `${transacao.tipo === "receita" ? "+" : "-"}R$ ${Number(
        transacao.valor
      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      type: transacao.tipo === "receita" ? "income" : "expense",
      icon: obterIconeCategoria(
        transacao.categorias?.nome || "default",
        transacao.tipo
      ),
    }));

  const user = {
    name: profile?.name || "Usuário",
    getCurrentPeriod: () => {
      // Ajusta para o timezone do Brasil (UTC-3)
      const now = new Date();
      const offset = -3; // UTC-3 (Brasil)
      const today = new Date(now.getTime() + offset * 60 * 60 * 1000);

      switch (selectedPeriod) {
        case "dia": {
          const dataFormatada = formatarData(today.toISOString());
          return dataFormatada;
        }
        case "semana": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return `Semana de ${formatarData(startOfWeek.toISOString())}`;
        }
        case "mes":
          return formatarMes(today);
        case "ano":
          return today.getFullYear().toString();
        default:
          return "Período atual";
      }
    },
  };

  const stats = [
    {
      title: "Receitas do período",
      value: `R$ ${totalReceitas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      change: "+12.4%",
      changeType: "positive",
      icon: TrendingUp,
    },
    {
      title: "Despesas do período",
      value: `R$ ${totalDespesas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      subtitle: `Pendente: R$ ${despesasPendentes.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      changeType: "neutral",
      icon: TrendingDown,
    },
    {
      title: "Saldo do período",
      value: `R$ ${saldoPeriodo.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      change: "+29.7%",
      changeType: "positive",
      icon: TrendingUp,
    },
    {
      title: "Despesas/Receitas",
      value: `${percentualDespesas.toFixed(1)}%`,
      badge: "Saúde Financeira",
      badgeType:
        percentualDespesas < 80
          ? "good"
          : percentualDespesas < 90
          ? "warning"
          : "bad",
      badgeStatus:
        percentualDespesas < 80
          ? "Bom"
          : percentualDespesas < 90
          ? "Regular"
          : "Ruim",
      changeType: "neutral",
      icon: percentualDespesas < 80 ? TrendingUp : TrendingDown,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 rounded-full p-2 md:p-3">
              <span className="text-white font-bold text-lg md:text-xl">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Olá, {user.name}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {user.getCurrentPeriod()}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Tabs
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              className="w-full sm:w-auto"
            >
              <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                <TabsTrigger value="dia" className="text-sm">
                  Dia
                </TabsTrigger>
                <TabsTrigger value="semana" className="text-sm">
                  Semana
                </TabsTrigger>
                <TabsTrigger value="mês" className="text-sm">
                  Mês
                </TabsTrigger>
                <TabsTrigger value="ano" className="text-sm">
                  Ano
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 md:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm text-gray-600">
                    {stat.title}
                  </p>
                  {stat.icon && (
                    <stat.icon
                      className={`w-4 h-4 ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    />
                  )}
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs md:text-sm text-orange-600">
                    {stat.subtitle}
                  </p>
                )}
                {stat.change && (
                  <p
                    className={`text-xs md:text-sm ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                )}
                {stat.badge && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {stat.badge}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stat.badgeType === "good"
                          ? "bg-green-100 text-green-800"
                          : stat.badgeType === "warning"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          stat.badgeType === "good"
                            ? "bg-green-500"
                            : stat.badgeType === "warning"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {stat.badgeStatus}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Últimas Transações - {selectedPeriod}
            </h2>
            <Button
              variant="ghost"
              className="text-orange-600 hover:text-orange-700 text-sm"
              onClick={() => navigate("/transacoes")}
            >
              Ver todas
            </Button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {transacoesParaExibicao.length > 0 ? (
              transacoesParaExibicao.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border border-gray-100 hover:bg-gray-50 gap-2 sm:gap-4"
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <transaction.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 md:space-x-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      {transaction.category}
                    </span>
                    <span
                      className={`text-sm md:text-base font-bold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 md:py-8 text-sm md:text-base text-gray-500">
                Nenhuma transação encontrada para o período selecionado.
              </div>
            )}
          </div>
        </Card>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Estoque Baixo Card */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-full p-2 md:p-3">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Estoque Baixo
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {itensEstoqueBaixo.length} item
                    {itensEstoqueBaixo.length !== 1 ? "s" : ""} precisa
                    {itensEstoqueBaixo.length === 1 ? "" : "m"} de atenção
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-orange-600 hover:text-orange-700 text-sm"
                onClick={() => navigate("/mercado")}
              >
                Ver todos
              </Button>
            </div>
            <div className="space-y-3">
              {itensEstoqueBaixo.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "sem_estoque"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-900">
                        {item.descricao}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantidade_atual}/{item.quantidade_ideal}{" "}
                        {item.unidade_medida}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === "sem_estoque"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status === "sem_estoque"
                      ? "Sem estoque"
                      : "Estoque baixo"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Dívidas Vencidas Card */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-full p-2 md:p-3">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Dívidas Vencidas
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    R${" "}
                    {totalDividasVencidas.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    em {dividasVencidas.length} dívida
                    {dividasVencidas.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-orange-600 hover:text-orange-700 text-sm"
                onClick={() => navigate("/dividas")}
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-3">
              {dividasVencidas.slice(0, 3).map((divida) => (
                <div
                  key={divida.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-900">
                        {divida.descricao}
                      </p>
                      <p className="text-xs text-gray-600">
                        Venc: {formatarData(divida.data_vencimento)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-red-600">
                    R${" "}
                    {divida.valor_restante.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Veículos Card */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <Car className="w-4 h-4 md:w-5 md:h-5 mr-2 text-orange-500" />
              Meus Veículos
            </h2>
            <Button
              variant="ghost"
              className="text-orange-600 hover:text-orange-700 text-sm"
              onClick={() => navigate("/veiculos")}
            >
              Ver todos
            </Button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {loadingVeiculos ? (
              <div className="text-center py-4 text-sm md:text-base text-gray-500">
                Carregando veículos...
              </div>
            ) : veiculos.length > 0 ? (
              veiculos.map((veiculo) => (
                <div
                  key={veiculo.id}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="p-2 rounded-lg bg-orange-500 bg-opacity-20">
                      <Car className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {veiculo.marca} {veiculo.modelo}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {veiculo.ano} • {veiculo.quilometragem.toLocaleString()}{" "}
                        km
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 md:py-8 text-sm md:text-base text-gray-500">
                Nenhum veículo cadastrado ainda.
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
