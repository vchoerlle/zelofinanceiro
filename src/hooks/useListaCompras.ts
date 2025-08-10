import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ItemListaCompras {
  id: string;
  user_id: string;
  descricao: string;
  quantidade: number;
  unidade_medida: string;
  comprado: boolean;
  created_at: string;
  updated_at: string;
}

export const useListaCompras = () => {
  const [itensLista, setItensLista] = useState<ItemListaCompras[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItensLista = async () => {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItensLista((data || []) as ItemListaCompras[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar lista de compras",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createItemLista = async (item: Omit<ItemListaCompras, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .insert([{
          ...item,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setItensLista(prev => [data as ItemListaCompras, ...prev]);
      
      toast({
        title: "Item adicionado",
        description: "Item adicionado à lista de compras!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateItemLista = async (id: string, updates: Partial<ItemListaCompras>) => {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setItensLista(prev => prev.map(item => 
        item.id === id ? data as ItemListaCompras : item
      ));
      
      toast({
        title: "Item atualizado",
        description: "Item da lista atualizado com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteItemLista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lista_compras')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItensLista(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Item removido",
        description: "Item removido da lista de compras!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const toggleItemComprado = async (id: string, comprado: boolean) => {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .update({ comprado })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setItensLista(prev => prev.map(item => 
        item.id === id ? data as ItemListaCompras : item
      ));
      
      toast({
        title: comprado ? "Item marcado como comprado" : "Item desmarcado",
        description: comprado ? "Item marcado como comprado!" : "Item desmarcado da lista!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const limparItensComprados = async () => {
    try {
      const { error } = await supabase
        .from('lista_compras')
        .delete()
        .eq('comprado', true);

      if (error) throw error;
      
      setItensLista(prev => prev.filter(item => !item.comprado));
      
      toast({
        title: "Lista limpa",
        description: "Itens comprados removidos da lista!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao limpar lista",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const marcarTodosComoComprados = async () => {
    try {
      const { error } = await supabase
        .from('lista_compras')
        .update({ comprado: true })
        .eq('comprado', false);

      if (error) throw error;

      setItensLista(prev => prev.map(item => ({ ...item, comprado: true })));

      toast({
        title: "Itens atualizados",
        description: "Todos os itens foram marcados como comprados!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao marcar itens",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchItensLista();
  }, []);

  return {
    itensLista,
    loading,
    createItemLista,
    updateItemLista,
    deleteItemLista,
    toggleItemComprado,
    limparItensComprados,
    marcarTodosComoComprados,
    refetch: fetchItensLista
  };
}; 