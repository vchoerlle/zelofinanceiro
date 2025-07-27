
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  descricao?: string | null;
  created_at: string;
  updated_at: string;
}

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (categoria: Omit<Categoria, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // ✅ Verificar se já existe uma categoria com o mesmo nome e tipo para o usuário
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: existingCategoria, error: checkError } = await supabase
        .from('categorias')
        .select('id, nome, tipo')
        .eq('user_id', user.id)
        .eq('nome', categoria.nome)
        .eq('tipo', categoria.tipo)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingCategoria) {
        throw new Error(`Já existe uma categoria "${categoria.nome}" do tipo "${categoria.tipo}".`);
      }

      const { data, error } = await supabase
        .from('categorias')
        .insert([{
          ...categoria,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setCategorias(prev => [...prev, data]);
      
      toast({
        title: "Categoria criada",
        description: "Categoria criada com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCategoria = async (id: string, updates: Partial<Categoria>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCategorias(prev => prev.map(cat => cat.id === id ? data : cat));
      
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      // ✅ Verificar se a categoria está sendo utilizada antes de excluir
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar a categoria para obter o nome e tipo
      const { data: categoria, error: categoriaError } = await supabase
        .from('categorias')
        .select('nome, tipo')
        .eq('id', id)
        .single();

      if (categoriaError) throw categoriaError;

      // ✅ Verificar se a categoria está sendo utilizada em todas as tabelas relacionadas
      let totalUsos = 0;
      const usosDetalhados: string[] = [];

      // Verificar receitas
      const { data: receitasUsando, error: receitasError } = await supabase
        .from('receitas')
        .select('id')
        .eq('categoria_id', id)
        .eq('user_id', user.id);
      if (receitasError) throw receitasError;
      if (receitasUsando && receitasUsando.length > 0) {
        totalUsos += receitasUsando.length;
        usosDetalhados.push(`${receitasUsando.length} receitas`);
      }

      // Verificar despesas
      const { data: despesasUsando, error: despesasError } = await supabase
        .from('despesas')
        .select('id')
        .eq('categoria_id', id)
        .eq('user_id', user.id);
      if (despesasError) throw despesasError;
      if (despesasUsando && despesasUsando.length > 0) {
        totalUsos += despesasUsando.length;
        usosDetalhados.push(`${despesasUsando.length} despesas`);
      }

      // Verificar transações
      const { data: transacoesUsando, error: transacoesError } = await supabase
        .from('transacoes')
        .select('id')
        .eq('categoria_id', id)
        .eq('user_id', user.id);
      if (transacoesError) throw transacoesError;
      if (transacoesUsando && transacoesUsando.length > 0) {
        totalUsos += transacoesUsando.length;
        usosDetalhados.push(`${transacoesUsando.length} transações`);
      }

      // Verificar dívidas
      const { data: dividasUsando, error: dividasError } = await supabase
        .from('dividas')
        .select('id')
        .eq('categoria_id', id)
        .eq('user_id', user.id);
      if (dividasError) throw dividasError;
      if (dividasUsando && dividasUsando.length > 0) {
        totalUsos += dividasUsando.length;
        usosDetalhados.push(`${dividasUsando.length} dívidas`);
      }

      // Verificar análises de IA
      const { data: iaResultsUsando, error: iaResultsError } = await supabase
        .from('ia_analysis_results')
        .select('id')
        .eq('categoria_id', id)
        .eq('user_id', user.id);
      if (iaResultsError) throw iaResultsError;
      if (iaResultsUsando && iaResultsUsando.length > 0) {
        totalUsos += iaResultsUsando.length;
        usosDetalhados.push(`${iaResultsUsando.length} análises de IA`);
      }

      if (totalUsos > 0) {
        const detalhesUsos = usosDetalhados.join(', ');
        const mensagem = `Não é possível excluir a categoria "${categoria.nome}" porque ela está sendo utilizada em: ${detalhesUsos}.`;
        
        toast({
          title: "Categoria em uso",
          description: mensagem,
          variant: "destructive",
        });
        
        return { error: new Error(mensagem) };
      }

      // Se não está sendo usada, prosseguir com a exclusão
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategorias(prev => prev.filter(cat => cat.id !== id));
      
      toast({
        title: "Categoria removida",
        description: "Categoria removida com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover categoria",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Filtros para compatibilidade com componentes existentes
  const categoriasReceita = categorias.filter(c => c.tipo === 'receita');
  const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa');

  return {
    categorias,
    categoriasReceita,
    categoriasDespesa,
    loading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    refetch: fetchCategorias
  };
};
