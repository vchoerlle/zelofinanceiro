import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Utensils,
  TrendingUp as Investment,
  Car,
  AlertTriangle,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useDespesas } from "@/hooks/useDespesas";
import { useDividas } from "@/hooks/useDividas";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";

// Função para formatar a data corretamente
const formatarData = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dataInicial, setDataInicial] = useState(getPrimeiroDiaMes());
  const [dataFinal, setDataFinal] = useState(getUltimoDiaMes());

  // Usar dados reais dos hooks
  const { transacoes, loading: loadingTransacoes } = useTransacoes();
  const { despesas, loading: loadingDespesas } = useDespesas();
  const { dividas, loading: loadingDividas } = useDividas();
  const { veiculos, loading: loadingVeiculos } = useVeiculos();
  const { profile } = useProfile();

  // Usar apenas um veículo para as manutenções se existir
  const primeiroVeiculo = veiculos && veiculos.length > 0 ? veiculos[0] : null;

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

  // Processar dados com useMemo para performance
  const processedData = useMemo(() => {
    if (loadingTransacoes || !transacoes.length || loadingDespesas || !despesas.length) {
      return {
        transacoesFiltradas: [],
        despesasFiltradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        saldoPeriodo: 0,
        percentualDespesas: 0,
      };
    }

    // Filtrar transações (receitas) por período
    const transacoesFiltradas = transacoes.filter((transacao) => {
      return aplicarFiltroData(transacao.data);
    });

    // Filtrar despesas por período (usando data de vencimento)
    const despesasFiltradas = despesas.filter((despesa) => {
      return aplicarFiltroData(despesa.data);
    });

    const totalReceitas = transacoesFiltradas
      .filter((t) => t.tipo === "receita")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);

    // Usar despesas da tabela despesas (data de vencimento)
    const totalDespesas = despesasFiltradas
      .reduce((total, despesa) => total + Number(despesa.valor), 0);

    const saldoPeriodo = totalReceitas - totalDespesas;
    
    // Percentual do saldo em relação à receita total
    const percentualSaldo = totalReceitas > 0 
      ? Number(((saldoPeriodo / totalReceitas) * 100).toFixed(1))
      : 0;

    // Percentual das despesas em relação às receitas
    const percentualDespesas = totalReceitas > 0 
      ? Number(((totalDespesas / totalReceitas) * 100).toFixed(1))
      : 0;

    return {
      transacoesFiltradas: transacoesFiltradas.sort((a, b) =>
        b.data.localeCompare(a.data)
      ),
      despesasFiltradas: despesasFiltradas.sort((a, b) =>
        b.data.localeCompare(a.data)
      ),
      totalReceitas,
      totalDespesas,
      saldoPeriodo,
      percentualSaldo,
      percentualDespesas,
    };
  }, [transacoes, despesas, dataInicial, dataFinal, loadingTransacoes, loadingDespesas]);

  const {
    transacoesFiltradas,
    despesasFiltradas,
    totalReceitas,
    totalDespesas,
    saldoPeriodo,
    percentualSaldo,
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



          // Parcelamentos vencidos (usar nomes corretos das propriedades)
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
      if (dataInicial && dataFinal) {
        return `${formatarData(dataInicial)} a ${formatarData(dataFinal)}`;
      } else if (dataInicial) {
        return `A partir de ${formatarData(dataInicial)}`;
      } else if (dataFinal) {
        return `Até ${formatarData(dataFinal)}`;
      }
      return "Período atual";
    },
  };

  const stats = [
    {
      title: "Receitas do período",
      value: `R$ ${totalReceitas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      changeType: "neutral",
      icon: TrendingUp,
  },
    {
      title: "Despesas do período",
      value: `R$ ${totalDespesas.toLocaleString("pt-BR", {
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
    change: `${saldoPeriodo >= 0 ? "+" : ""}${percentualSaldo}%`,
    changeType: saldoPeriodo >= 0 ? "positive" : "negative",
    icon: saldoPeriodo >= 0 ? TrendingUp : TrendingDown,
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
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Olá, {profile?.name || "Usuário"}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Bem-vindo ao seu dashboard
              </p>
            </div>
          </div>

        </div>

        {/* Status da Assinatura */}
        <div className="mb-6 md:mb-8">
          <SubscriptionStatus />
        </div>

        {/* Filtro de Período */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500 dark:text-orange-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
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
                <span>{formatarData(dataInicial)} - {formatarData(dataFinal)}</span>
              )}
              {dataInicial && !dataFinal && (
                <span>A partir de {formatarData(dataInicial)}</span>
              )}
              {!dataInicial && dataFinal && (
                <span>Até {formatarData(dataFinal)}</span>
              )}
            </div>
          )}
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
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
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
                            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Últimas Transações
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border border-border hover:bg-accent gap-2 sm:gap-4"
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <transaction.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-medium text-foreground">
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
        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Parcelamentos Vencidos Card */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-full p-2 md:p-3">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-foreground">
                    Parcelamentos Vencidos
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
                      <p className="text-xs md:text-sm font-medium text-foreground">
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
            <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center">
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
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-border hover:bg-accent"
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="p-2 rounded-lg bg-orange-500 bg-opacity-20">
                      <Car className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-medium text-foreground">
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
