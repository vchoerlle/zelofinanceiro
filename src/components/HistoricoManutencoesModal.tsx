import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Wrench, Calendar, DollarSign, FileText } from "lucide-react";
import { ManutencaoRealizada } from "@/hooks/useManutencoesPendentes";

interface HistoricoManutencoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencoes: ManutencaoRealizada[];
}

export const HistoricoManutencoesModal = ({
  open,
  onOpenChange,
  manutencoes
}: HistoricoManutencoesModalProps) => {
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<string>("");
  const [selectedTipoId, setSelectedTipoId] = useState<string>("");

  const getSistemaColor = (sistema: string) => {
    const colors: { [key: string]: string } = {
      "Motor": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
      "Transmissão": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
      "Freios": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
      "Suspensão": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
      "Elétrico": "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
      "Arrefecimento": "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700",
      "Alimentação": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
      "Escapamento": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
      "Direção": "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700",
      "Pneus e Rodas": "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700"
    };
    return colors[sistema] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarQuilometragem = (km: number) => {
    return km.toLocaleString('pt-BR');
  };

  const formatarValor = (valor?: number) => {
    if (!valor) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Extrair veículos e tipos únicos das manutenções
  const veiculosUnicos = Array.from(new Set(manutencoes.map(m => m.veiculo_id)))
    .map(veiculoId => {
      const manutencao = manutencoes.find(m => m.veiculo_id === veiculoId);
      return {
        id: veiculoId,
        nome: `${manutencao?.veiculo?.marca} ${manutencao?.veiculo?.modelo} (${manutencao?.veiculo?.ano})`
      };
    })
    .filter(veiculo => veiculo.nome && veiculo.nome !== "undefined undefined (undefined)");

  const tiposUnicos = Array.from(new Set(manutencoes.map(m => m.tipo_manutencao_id)))
    .map(tipoId => {
      const manutencao = manutencoes.find(m => m.tipo_manutencao_id === tipoId);
      return {
        id: tipoId,
        nome: manutencao?.tipoManutencao?.nome || "Tipo desconhecido"
      };
    })
    .filter(tipo => tipo.nome && tipo.nome !== "Tipo desconhecido");

  const manutencoesFiltradas = manutencoes.filter(manutencao => {
    if (activeTab === "por-veiculo" && selectedVeiculoId) {
      return manutencao.veiculo_id === selectedVeiculoId;
    }
    if (activeTab === "por-tipo" && selectedTipoId) {
      return manutencao.tipo_manutencao_id === selectedTipoId;
    }
    return true; // "todas"
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Resetar seleções quando mudar de aba
    if (value === "todas") {
      setSelectedVeiculoId("");
      setSelectedTipoId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-orange-500" />
            Histórico de Manutenções Realizadas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Wrench className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Manutenções</p>
                    <p className="text-2xl font-bold">{manutencoes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Car className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Veículos</p>
                    <p className="text-2xl font-bold">{veiculosUnicos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                    <p className="text-2xl font-bold">
                      {formatarValor(manutencoes.reduce((total, m) => total + (m.valor_manutencao || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="por-veiculo">Por Veículo</TabsTrigger>
              <TabsTrigger value="por-tipo">Por Tipo</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {manutencoesFiltradas.length > 0 ? (
                    manutencoesFiltradas.map((manutencao) => (
                      <Card key={manutencao.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Wrench className="w-5 h-5 text-orange-500" />
                              <div>
                                <CardTitle className="text-lg">
                                  {manutencao.tipoManutencao?.nome}
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {manutencao.veiculo?.marca} {manutencao.veiculo?.modelo} ({manutencao.veiculo?.ano})
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getSistemaColor(manutencao.tipoManutencao?.sistema || '')}`}>
                              {manutencao.tipoManutencao?.sistema}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                              <div>
                                <p className="text-sm font-medium">Data</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarData(manutencao.data_realizada)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Car className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Quilometragem</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarQuilometragem(manutencao.quilometragem_realizada)} km
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Valor</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarValor(manutencao.valor_manutencao)}
                                </p>
                              </div>
                            </div>
                            {manutencao.observacoes && (
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">Observações</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {manutencao.observacoes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Nenhuma manutenção encontrada
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="por-veiculo" className="space-y-4">
              {/* Seletor de Veículo */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Selecionar Veículo:</label>
                <Select value={selectedVeiculoId} onValueChange={setSelectedVeiculoId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Escolha um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculosUnicos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {manutencoesFiltradas.length > 0 ? (
                    manutencoesFiltradas.map((manutencao) => (
                      <Card key={manutencao.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Wrench className="w-5 h-5 text-orange-500" />
                              <div>
                                <CardTitle className="text-lg">
                                  {manutencao.tipoManutencao?.nome}
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarData(manutencao.data_realizada)}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getSistemaColor(manutencao.tipoManutencao?.sistema || '')}`}>
                              {manutencao.tipoManutencao?.sistema}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Car className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Quilometragem</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarQuilometragem(manutencao.quilometragem_realizada)} km
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Valor</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarValor(manutencao.valor_manutencao)}
                                </p>
                              </div>
                            </div>
                            {manutencao.observacoes && (
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">Observações</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {manutencao.observacoes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedVeiculoId ? "Nenhuma manutenção encontrada para este veículo" : "Selecione um veículo para ver as manutenções"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="por-tipo" className="space-y-4">
              {/* Seletor de Tipo */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Selecionar Tipo:</label>
                <Select value={selectedTipoId} onValueChange={setSelectedTipoId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Escolha um tipo de manutenção" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposUnicos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {manutencoesFiltradas.length > 0 ? (
                    manutencoesFiltradas.map((manutencao) => (
                      <Card key={manutencao.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Car className="w-5 h-5 text-blue-500" />
                              <div>
                                <CardTitle className="text-lg">
                                  {manutencao.veiculo?.marca} {manutencao.veiculo?.modelo}
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarData(manutencao.data_realizada)}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getSistemaColor(manutencao.tipoManutencao?.sistema || '')}`}>
                              {manutencao.tipoManutencao?.sistema}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Car className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Quilometragem</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarQuilometragem(manutencao.quilometragem_realizada)} km
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Valor</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatarValor(manutencao.valor_manutencao)}
                                </p>
                              </div>
                            </div>
                            {manutencao.observacoes && (
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">Observações</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {manutencao.observacoes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedTipoId ? "Nenhuma manutenção encontrada para este tipo" : "Selecione um tipo para ver as manutenções"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 