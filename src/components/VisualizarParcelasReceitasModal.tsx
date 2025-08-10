import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useParcelasReceitas, ParcelaReceita } from "@/hooks/useParcelasReceitas";
import { EditarParcelaReceitaModal } from "@/components/EditarParcelaReceitaModal";
import { Calendar, DollarSign, Hash, Edit, Trash2 } from "lucide-react";

const formatarDataBR = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receitaParceladaId: string;
  receitaDescricao: string;
}

export const VisualizarParcelasReceitasModal = ({ isOpen, onClose, receitaParceladaId, receitaDescricao }: Props) => {
  const { parcelas, loading, fetchParcelasByReceitaParcelada, updateParcelaStatus, updateParcela, deleteParcela } = useParcelasReceitas();
  const [parcelaEditando, setParcelaEditando] = useState<ParcelaReceita | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  useEffect(() => {
    if (isOpen && receitaParceladaId) fetchParcelasByReceitaParcelada(receitaParceladaId);
  }, [isOpen, receitaParceladaId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recebida":
        return "bg-green-100 text-green-800";
      case "vencida":
        return "bg-red-100 text-red-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "recebida":
        return "Recebida";
      case "vencida":
        return "Vencida";
      case "pendente":
        return "Pendente";
      default:
        return status;
    }
  };

  const parcelasRecebidas = parcelas.filter((p) => p.status === "recebida").length;
  const parcelasVencidas = parcelas.filter((p) => p.status === "vencida").length;
  const parcelasPendentes = parcelas.filter((p) => p.status === "pendente").length;
  const valorTotalParcelas = parcelas.reduce((total, p) => total + p.valor_parcela, 0);
  const valorRecebido = parcelas.filter((p) => p.status === "recebida").reduce((total, p) => total + p.valor_parcela, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parcelas da Receita</DialogTitle>
          <DialogDescription>
            Visualize e gerencie as parcelas de: <strong>{receitaDescricao}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo das Parcelas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{parcelas.length}</div>
                    <div className="text-sm text-gray-600">Total de Parcelas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{parcelasRecebidas}</div>
                    <div className="text-sm text-gray-600">Parcelas Recebidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{parcelasPendentes}</div>
                    <div className="text-sm text-gray-600">Parcelas Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{parcelasVencidas}</div>
                    <div className="text-sm text-gray-600">Parcelas Vencidas</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800">R$ {valorTotalParcelas.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">R$ {valorRecebido.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Valor Recebido</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Detalhes das Parcelas</h3>
              {parcelas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma parcela encontrada.</div>
              ) : (
                <div className="grid gap-3">
                  {parcelas.map((parcela) => (
                    <Card key={parcela.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Hash className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Parcela {parcela.numero_parcela}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{formatarDataBR(parcela.data_prevista)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">R$ {parcela.valor_parcela.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(parcela.status)}>{getStatusText(parcela.status)}</Badge>
                            <div className="flex space-x-1">
                              <Button size="sm" variant={parcela.status === "pendente" ? "default" : "outline"} onClick={() => updateParcelaStatus(parcela.id, "pendente")} className="h-8 px-2">Pendente</Button>
                              <Button size="sm" variant={parcela.status === "recebida" ? "default" : "outline"} onClick={() => updateParcelaStatus(parcela.id, "recebida")} className="h-8 px-2 bg-green-600 hover:bg-green-700">Recebida</Button>
                              <Button size="sm" variant={parcela.status === "vencida" ? "default" : "outline"} onClick={() => updateParcelaStatus(parcela.id, "vencida")} className="h-8 px-2 bg-red-600 hover:bg-red-700">Vencida</Button>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button size="sm" variant="outline" onClick={() => setParcelaEditando(parcela)} className="h-8 px-2">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setModalExcluirAberto(true)} className="h-8 px-2 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">Fechar</Button>
        </div>
      </DialogContent>

      <AlertDialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a parcela selecionada?
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (parcelaEditando) {
                  await deleteParcela(parcelaEditando.id);
                  setModalExcluirAberto(false);
                  setParcelaEditando(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditarParcelaReceitaModal
        isOpen={!!parcelaEditando}
        onClose={() => setParcelaEditando(null)}
        parcela={parcelaEditando}
        onSave={async (id, updates) => {
          await updateParcela(id, updates);
          setParcelaEditando(null);
        }}
      />
    </Dialog>
  );
};


