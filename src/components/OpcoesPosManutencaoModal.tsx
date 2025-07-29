import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wrench, DollarSign, CreditCard, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OpcoesPosManutencaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dadosManutencao: {
    tipo: string;
    veiculo: string;
    valor: number;
    observacoes: string;
  } | null;
}

export const OpcoesPosManutencaoModal = ({
  open,
  onOpenChange,
  dadosManutencao
}: OpcoesPosManutencaoModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGerarDespesa = () => {
    if (!dadosManutencao) return;
    
    const dadosDespesa = {
      descricao: `Manutenção: ${dadosManutencao.tipo} - ${dadosManutencao.veiculo}`,
      valor: dadosManutencao.valor,
      data: new Date().toISOString().split('T')[0],
      observacoes: dadosManutencao.observacoes
    };

    // Navegar para a página de despesas com os dados preenchidos
    navigate('/despesas', { 
      state: { 
        novaDespesa: dadosDespesa,
        origem: 'manutencao'
      } 
    });
    
    onOpenChange(false);
  };

  const handleGerarParcelamento = () => {
    if (!dadosManutencao) return;
    
    const dadosParcelamento = {
      descricao: `Manutenção: ${dadosManutencao.tipo} - ${dadosManutencao.veiculo}`,
      valor_total: dadosManutencao.valor,
      credor: "Oficina/Concessionária",
      data_vencimento: new Date().toISOString().split('T')[0],
      observacoes: dadosManutencao.observacoes
    };

    // Navegar para a página de dívidas com os dados preenchidos
    navigate('/dividas', { 
      state: { 
        novoParcelamento: dadosParcelamento,
        origem: 'manutencao'
      } 
    });
    
    onOpenChange(false);
  };

  const handleFechar = () => {
    onOpenChange(false);
    toast({
      title: "Sucesso",
      description: "Manutenção realizada com sucesso!",
    });
  };

  if (!dadosManutencao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Manutenção Realizada!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Resumo da Manutenção */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Wrench className="w-4 h-4 mr-2 text-orange-500" />
                {dadosManutencao.tipo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Veículo:</strong> {dadosManutencao.veiculo}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Valor:</strong> R$ {dadosManutencao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {dadosManutencao.observacoes && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Observações:</strong> {dadosManutencao.observacoes}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Opções */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
              Deseja gerar um registro financeiro?
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleGerarDespesa}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Gerar Despesa
              </Button>
              
              <Button
                onClick={handleGerarParcelamento}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Gerar Parcelamento
              </Button>
            </div>
          </div>

          {/* Botão Fechar */}
          <Button
            onClick={handleFechar}
            variant="outline"
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 