import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategorias } from "@/hooks/useCategorias";
import { useReceitas } from "@/hooks/useReceitas";
import { EditarReceitaModal } from "@/components/EditarReceitaModal";
import { SortableTableHead } from "@/components/SortableTableHead";
import { useTableSort } from "@/hooks/useTableSort";
import { renderIcon } from "@/lib/icon-utils";

interface Receita {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  tipo: "fixa" | "variavel";
}

const Receitas = () => {
  const { toast } = useToast();
  const { categoriasReceita } = useCategorias();
  const { receitas, createReceita, updateReceita, deleteReceita } =
    useReceitas();
  const [activeTab, setActiveTab] = useState("lista");

  const [novaReceita, setNovaReceita] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    data: "",
    tipo: "variavel" as "fixa" | "variavel",
  });

  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  // Função para formatar data no formato brasileiro (dd/mm/yyyy)
  const formatarDataBR = (dataString: string) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Função para obter o primeiro dia do mês atual no formato YYYY-MM-DD
  const getPrimeiroDiaMes = () => {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}-01`;
  };

  // Função para obter o último dia do mês atual no formato YYYY-MM-DD
  const getUltimoDiaMes = () => {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth() + 1;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    return `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  };

  const [dataInicial, setDataInicial] = useState(getPrimeiroDiaMes());
  const [dataFinal, setDataFinal] = useState(getUltimoDiaMes());

  // Estados para o modal de edição
  const [receitaEditando, setReceitaEditando] = useState<Receita | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  const adicionarReceita = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !novaReceita.descricao ||
      !novaReceita.valor ||
      !novaReceita.categoria ||
      !novaReceita.data
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const categoria = categoriasReceita.find(
      (c) => c.nome === novaReceita.categoria
    );

    await createReceita({
      descricao: novaReceita.descricao,
      valor: parseFloat(novaReceita.valor),
      categoria_id: categoria?.id,
      data: novaReceita.data,
    });

    setNovaReceita({
      descricao: "",
      valor: "",
      categoria: "",
      data: "",
      tipo: "variavel",
    });

    setActiveTab("lista");
  };

  const handleEditarReceita = (receita: any) => {
    const receitaFormatada = {
      id: receita.id,
      descricao: receita.descricao,
      valor: receita.valor,
      categoria: receita.categorias?.nome || "",
      data: receita.data,
      tipo: "variavel" as "fixa" | "variavel",
    };
    setReceitaEditando(receitaFormatada);
    setModalEditarAberto(true);
  };

  const handleSalvarEdicao = async (receitaAtualizada: Receita) => {
    const categoria = categoriasReceita.find(
      (c) => c.nome === receitaAtualizada.categoria
    );

    await updateReceita(receitaAtualizada.id, {
      descricao: receitaAtualizada.descricao,
      valor: receitaAtualizada.valor,
      categoria_id: categoria?.id,
      data: receitaAtualizada.data,
    });
  };

  const handleExcluirReceita = async (id: string) => {
    await deleteReceita(id);
  };

  // Função para aplicar filtro de data
  const aplicarFiltroData = (receita: any) => {
    if (!dataInicial && !dataFinal) {
      return true; // Se não há filtro de data, retorna todas
    }

    const dataReceita = receita.data.split('T')[0]; // Pega apenas a data (YYYY-MM-DD)

    if (dataInicial && dataFinal) {
      // Filtro com data inicial e final
      return dataReceita >= dataInicial && dataReceita <= dataFinal;
    } else if (dataInicial) {
      // Apenas data inicial
      return dataReceita >= dataInicial;
    } else if (dataFinal) {
      // Apenas data final
      return dataReceita <= dataFinal;
    }

    return true;
  };

  const receitasFiltradas = receitas
    .filter((receita) => {
      const matchDescricao = receita.descricao
        .toLowerCase()
        .includes(filtro.toLowerCase());
      const matchCategoria =
        categoriaFiltro === "" || receita.categorias?.nome === categoriaFiltro;
      const matchData = aplicarFiltroData(receita);
      return matchDescricao && matchCategoria && matchData;
    });

  // Hook para ordenação da tabela
  const { sortedData: receitasOrdenadas, requestSort, getSortDirection } = useTableSort(
    receitasFiltradas,
    { key: 'data', direction: 'desc' } // Ordenação padrão por data decrescente
  );

  const totalReceitas = receitasFiltradas.reduce(
    (total, receita) => total + receita.valor,
    0
  );
  const categorias = categoriasReceita.map((c) => c.nome);

  const limparFiltros = () => {
    setFiltro("");
    setCategoriaFiltro("");
    setDataInicial("");
    setDataFinal("");
  };

  const validarDatas = () => {
    if (dataInicial && dataFinal && dataInicial > dataFinal) {
      toast({
        title: "Erro",
        description: "A data inicial não pode ser maior que a data final",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDataInicialChange = (value: string) => {
    setDataInicial(value);
    if (value && dataFinal && value > dataFinal) {
      toast({
        title: "Aviso",
        description: "A data inicial não pode ser maior que a data final",
        variant: "destructive",
      });
    }
  };

  const handleDataFinalChange = (value: string) => {
    setDataFinal(value);
    if (value && dataInicial && dataInicial > value) {
      toast({
        title: "Aviso",
        description: "A data final não pode ser menor que a data inicial",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Receitas
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Gerencie suas fontes de renda
            </p>
          </div>
          <Button
            onClick={() => setActiveTab("adicionar")}
            className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </div>

        {/* Filtro de Período - Topo da Tela */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => handleDataInicialChange(e.target.value)}
                className="w-40 h-8 text-sm"
                placeholder="Data inicial"
                max={dataFinal || undefined}
              />
              <span className="text-sm text-gray-500">até</span>
              <Input
                type="date"
                value={dataFinal}
                onChange={(e) => handleDataFinalChange(e.target.value)}
                className="w-40 h-8 text-sm"
                placeholder="Data final"
                min={dataInicial || undefined}
              />
            </div>
            {(dataInicial || dataFinal) && (
              <Button
                variant="outline"
                size="sm"
                onClick={limparFiltros}
                className="h-8 text-xs"
              >
                Limpar
              </Button>
            )}
          </div>
          {(dataInicial || dataFinal) && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {dataInicial && dataFinal && (
                <span>{formatarDataBR(dataInicial)} - {formatarDataBR(dataFinal)}</span>
              )}
              {dataInicial && !dataFinal && (
                <span>A partir de {formatarDataBR(dataInicial)}</span>
              )}
              {!dataInicial && dataFinal && (
                <span>Até {formatarDataBR(dataFinal)}</span>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 rounded-full p-2 md:p-3">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">
                  Total de Receitas
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  R${" "}
                  {totalReceitas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {receitasFiltradas.length} receita{receitasFiltradas.length !== 1 ? 's' : ''}
                  {(dataInicial || dataFinal) && (
                    <span className="text-blue-600 font-medium"> • Filtrado</span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-2 md:p-3">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Receitas</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {receitasFiltradas.length}
                </p>
                <p className="text-xs text-gray-500">
                  {(dataInicial || dataFinal) && (
                    <span className="text-blue-600 font-medium"> • Filtrado</span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 rounded-full p-2 md:p-3">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Categorias</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {categoriasReceita.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 md:space-y-6"
        >
          <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex">
            <TabsTrigger value="lista" className="text-sm">
              Lista de Receitas
            </TabsTrigger>
            <TabsTrigger value="adicionar" className="text-sm">
              Adicionar Receita
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4 md:space-y-6">
            {/* Filtros */}
            <Card className="p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">
                Filtros
              </h2>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar receitas..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    id="categoria-filtro"
                    title="Filtrar por categoria"
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    onClick={limparFiltros}
                    className="w-full sm:w-auto"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabela de Receitas - Visível apenas em desktop */}
            <div className="hidden md:block">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        sortKey="descricao"
                        currentSortDirection={getSortDirection('descricao')}
                        onSort={requestSort}
                      >
                        Descrição
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="categorias.nome"
                        currentSortDirection={getSortDirection('categorias.nome')}
                        onSort={requestSort}
                      >
                        Categoria
                      </SortableTableHead>
                      <TableHead>Tipo</TableHead>
                      <SortableTableHead
                        sortKey="data"
                        currentSortDirection={getSortDirection('data')}
                        onSort={requestSort}
                      >
                        Data
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="valor"
                        currentSortDirection={getSortDirection('valor')}
                        onSort={requestSort}
                        className="text-right"
                      >
                        Valor
                      </SortableTableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitasOrdenadas.map((receita) => (
                      <TableRow key={receita.id}>
                        <TableCell className="font-medium">
                          {receita.descricao}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: receita.categorias?.cor || "#6B7280" }}
                            />
                            {receita.categorias?.icone && renderIcon(receita.categorias.icone)}
                            <span>{receita.categorias?.nome || "Sem categoria"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Receita
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(
                            receita.data + "T00:00:00"
                          ).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          R${" "}
                          {receita.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarReceita(receita)}
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
                                  <AlertDialogTitle>
                                    Confirmar exclusão
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a receita "
                                    {receita.descricao}"? Esta ação não pode ser
                                    desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleExcluirReceita(receita.id)
                                    }
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Visualização Mobile - Cards */}
            <div className="md:hidden space-y-4">
              {receitasFiltradas.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-gray-500">
                    Nenhuma receita encontrada.
                  </p>
                </Card>
              ) : (
                receitasFiltradas.map((receita) => (
                  <Card key={receita.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {receita.descricao}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Receita
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Categoria</p>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: receita.categorias?.cor || "#6B7280" }}
                            />
                            {receita.categorias?.icone && renderIcon(receita.categorias.icone)}
                            <p className="font-medium">
                              {receita.categorias?.nome || "Sem categoria"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Data</p>
                          <p className="font-medium">
                            {new Date(
                              receita.data + "T00:00:00"
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-bold text-green-600">
                          R${" "}
                          {receita.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarReceita(receita)}
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
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a receita "
                                  {receita.descricao}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleExcluirReceita(receita.id)
                                  }
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="adicionar">
            <Card className="p-4 md:p-6">
              <form onSubmit={adicionarReceita} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      placeholder="Ex: Salário, Freelance, Aluguel..."
                      value={novaReceita.descricao}
                      onChange={(e) =>
                        setNovaReceita({
                          ...novaReceita,
                          descricao: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={novaReceita.valor}
                      onChange={(e) =>
                        setNovaReceita({
                          ...novaReceita,
                          valor: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <select
                      id="categoria"
                      title="Selecionar categoria"
                      value={novaReceita.categoria}
                      onChange={(e) =>
                        setNovaReceita({
                          ...novaReceita,
                          categoria: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categoriasReceita.map((categoria) => (
                        <option key={categoria.id} value={categoria.nome}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novaReceita.data}
                      onChange={(e) =>
                        setNovaReceita({ ...novaReceita, data: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Tipo de Receita</Label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="tipo"
                          value="fixa"
                          checked={novaReceita.tipo === "fixa"}
                          onChange={(e) =>
                            setNovaReceita({
                              ...novaReceita,
                              tipo: e.target.value as "fixa" | "variavel",
                            })
                          }
                          className="text-orange-600"
                        />
                        <span>Receita Fixa</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="tipo"
                          value="variavel"
                          checked={novaReceita.tipo === "variavel"}
                          onChange={(e) =>
                            setNovaReceita({
                              ...novaReceita,
                              tipo: e.target.value as "fixa" | "variavel",
                            })
                          }
                          className="text-orange-600"
                        />
                        <span>Receita Variável</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 sm:space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("lista")}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Receita
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Edição */}
        <EditarReceitaModal
          receita={receitaEditando}
          isOpen={modalEditarAberto}
          onClose={() => {
            setModalEditarAberto(false);
            setReceitaEditando(null);
          }}
          onSave={handleSalvarEdicao}
        />
      </div>
    </DashboardLayout>
  );
};

export default Receitas;
