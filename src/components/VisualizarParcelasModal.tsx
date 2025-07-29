import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useParcelasDividas, ParcelaDivida } from "@/hooks/useParcelasDividas";
import { EditarParcelaModal } from "./EditarParcelaModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, DollarSign, Hash, Edit, Trash2 } from "lucide-react";

// Função para formatar data no formato brasileiro (dd/mm/yyyy) sem problemas de fuso horário
const formatarDataBR = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
};

interface VisualizarParcelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  dividaId: string;
  dividaDescricao: string;
}

export const VisualizarParcelasModal = ({ 
  isOpen, 
  onClose, 
  dividaId, 
  dividaDescricao 
}: VisualizarParcelasModalProps) => {
  const { parcelas, loading, fetchParcelasByDivida, updateParcelaStatus, updateParcela, deleteParcela } = useParcelasDividas();
  
  // Estados para modais
  const [parcelaEditando, setParcelaEditando] = useState<ParcelaDivida | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [parcelaExcluindo, setParcelaExcluindo] = useState<ParcelaDivida | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  useEffect(() => {
    if (isOpen && dividaId) {
      fetchParcelasByDivida(dividaId);
    }
  }, [isOpen, dividaId]);

  // Escutar eventos de mudança de status para recarregar dados
  useEffect(() => {
    const handleStatusChange = () => {
      if (isOpen && dividaId) {
        fetchParcelasByDivida(dividaId);
      }
    };

    window.addEventListener('parcelaStatusChanged', handleStatusChange);
    return () => window.removeEventListener('parcelaStatusChanged', handleStatusChange);
  }, [isOpen, dividaId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paga':
        return 'bg-green-100 text-green-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paga':
        return 'Paga';
      case 'vencida':
        return 'Vencida';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const handleStatusChange = async (parcelaId: string, newStatus: 'pendente' | 'paga' | 'vencida') => {
    await updateParcelaStatus(parcelaId, newStatus);
  };

  const handleEditarParcela = (parcela: ParcelaDivida) => {
    setParcelaEditando(parcela);
    setModalEditarAberto(true);
  };

  const handleSalvarEdicao = async (parcelaId: string, updates: { descricao?: string; valor?: number; data?: string }) => {
    await updateParcela(parcelaId, updates);
    setModalEditarAberto(false);
    setParcelaEditando(null);
  };

  const handleExcluirParcela = (parcela: ParcelaDivida) => {
    setParcelaExcluindo(parcela);
    setModalExcluirAberto(true);
  };

  const confirmarExclusao = async () => {
    if (parcelaExcluindo) {
      await deleteParcela(parcelaExcluindo.id);
      setModalExcluirAberto(false);
      setParcelaExcluindo(null);
    }
  };

  const parcelasPagas = parcelas.filter(p => p.status === 'paga').length;
  const parcelasVencidas = parcelas.filter(p => p.status === 'vencida').length;
  const parcelasPendentes = parcelas.filter(p => p.status === 'pendente').length;
  const valorTotalParcelas = parcelas.reduce((total, p) => total + p.valor_parcela, 0);
  const valorPago = parcelas.filter(p => p.status === 'paga').reduce((total, p) => total + p.valor_parcela, 0);





  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parcelas do Parcelamento</DialogTitle>
          <DialogDescription>
            Visualize e gerencie as parcelas de: <strong>{dividaDescricao}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo */}
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
                    <div className="text-2xl font-bold text-green-600">{parcelasPagas}</div>
                    <div className="text-sm text-gray-600">Parcelas Pagas</div>
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
                      <div className="text-lg font-semibold text-gray-800">
                        R$ {valorTotalParcelas.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        R$ {valorPago.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Valor Pago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Parcelas */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Detalhes das Parcelas</h3>
              {parcelas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma parcela encontrada para este parcelamento.
                </div>
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
                              <span className="text-sm text-gray-600">
                                {formatarDataBR(parcela.data_vencimento)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                R$ {parcela.valor_parcela.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(parcela.status)}>
                              {getStatusText(parcela.status)}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant={parcela.status === 'pendente' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(parcela.id, 'pendente')}
                                className="h-8 px-2"
                              >
                                Pendente
                              </Button>
                              <Button
                                size="sm"
                                variant={parcela.status === 'paga' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(parcela.id, 'paga')}
                                className="h-8 px-2 bg-green-600 hover:bg-green-700"
                              >
                                Paga
                              </Button>
                              <Button
                                size="sm"
                                variant={parcela.status === 'vencida' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(parcela.id, 'vencida')}
                                className="h-8 px-2 bg-red-600 hover:bg-red-700"
                              >
                                Vencida
                              </Button>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditarParcela(parcela)}
                                className="h-8 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleExcluirParcela(parcela)}
                                className="h-8 px-2 text-red-600 hover:text-red-700"
                              >
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
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>

      {/* Modal de Editar Parcela */}
      <EditarParcelaModal
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setParcelaEditando(null);
        }}
        parcela={parcelaEditando}
        onSave={handleSalvarEdicao}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a parcela {parcelaExcluindo?.numero_parcela}?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
              <br />
              A parcela será removida permanentemente e não poderá ser recuperada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}; 