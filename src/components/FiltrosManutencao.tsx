import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Wrench, Filter, X } from "lucide-react";
import { Veiculo } from "@/hooks/useVeiculos";
import { TipoManutencao } from "@/hooks/useTiposManutencao";

interface FiltrosManutencaoProps {
  veiculos: Veiculo[];
  tiposManutencao: TipoManutencao[];
  filtroVeiculo: string;
  filtroTipo: string;
  onFiltroVeiculoChange: (value: string) => void;
  onFiltroTipoChange: (value: string) => void;
  onLimparFiltros: () => void;
}

export const FiltrosManutencao = ({
  veiculos,
  tiposManutencao,
  filtroVeiculo,
  filtroTipo,
  onFiltroVeiculoChange,
  onFiltroTipoChange,
  onLimparFiltros
}: FiltrosManutencaoProps) => {
  const [filtroAtivo, setFiltroAtivo] = useState<"veiculo" | "tipo" | "nenhum">("nenhum");

  const handleFiltroVeiculoChange = (value: string) => {
    onFiltroVeiculoChange(value);
    setFiltroAtivo(value !== "todos" ? "veiculo" : "nenhum");
  };

  const handleFiltroTipoChange = (value: string) => {
    onFiltroTipoChange(value);
    setFiltroAtivo(value !== "todos" ? "tipo" : "nenhum");
  };

  const handleLimparFiltros = () => {
    onLimparFiltros();
    setFiltroAtivo("nenhum");
  };

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

  const temFiltrosAtivos = filtroVeiculo !== "todos" || filtroTipo !== "todos";

  return (
    <div className="space-y-4">
      {/* Cabeçalho dos Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar Manutenções
          </span>
        </div>
        {temFiltrosAtivos && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLimparFiltros}
            className="text-xs h-7"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtro por Veículo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Car className="w-4 h-4 inline mr-1" />
            Por Veículo
          </label>
          <Select value={filtroVeiculo} onValueChange={handleFiltroVeiculoChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos os veículos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os veículos</SelectItem>
              {veiculos.map((veiculo) => (
                <SelectItem key={veiculo.id} value={veiculo.id}>
                  <div className="flex items-center">
                    <Car className="w-3 h-3 mr-2 text-orange-500" />
                    <span>{veiculo.marca} {veiculo.modelo}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Tipo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Wrench className="w-4 h-4 inline mr-1" />
            Por Tipo de Manutenção
          </label>
          <Select value={filtroTipo} onValueChange={handleFiltroTipoChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {tiposManutencao.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Wrench className="w-3 h-3 mr-2 text-orange-500" />
                      <span>{tipo.nome}</span>
                    </div>
                    <Badge className={`ml-2 text-xs ${getSistemaColor(tipo.sistema)}`}>
                      {tipo.sistema}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Indicador de Filtro Ativo */}
      {temFiltrosAtivos && (
        <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Filtro ativo:
          </span>
          {filtroVeiculo !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              <Car className="w-3 h-3 mr-1" />
              {veiculos.find(v => v.id === filtroVeiculo)?.marca} {veiculos.find(v => v.id === filtroVeiculo)?.modelo}
            </Badge>
          )}
          {filtroTipo !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              <Wrench className="w-3 h-3 mr-1" />
              {tiposManutencao.find(t => t.id === filtroTipo)?.nome}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}; 