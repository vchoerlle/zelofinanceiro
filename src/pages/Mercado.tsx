import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  Circle,
  ShoppingCart,
  Trash,
} from "lucide-react";
import { NovoItemListaModal } from "@/components/NovoItemListaModal";
import { EditarItemListaModal } from "@/components/EditarItemListaModal";
import { useToast } from "@/hooks/use-toast";
import { useListaCompras, type ItemListaCompras } from "@/hooks/useListaCompras";

const Mercado = () => {
  const { toast } = useToast();
  const { 
    itensLista, 
    loading, 
    createItemLista, 
    updateItemLista, 
    deleteItemLista, 
    toggleItemComprado,
    limparItensComprados 
  } = useListaCompras();

  const [filtro, setFiltro] = useState("");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemListaCompras | null>(null);

  const handleAdicionarItem = async (novoItem: { descricao: string; quantidade: number; unidade_medida: string }) => {
    await createItemLista(novoItem);
  };

  const handleEditarItem = async (id: string, updates: { descricao: string; quantidade: number; unidade_medida: string }) => {
    await updateItemLista(id, updates);
  };

  const handleExcluirItem = async (id: string) => {
    await deleteItemLista(id);
  };

  const handleToggleComprado = async (id: string, comprado: boolean) => {
    await toggleItemComprado(id, comprado);
  };

  const handleLimparComprados = async () => {
    await limparItensComprados();
  };

  const abrirModalEdicao = (item: ItemListaCompras) => {
    setItemEditando(item);
    setModalEditarAberto(true);
  };

  const fecharModalEdicao = () => {
    setItemEditando(null);
    setModalEditarAberto(false);
  };

  const getUnidadeMedidaLabel = (unidade: string) => {
    const unidades: { [key: string]: string } = {
      'un': 'un',
      'kg': 'kg',
      'g': 'g',
      'l': 'L',
      'ml': 'ml',
      'pct': 'pct',
      'cx': 'cx',
      'dz': 'dz',
      'pcs': 'pcs'
    };
    return unidades[unidade] || unidade;
  };

  const itensFiltrados = itensLista
    .filter((item) => {
      const matchDescricao = item.descricao
        .toLowerCase()
        .includes(filtro.toLowerCase());
      return matchDescricao;
    })
    .sort((a, b) => {
      // Primeiro os não comprados, depois os comprados
      if (a.comprado !== b.comprado) {
        return a.comprado ? 1 : -1;
      }
      // Dentro de cada grupo, ordenar por data de criação (mais recentes primeiro)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const itensNaoComprados = itensFiltrados.filter(item => !item.comprado);
  const itensComprados = itensFiltrados.filter(item => item.comprado);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando lista de compras...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
            <p className="text-gray-600">Gerencie sua lista de compras do mercado</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setModalNovoAberto(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
            {itensComprados.length > 0 && (
              <Button
                variant="outline"
                onClick={handleLimparComprados}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="w-4 h-4 mr-2" />
                Limpar Comprados
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar itens..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{itensLista.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">A Comprar</p>
                <p className="text-2xl font-bold text-blue-600">{itensNaoComprados.length}</p>
              </div>
              <Circle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comprados</p>
                <p className="text-2xl font-bold text-green-600">{itensComprados.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Lista de Itens */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Itens não comprados */}
            {itensNaoComprados.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">A Comprar</h3>
                <div className="space-y-2">
                  {itensNaoComprados.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={item.comprado}
                          onCheckedChange={(checked) => 
                            handleToggleComprado(item.id, checked as boolean)
                          }
                          className="text-green-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.descricao}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade} {getUnidadeMedidaLabel(item.unidade_medida)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirModalEdicao(item)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover "{item.descricao}" da lista? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluirItem(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itens comprados */}
            {itensComprados.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Comprados</h3>
                <div className="space-y-2">
                  {itensComprados.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={item.comprado}
                          onCheckedChange={(checked) => 
                            handleToggleComprado(item.id, checked as boolean)
                          }
                          className="text-green-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 line-through">{item.descricao}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade} {getUnidadeMedidaLabel(item.unidade_medida)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirModalEdicao(item)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover "{item.descricao}" da lista? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluirItem(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {itensFiltrados.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filtro ? "Nenhum item encontrado com essa busca." : "Sua lista de compras está vazia."}
                </p>
                {!filtro && (
                  <Button
                    onClick={() => setModalNovoAberto(true)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Modais */}
        <NovoItemListaModal
          isOpen={modalNovoAberto}
          onClose={() => setModalNovoAberto(false)}
          onSave={handleAdicionarItem}
        />

        <EditarItemListaModal
          item={itemEditando}
          isOpen={modalEditarAberto}
          onClose={fecharModalEdicao}
          onSave={handleEditarItem}
        />
      </div>
    </DashboardLayout>
  );
};

export default Mercado;
