import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParcelaDivida } from "@/hooks/useParcelasDividas";

interface EditarParcelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcela: ParcelaDivida | null;
  onSave: (parcelaId: string, updates: { descricao?: string; valor?: number; data?: string }) => Promise<void>;
}

export const EditarParcelaModal = ({ 
  isOpen, 
  onClose, 
  parcela, 
  onSave 
}: EditarParcelaModalProps) => {
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data: ""
  });
  const [loading, setLoading] = useState(false);

  // Atualizar formData quando parcela mudar
  useEffect(() => {
    if (parcela) {
      setFormData({
        descricao: parcela.despesa?.descricao || "",
        valor: parcela.valor_parcela.toString(),
        data: parcela.data_vencimento
      });
    }
  }, [parcela]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcela) return;

    setLoading(true);
    try {
      await onSave(parcela.id, {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar parcela:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!parcela) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Parcela {parcela.numero_parcela}</DialogTitle>
          <DialogDescription>
            Edite as informações da parcela abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Descrição da parcela"
              required
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => handleChange("valor", e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="data">Data de Vencimento</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleChange("data", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 