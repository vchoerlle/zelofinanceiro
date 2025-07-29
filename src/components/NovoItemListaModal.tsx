import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NovoItemListaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { descricao: string; quantidade: number; unidade_medida: string }) => void;
}

export const NovoItemListaModal = ({ isOpen, onClose, onSave }: NovoItemListaModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    descricao: '',
    quantidade: 1,
    unidade_medida: 'un'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao.trim()) {
      toast({
        title: "Erro",
        description: "A descrição é obrigatória",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    setFormData({ descricao: '', quantidade: 1, unidade_medida: 'un' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ descricao: '', quantidade: 1, unidade_medida: 'un' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item à Lista</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Ex: Arroz, Leite, Pão..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: parseFloat(e.target.value) || 1})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade_medida">Unidade</Label>
              <select
                id="unidade_medida"
                value={formData.unidade_medida}
                onChange={(e) => setFormData({...formData, unidade_medida: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="un">Unidade</option>
                <option value="kg">Quilograma</option>
                <option value="g">Grama</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="pct">Pacote</option>
                <option value="cx">Caixa</option>
                <option value="dz">Dúzia</option>
                <option value="pcs">Peças</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 