import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Car, 
  Plus, 
  Settings, 
  Edit, 
  Loader2, 
  Filter,
  History,
  RefreshCw
} from "lucide-react";
import { useVeiculos, Veiculo } from "@/hooks/useVeiculos";
import { useTiposManutencao } from "@/hooks/useTiposManutencao";
import { useManutencoesPendentes, ManutencaoPendente } from "@/hooks/useManutencoesPendentes";
import { useVeiculosTiposManutencao } from "@/hooks/useVeiculosTiposManutencao";
import { NovoVeiculoModal } from "@/components/NovoVeiculoModal";
import { EditarVeiculoModal } from "@/components/EditarVeiculoModal";
import { DetalhesVeiculoModal } from "@/components/DetalhesVeiculoModal";
import { GerenciarTiposManutencaoModal } from "@/components/GerenciarTiposManutencaoModal";
import { VincularTiposManutencaoModal } from "@/components/VincularTiposManutencaoModal";
import { RealizarManutencaoModal } from "@/components/RealizarManutencaoModal";
import { OpcoesPosManutencaoModal } from "@/components/OpcoesPosManutencaoModal";
import { HistoricoManutencoesModal } from "@/components/HistoricoManutencoesModal";
import { FiltrosManutencao } from "@/components/FiltrosManutencao";

