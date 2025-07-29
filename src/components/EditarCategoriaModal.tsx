
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { renderIcon } from "@/lib/icon-utils";

const cores = [
  "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#F59E0B", 
  "#DC2626", "#6B7280", "#EC4899", "#059669", "#FF6B35"
];

const icones = [
  "DollarSign", "CreditCard", "PiggyBank", "Wallet", "Banknote", "Coins", "Receipt", "Calculator", "ChartBar", "TrendingUp", "TrendingDown", "Target", "Briefcase", "ShoppingBag", "Home", "Utensils", "Car", "Heart", "BookOpen", "Gamepad2", "Shirt", "Smartphone", "Settings"
];

export interface Categoria {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string;
  icone: string;
  descricao?: string | null;
}

interface EditarCategoriaModalProps {
  categoria: Categoria;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (dadosEditados: Partial<Categoria>) => void;
}

export const EditarCategoriaModal = ({ categoria, open, onOpenChange, onSave }: EditarCategoriaModalProps) => {
  const [formData, setFormData] = useState({
    nome: categoria.nome,
    tipo: categoria.tipo,
    cor: categoria.cor,
    icone: categoria.icone,
    descricao: categoria.descricao || ""
  });

  useEffect(() => {
    if (categoria) {
      setFormData({
        nome: categoria.nome,
        tipo: categoria.tipo,
        cor: categoria.cor,
        icone: categoria.icone,
        descricao: categoria.descricao || ""
      });
    }
  }, [categoria]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    onSave({
      nome: formData.nome.trim(),
      tipo: formData.tipo as "receita" | "despesa",
      cor: formData.cor,
      icone: formData.icone,
      descricao: formData.descricao || null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleInputChange("tipo", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cor">Cor</Label>
            <div className="flex items-center space-x-2">
              <input
                id="cor"
                type="color"
                value={formData.cor}
                onChange={(e) => handleInputChange("cor", e.target.value)}
                className="w-12 h-10 border border-input bg-background text-foreground rounded-md"
              />
              <div className="flex flex-wrap gap-2">
                {cores.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => handleInputChange("cor", cor)}
                    className={`w-6 h-6 rounded-full border-2 ${formData.cor === cor ? "border-black" : "border-input bg-background text-foreground"}`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="icone">Ícone</Label>
            <select
              id="icone"
              value={formData.icone}
              onChange={(e) => handleInputChange("icone", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
            >
              <option value="DollarSign">💰 DollarSign</option>
              <option value="CreditCard">💳 CreditCard</option>
              <option value="PiggyBank">🏦 PiggyBank</option>
              <option value="Wallet">👛 Wallet</option>
              <option value="Banknote">💵 Banknote</option>
              <option value="Coins">🪙 Coins</option>
              <option value="Receipt">🧾 Receipt</option>
              <option value="Calculator">🧮 Calculator</option>
              <option value="ChartBar">📊 ChartBar</option>
              <option value="TrendingUp">📈 TrendingUp</option>
              <option value="TrendingDown">📉 TrendingDown</option>
              <option value="Target">🎯 Target</option>
              <option value="Briefcase">💼 Briefcase</option>
              <option value="ShoppingBag">🛍️ ShoppingBag</option>
              <option value="Home">🏠 Home</option>
              <option value="Utensils">🍽️ Utensils</option>
              <option value="Car">🚗 Car</option>
              <option value="Heart">❤️ Heart</option>
              <option value="BookOpen">📚 BookOpen</option>
              <option value="Gamepad2">🎮 Gamepad2</option>
              <option value="Shirt">👕 Shirt</option>
              <option value="Smartphone">📱 Smartphone</option>
              <option value="Settings">⚙️ Settings</option>
            </select>
            <div className="mt-2">{renderIcon(formData.icone)}</div>
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
