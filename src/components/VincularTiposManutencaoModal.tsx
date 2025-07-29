import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Car, Wrench, Loader2, Link, Unlink } from "lucide-react";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useTiposManutencao } from "@/hooks/useTiposManutencao";
import { useVeiculosTiposManutencao } from "@/hooks/useVeiculosTiposManutencao";

interface VincularTiposManutencaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVinculoChange?: () => void;
}

export const VincularTiposManutencaoModal = ({
  open,
  onOpenChange,
  onVinculoChange
}: VincularTiposManutencaoModalProps) => {
  const { veiculos, refetch: refetchVeiculos } = useVeiculos();
  const { tiposManutencao, refetch: refetchTipos } = useTiposManutencao();
  const { vinculos, adicionarVinculo, removerVinculo, refetchVinculos } = useVeiculosTiposManutencao();

  const [loading, setLoading] = useState(false);

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (open) {
      // Carregar todos os dados necessários
      const timeoutId = setTimeout(async () => {
        await refetchVeiculos();
        await refetchTipos();
        await refetchVinculos();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleVinculacao = async (veiculoId: string, tipoManutencaoId: string) => {
    setLoading(true);
    try {
      const vinculoExistente = vinculos.find(v => 
        v.veiculo_id === veiculoId && v.tipo_manutencao_id === tipoManutencaoId
      );

      if (vinculoExistente) {
        await removerVinculo(vinculoExistente.id);
      } else {
        await adicionarVinculo(veiculoId, tipoManutencaoId);
      }

      // Notificar mudança de vínculo
      if (onVinculoChange) {
        setTimeout(() => {
          onVinculoChange();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro na vinculação:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarVinculo = (veiculoId: string, tipoManutencaoId: string) => {
    return vinculos.some(v => 
      v.veiculo_id === veiculoId && v.tipo_manutencao_id === tipoManutencaoId
    );
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Link className="w-6 h-6 text-orange-500" />
            Vincular Veículos aos Tipos de Manutenção
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <strong>Como usar:</strong> Clique nos botões para vincular ou desvincular veículos aos tipos de manutenção. 
              Os botões verdes indicam vínculos ativos que gerarão manutenções pendentes.
            </p>
          </div>

          {/* Tabela de Vínculos */}
          <ScrollArea className="h-[50vh] border rounded-lg p-4">
            <div className="space-y-6">
              {veiculos.map((veiculo) => (
                <div key={veiculo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Car className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {veiculo.marca} {veiculo.modelo}
                    </h3>
                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800">
                      {veiculo.quilometragem.toLocaleString()} km
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tiposManutencao.map((tipo) => {
                      const vinculado = verificarVinculo(veiculo.id, tipo.id);
                      return (
                        <Button
                          key={tipo.id}
                          variant={vinculado ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVinculacao(veiculo.id, tipo.id)}
                          disabled={loading}
                          className={`justify-start h-auto p-3 transition-all duration-200 ${
                            vinculado 
                              ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600 shadow-sm" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            {vinculado ? (
                              <Link className="w-4 h-4 text-white" />
                            ) : (
                              <Unlink className="w-4 h-4 text-gray-500" />
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">
                                {tipo.nome}
                              </div>
                              <Badge className={`text-xs mt-1 ${getSistemaColor(tipo.sistema)}`}>
                                {tipo.sistema}
                              </Badge>
                            </div>
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Estatísticas */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {veiculos.length} veículo(s) • {tiposManutencao.length} tipo(s) de manutenção
            </span>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {vinculos.length} vínculo(s) ativo(s)
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 