export default function Veiculos() {
  const {
    veiculos,
    loading: loadingVeiculos,
    adicionarVeiculo,
    editarVeiculo,
    excluirVeiculo,
    atualizarQuilometragem,
    refetch: refetchVeiculos,
  } = useVeiculos();

  const {
    tiposManutencao,
    loading: loadingTipos,
    refetch: refetchTipos,
  } = useTiposManutencao();

  const {
    vinculos,
    loading: loadingVinculos,
    refetchVinculos,
  } = useVeiculosTiposManutencao();

  const {
    manutencoesPendentes,
    manutencaoRealizada,
    loading: loadingManutencoes,
    realizarManutencao,
    refetch: refetchManutencoes,
  } = useManutencoesPendentes(veiculos, tiposManutencao, vinculos);

  const [novoVeiculoModalOpen, setNovoVeiculoModalOpen] = useState(false);
  const [editarVeiculoModalOpen, setEditarVeiculoModalOpen] = useState(false);
  const [detalhesVeiculoModalOpen, setDetalhesVeiculoModalOpen] =
    useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(
    null
  );
  const [gerenciarTiposModalOpen, setGerenciarTiposModalOpen] = useState(false);
  const [vincularTiposModalOpen, setVincularTiposModalOpen] = useState(false);
  const [realizarManutencaoModalOpen, setRealizarManutencaoModalOpen] = useState(false);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState<ManutencaoPendente | null>(null);
  const [opcoesPosManutencaoModalOpen, setOpcoesPosManutencaoModalOpen] = useState(false);
  const [dadosManutencaoRealizada, setDadosManutencaoRealizada] = useState<{
    tipo: string;
    veiculo: string;
    valor: number;
    observacoes: string;
  } | null>(null);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [filtroVeiculo, setFiltroVeiculo] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  // Callback estável para onVinculoChange
  const handleVinculoChange = useCallback(() => {
    // Forçar atualização completa quando vínculos mudarem
    setTimeout(async () => {
      await refetchVeiculos();
      await refetchTipos();
      await refetchManutencoes();
    }, 1000); // Aumentar timeout para garantir sincronização
  }, [refetchVeiculos, refetchTipos, refetchManutencoes]);

  // Função para atualização manual
  const handleAtualizarDados = async () => {
    setAtualizando(true);
    try {
      // Forçar recarregamento completo como F5
      window.location.reload();
    } catch (error) {
      console.error('❌ Erro na atualização manual:', error);
      setAtualizando(false);
    }
  };

  const abrirDetalhes = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setDetalhesVeiculoModalOpen(true);
  };

  const abrirEdicao = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setEditarVeiculoModalOpen(true);
  };

  const abrirRealizarManutencao = (manutencao: ManutencaoPendente) => {
    setManutencaoSelecionada(manutencao);
    setRealizarManutencaoModalOpen(true);
  };

  const handleRealizarManutencao = async (manutencao: ManutencaoPendente, dados: {
    quilometragem: number;
    valor: number;
    observacoes: string;
  }) => {
    const result = await realizarManutencao(manutencao, dados);
    
    if (result?.success) {
      // Preparar dados para o modal de opções
      setDadosManutencaoRealizada({
        tipo: manutencao.tipo,
        veiculo: `${manutencao.veiculo?.marca} ${manutencao.veiculo?.modelo}`,
        valor: dados.valor,
        observacoes: dados.observacoes
      });
      
      // Fechar modal de realizar manutenção
      setRealizarManutencaoModalOpen(false);
      setManutencaoSelecionada(null);
      
      // Abrir modal de opções
      setOpcoesPosManutencaoModalOpen(true);
      
      // Forçar atualização dos dados
      setTimeout(() => {
        refetchVeiculos();
        refetchManutencoes();
      }, 200);
    }
  };

  const handleLimparFiltros = () => {
    setFiltroVeiculo("todos");
    setFiltroTipo("todos");
  };

  // Filtrar manutenções pendentes
  const manutencoesFiltradas = manutencoesPendentes.filter(manutencao => {
    if (filtroVeiculo !== "todos" && manutencao.veiculo_id !== filtroVeiculo) return false;
    if (filtroTipo !== "todos" && manutencao.tipo_manutencao_id !== filtroTipo) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Atrasada":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      case "Em dia":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
    }
  };

  const loading = loadingVeiculos || loadingTipos || loadingManutencoes;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Veículos
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus veículos e manutenções
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAtualizarDados}
              variant="outline"
              className="border-gray-500 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
              disabled={atualizando}
            >
              {atualizando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {atualizando ? "Atualizando..." : "Atualizar Dados"}
            </Button>
            <Button
              onClick={() => setHistoricoModalOpen(true)}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 w-full sm:w-auto"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </Button>
            <Button
              onClick={() => setGerenciarTiposModalOpen(true)}
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
            >
              <Settings className="w-4 h-4 mr-2" />
              Tipos de Manutenção
            </Button>
            <Button
              onClick={() => setVincularTiposModalOpen(true)}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              <Settings className="w-4 h-4 mr-2" />
              Vincular Tipos
            </Button>
            <Button
              onClick={() => setNovoVeiculoModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>

        {/* Lista de Veículos */}
        {loadingVeiculos ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {veiculos.map((veiculo) => (
              <Card
                key={veiculo.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base md:text-lg font-semibold">
                    {veiculo.marca} {veiculo.modelo}
                  </CardTitle>
                  <Car className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Ano:</strong> {veiculo.ano}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Quilometragem:</strong>{" "}
                      {veiculo.quilometragem.toLocaleString()} km
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Combustível:</strong>{" "}
                      {veiculo.combustivel || "Não informado"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirDetalhes(veiculo)}
                      className="flex-1"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirEdicao(veiculo)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Manutenções Pendentes */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Settings className="w-5 h-5 mr-2 text-orange-500" />
                Manutenções Pendentes
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="text-xs"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {mostrarFiltros ? "Ocultar" : "Mostrar"} Filtros
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mostrarFiltros && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FiltrosManutencao
                  veiculos={veiculos}
                  tiposManutencao={tiposManutencao}
                  filtroVeiculo={filtroVeiculo}
                  filtroTipo={filtroTipo}
                  onFiltroVeiculoChange={setFiltroVeiculo}
                  onFiltroTipoChange={setFiltroTipo}
                  onLimparFiltros={handleLimparFiltros}
                />
              </div>
            )}

            {loadingManutencoes ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {manutencoesFiltradas.length > 0 ? (
                    manutencoesFiltradas.map((manutencao) => (
                      <div
                        key={manutencao.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100">
                            {manutencao.tipo}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                            Sistema: {manutencao.sistema} •{" "}
                            {manutencao.veiculo?.marca}{" "}
                            {manutencao.veiculo?.modelo} •{" "}
                            Intervalo: {manutencao.tipoManutencao?.intervalo_km.toLocaleString()} km
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <Badge
                            className={`${getStatusColor(
                              manutencao.status
                            )} text-xs`}
                          >
                            {manutencao.status}
                          </Badge>
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                            {manutencao.proximaEm}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirRealizarManutencao(manutencao)}
                            className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950 w-full sm:w-auto"
                          >
                            Realizar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm md:text-base text-gray-500 dark:text-gray-400 py-4">
                      {manutencoesPendentes.length > 0 
                        ? "Nenhuma manutenção encontrada com os filtros aplicados."
                        : "Nenhuma manutenção pendente encontrada."
                      }
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Modais */}
        <NovoVeiculoModal
          open={novoVeiculoModalOpen}
          onOpenChange={setNovoVeiculoModalOpen}
          onAdicionarVeiculo={adicionarVeiculo}
        />

        <EditarVeiculoModal
          veiculo={veiculoSelecionado}
          open={editarVeiculoModalOpen}
          onOpenChange={setEditarVeiculoModalOpen}
          onEditarVeiculo={editarVeiculo}
        />

        <DetalhesVeiculoModal
          veiculo={veiculoSelecionado}
          open={detalhesVeiculoModalOpen}
          onOpenChange={setDetalhesVeiculoModalOpen}
          manutencoes={manutencoesPendentes.filter(
            (m) => m.veiculo_id === veiculoSelecionado?.id
          )}
          onExcluirVeiculo={(id) => excluirVeiculo(id)}
          onEditarVeiculo={() => {
            setDetalhesVeiculoModalOpen(false);
            setEditarVeiculoModalOpen(true);
          }}
          onAtualizarQuilometragem={(id, novaQuilometragem) =>
            atualizarQuilometragem(id, novaQuilometragem)
          }
        />

        <GerenciarTiposManutencaoModal
          open={gerenciarTiposModalOpen}
          onOpenChange={setGerenciarTiposModalOpen}
        />

        <VincularTiposManutencaoModal
          open={vincularTiposModalOpen}
          onOpenChange={setVincularTiposModalOpen}
          onVinculoChange={handleVinculoChange}
        />

        <RealizarManutencaoModal
          open={realizarManutencaoModalOpen}
          onOpenChange={setRealizarManutencaoModalOpen}
          manutencao={manutencaoSelecionada}
          onRealizarManutencao={handleRealizarManutencao}
        />

        <OpcoesPosManutencaoModal
          open={opcoesPosManutencaoModalOpen}
          onOpenChange={setOpcoesPosManutencaoModalOpen}
          dadosManutencao={dadosManutencaoRealizada}
        />

        <HistoricoManutencoesModal
          open={historicoModalOpen}
          onOpenChange={setHistoricoModalOpen}
          manutencoes={manutencaoRealizada}
        />
      </div>
    </DashboardLayout>
  );
}
