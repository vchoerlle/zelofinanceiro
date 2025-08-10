import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, CreditCard, Filter, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategorias } from "@/hooks/useCategorias";
import { useReceitasParceladas, type ReceitaParcelada } from "@/hooks/useReceitasParceladas";
import { VisualizarParcelasReceitasModal } from "@/components/VisualizarParcelasReceitasModal";
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
import { renderIcon } from "@/lib/icon-utils";

const ReceitasParceladasPage = () => {
  const { toast } = useToast();
  const { categoriasReceita } = useCategorias();
  const { lista, createItem, deleteItem, fetchAll } = useReceitasParceladas();
  const [activeTab, setActiveTab] = useState("lista");

  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoValorTotal, setNovoValorTotal] = useState("");
  const [novaDataPrimeira, setNovaDataPrimeira] = useState("");
  const [novasParcelas, setNovasParcelas] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoPagador, setNovoPagador] = useState("");

  const [modalParcelasAberto, setModalParcelasAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<ReceitaParcelada | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [receitaExcluindo, setReceitaExcluindo] = useState<ReceitaParcelada | null>(null);

  const categoriasById = useMemo(() => {
    const map = new Map<string, { id: string; nome: string; cor: string; icone: string }>();
    categoriasReceita.forEach((c) => map.set(c.id, c as any));
    return map;
  }, [categoriasReceita]);

  const listaFiltrada = useMemo(() => {
    return lista
      .filter((r) => r.descricao.toLowerCase().includes(filtro.toLowerCase()))
      .filter((r) => (statusFiltro ? r.status === statusFiltro : true))
      .filter((r) => {
        if (!categoriaFiltro) return true;
        const cat = r.categoria_id ? categoriasById.get(r.categoria_id) : undefined;
        return cat?.nome === categoriaFiltro;
      });
  }, [lista, filtro, statusFiltro, categoriaFiltro, categoriasById]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "vencida":
        return "bg-red-100 text-red-800";
      case "quitada":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "vencida":
        return "Vencida";
      case "quitada":
        return "Quitada";
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAdicionar = async () => {
    if (!novaDescricao || !novoValorTotal || !novaDataPrimeira || !novasParcelas || !novaCategoria || !novoPagador) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    const categoria = categoriasReceita.find((c) => c.nome === novaCategoria);
    const { error } = await createItem({
      descricao: novaDescricao,
      valor_total: parseFloat(novoValorTotal),
      valor_restante: parseFloat(novoValorTotal),
      data_primeiro_recebimento: novaDataPrimeira,
      parcelas: parseInt(novasParcelas),
      categoria_id: categoria ? categoria.id : null,
      pagador: novoPagador,
    } as any);
    if (!error) {
      setNovaDescricao("");
      setNovoValorTotal("");
      setNovaDataPrimeira("");
      setNovasParcelas("");
      setNovaCategoria("");
      setNovoPagador("");
      setActiveTab("lista");
    }
  };

  const handleExcluirClick = (item: ReceitaParcelada) => {
    setReceitaExcluindo(item);
    setModalExcluirAberto(true);
  };

  const confirmarExclusao = async () => {
    if (receitaExcluindo) {
      const { error } = await deleteItem(receitaExcluindo.id);
      if (!error) {
        setModalExcluirAberto(false);
        setReceitaExcluindo(null);
        toast({ title: "Receita parcelada excluída" });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Receitas Parceladas</h1>
            <p className="text-sm md:text-base text-gray-600">Planeje e acompanhe seus recebimentos parcelados</p>
          </div>
          <Button onClick={() => setActiveTab("adicionar")} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nova Receita Parcelada
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex">
            <TabsTrigger value="lista" className="text-sm">Lista</TabsTrigger>
            <TabsTrigger value="adicionar" className="text-sm">Adicionar</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-foreground mb-4">Filtros</h2>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Buscar receitas parceladas..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-10" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="w-full sm:w-48 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="vencida">Vencidas</option>
                    <option value="quitada">Quitadas</option>
                  </select>
                  <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="w-full sm:w-48 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Todas as categorias</option>
                    {categoriasReceita.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Card className="p-0 overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Pagador</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Recebimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Restante</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listaFiltrada.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.descricao}</TableCell>
                      <TableCell>{r.pagador}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: (r.categoria_id && categoriasById.get(r.categoria_id)?.cor) || "#6B7280" }}
                          />
                          {r.categoria_id && categoriasById.get(r.categoria_id)?.icone && renderIcon(categoriasById.get(r.categoria_id)!.icone)}
                          <span>{(r.categoria_id && categoriasById.get(r.categoria_id)?.nome) || "Sem categoria"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.parcelas_recebidas}/{r.parcelas}
                      </TableCell>
                      <TableCell>
                        {new Date(r.data_primeiro_recebimento + "T00:00:00").toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                          {getStatusText(r.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        R$ {r.valor_restante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelecionada(r); setModalParcelasAberto(true); }}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950"
                            title="Visualizar Parcelas"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirClick(r)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </Card>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {listaFiltrada.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-gray-500">Nenhuma receita parcelada encontrada.</p>
                </Card>
              ) : (
                listaFiltrada.map((r) => {
                  const cat = r.categoria_id ? categoriasById.get(r.categoria_id) : undefined;
                  return (
                    <Card key={r.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{r.descricao}</h3>
                            <p className="text-sm text-gray-500">{r.pagador}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                            {getStatusText(r.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Categoria</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.cor || "#6B7280" }} />
                              {cat?.icone && renderIcon(cat.icone)}
                              <p className="font-medium">{cat?.nome || "Sem categoria"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Parcelas</p>
                            <p className="font-medium">{r.parcelas_recebidas}/{r.parcelas}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">1º Recebimento</p>
                            <p className="font-medium">{new Date(r.data_primeiro_recebimento + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Valor Restante</p>
                            <p className="font-medium text-red-600">R$ {r.valor_restante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelecionada(r); setModalParcelasAberto(true); }}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950"
                            title="Visualizar Parcelas"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-[425px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Receita Parcelada</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{r.descricao}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleExcluirClick(r)} className="bg-red-600 hover:bg-red-700">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="adicionar" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input id="descricao" value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Ex: Curso - Cliente X" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pagador">Pagador *</Label>
                  <Input id="pagador" value={novoPagador} onChange={(e) => setNovoPagador(e.target.value)} placeholder="Ex: Cliente X" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorTotal">Valor Total *</Label>
                  <Input id="valorTotal" type="number" value={novoValorTotal} onChange={(e) => setNovoValorTotal(e.target.value)} placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcelas">Total de Parcelas *</Label>
                  <Input id="parcelas" type="number" value={novasParcelas} onChange={(e) => setNovasParcelas(e.target.value)} placeholder="Ex: 12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <select id="categoria" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Selecione uma categoria</option>
                    {categoriasReceita.map((cat) => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPrimeira">Data do 1º Recebimento *</Label>
                  <Input id="dataPrimeira" type="date" value={novaDataPrimeira} onChange={(e) => setNovaDataPrimeira(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab("lista")}>Cancelar</Button>
                <Button onClick={handleAdicionar} className="bg-orange-500 hover:bg-orange-600">Salvar</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <VisualizarParcelasReceitasModal
        isOpen={modalParcelasAberto}
        onClose={() => { setModalParcelasAberto(false); setSelecionada(null); }}
        receitaParceladaId={selecionada?.id || ""}
        receitaDescricao={selecionada?.descricao || ""}
      />

      <AlertDialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a receita parcelada "{receitaExcluindo?.descricao}"?
              Esta ação removerá também as parcelas a receber vinculadas e não poderá ser desfeita.
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
    </DashboardLayout>
  );
};

export default ReceitasParceladasPage;


