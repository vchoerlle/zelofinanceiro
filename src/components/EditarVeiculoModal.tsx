
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Veiculo } from "@/hooks/useVeiculos";

interface EditarVeiculoModalProps {
  veiculo: Veiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditarVeiculo: (veiculo: Veiculo) => void;
}

export const EditarVeiculoModal = ({ veiculo, open, onOpenChange, onEditarVeiculo }: EditarVeiculoModalProps) => {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    cor: '',
    combustivel: '',
    data_aquisicao: '',
    quilometragem: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (veiculo) {
      setFormData({
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        placa: veiculo.placa === "Não informada" ? "" : veiculo.placa,
        cor: veiculo.cor === "Não informada" ? "" : veiculo.cor,
        combustivel: veiculo.combustivel === "Não informado" ? "" : veiculo.combustivel,
        data_aquisicao: veiculo.data_aquisicao || "",
        quilometragem: veiculo.quilometragem.toString()
      });
    }
  }, [veiculo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.marca || !formData.modelo || !formData.ano || !formData.quilometragem || !veiculo) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const veiculoEditado: Veiculo = {
      ...veiculo,
      marca: formData.marca,
      modelo: formData.modelo,
      ano: formData.ano,
      placa: formData.placa || "Não informada",
      cor: formData.cor || "Não informada",
      combustivel: formData.combustivel || "Não informado",
      data_aquisicao: formData.data_aquisicao,
      quilometragem: Number(formData.quilometragem)
    };

    onEditarVeiculo(veiculoEditado);
    onOpenChange(false);
    
    toast({
      title: "Sucesso",
      description: "Veículo editado com sucesso!"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!veiculo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Veículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Ex: Nissan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Ex: Versa"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Ano *</Label>
              <Input
                id="ano"
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', e.target.value)}
                placeholder="Ex: 2019/2019"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                placeholder="Ex: ABC-1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Select value={formData.cor} onValueChange={(value) => handleInputChange('cor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Branco">Branco</SelectItem>
                  <SelectItem value="Preto">Preto</SelectItem>
                  <SelectItem value="Prata">Prata</SelectItem>
                  <SelectItem value="Cinza">Cinza</SelectItem>
                  <SelectItem value="Vermelho">Vermelho</SelectItem>
                  <SelectItem value="Azul">Azul</SelectItem>
                  <SelectItem value="Verde">Verde</SelectItem>
                  <SelectItem value="Amarelo">Amarelo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível</Label>
              <Select value={formData.combustivel} onValueChange={(value) => handleInputChange('combustivel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o combustível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasolina">Gasolina</SelectItem>
                  <SelectItem value="Etanol">Etanol</SelectItem>
                  <SelectItem value="Flex (Gasolina/Etanol)">Flex (Gasolina/Etanol)</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="GNV">GNV</SelectItem>
                  <SelectItem value="Elétrico">Elétrico</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
              <Input
                id="data_aquisicao"
                type="date"
                value={formData.data_aquisicao}
                onChange={(e) => handleInputChange('data_aquisicao', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quilometragem">Quilometragem *</Label>
              <Input
                id="quilometragem"
                type="number"
                min="0"
                value={formData.quilometragem}
                onChange={(e) => handleInputChange('quilometragem', e.target.value)}
                placeholder="Ex: 50000"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
