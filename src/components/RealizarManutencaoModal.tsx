import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Car, DollarSign } from "lucide-react";
import { ManutencaoPendente } from "@/hooks/useManutencoesPendentes";

interface RealizarManutencaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencao: ManutencaoPendente | null;
  onRealizarManutencao: (manutencao: ManutencaoPendente, dados: {
    quilometragem: number;
    valor: number;
    observacoes: string;
  }) => void;
}

export const RealizarManutencaoModal = ({
  open,
  onOpenChange,
  manutencao,
  onRealizarManutencao
}: RealizarManutencaoModalProps) => {
  const [formData, setFormData] = useState({
    quilometragem: "",
    valor: "",
    observacoes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (manutencao && open) {
      setFormData({
        quilometragem: manutencao.veiculo?.quilometragem.toString() || "",
        valor: "",
        observacoes: ""
      });
    }
  }, [manutencao, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manutencao) return;

    if (!formData.quilometragem || !formData.valor) {
      toast({
        title: "Erro",
        description: "Por favor, preencha a quilometragem e o valor da manutenção.",
        variant: "destructive"
      });
      return;
    }

    const quilometragem = parseInt(formData.quilometragem);
    const valor = parseFloat(formData.valor);

    if (isNaN(quilometragem) || isNaN(valor)) {
      toast({
        title: "Erro",
        description: "Por favor, insira valores válidos para quilometragem e valor.",
        variant: "destructive"
      });
      return;
    }

    if (quilometragem < (manutencao.veiculo?.quilometragem || 0)) {
      toast({
        title: "Erro",
        description: "A quilometragem informada não pode ser menor que a quilometragem atual do veículo.",
        variant: "destructive"
      });
      return;
    }

    onRealizarManutencao(manutencao, {
      quilometragem,
      valor,
      observacoes: formData.observacoes
    });

    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!manutencao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-orange-500" />
            Realizar Manutenção
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da Manutenção */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
              {manutencao.tipo}
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>Sistema: {manutencao.sistema}</p>
              <p>Veículo: {manutencao.veiculo?.marca} {manutencao.veiculo?.modelo}</p>
              <p>Quilometragem Atual: {manutencao.veiculo?.quilometragem.toLocaleString()} km</p>
            </div>
          </div>

          {/* Quilometragem */}
          <div className="space-y-2">
            <Label htmlFor="quilometragem">
              <Car className="w-4 h-4 inline mr-1" />
              Quilometragem do Veículo *
            </Label>
            <Input
              id="quilometragem"
              type="number"
              value={formData.quilometragem}
              onChange={(e) => handleInputChange('quilometragem', e.target.value)}
              placeholder="Ex: 50000"
              min={manutencao.veiculo?.quilometragem || 0}
              required
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Valor da Manutenção (R$) *
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              placeholder="Ex: 150.00"
              min="0"
              required
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Detalhes da manutenção realizada..."
              rows={3}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Realizar Manutenção
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 