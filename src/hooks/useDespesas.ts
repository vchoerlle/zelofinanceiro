import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Despesa {
  id: string;
  user_id: string;
  categoria_id?: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente' | 'atraso';
  created_at: string;
  updated_at: string;
  categorias?: {
    nome: string;
    cor: string;
    icone: string;
  };
}

export const useDespesas = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDespesas = async () => {
    try {
      // Buscar dados da tabela despesas
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select(`
          *,
          categorias (nome, cor, icone)
        `);

      if (despesasError) throw despesasError;

      // Buscar dados da tabela transacoes com tipo despesa
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .eq('tipo', 'despesa');

      if (transacoesError) throw transacoesError;

      // Combinar os dados
      const allDespesas = [
        ...(despesasData || []),
        ...(transacoesData || [])
      ];

      // Ordenar por data
      const sortedDespesas = allDespesas.sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );

      setDespesas(sortedDespesas as Despesa[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar despesas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDespesa = async (despesa: Omit<Despesa, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'categorias'>) => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .insert([{
          ...despesa,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .single();

      if (error) throw error;
      setDespesas(prev => [data as Despesa, ...prev]);
      
      toast({
        title: "Despesa criada",
        description: "Despesa criada com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar despesa",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateDespesa = async (id: string, updates: Partial<Despesa>) => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .single();

      if (error) throw error;
      setDespesas(prev => prev.map(despesa => despesa.id === id ? data as Despesa : despesa));
      
      toast({
        title: "Despesa atualizada",
        description: "Despesa atualizada com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteDespesa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDespesas(prev => prev.filter(despesa => despesa.id !== id));
      
      toast({
        title: "Despesa removida",
        description: "Despesa removida com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover despesa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateDespesaStatus = async (id: string, status: 'pago' | 'pendente' | 'atraso') => {
    try {
      // Mapear status da despesa para status da parcela
      const statusParcela = status === 'pago' ? 'paga' : 
                           status === 'atraso' ? 'vencida' : 'pendente';

      // Atualizar a despesa
      const { data, error } = await supabase
        .from('despesas')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .single();

      if (error) throw error;

      // Atualizar também o status da parcela correspondente (se existir)
      const { error: parcelaError } = await supabase
        .from('parcelas_dividas')
        .update({ status: statusParcela })
        .eq('despesa_id', id);

      if (parcelaError) {
        console.warn('Erro ao atualizar status da parcela:', parcelaError);
        // Não falhar se não conseguir atualizar a parcela
      }

      // Buscar a dívida relacionada para recalcular os valores
      const { data: parcelaData, error: parcelaDataError } = await supabase
        .from('parcelas_dividas')
        .select('divida_id')
        .eq('despesa_id', id)
        .single();

      if (!parcelaDataError && parcelaData) {
        // Armazenar no localStorage para sincronização entre páginas
        const dividasParaRecalcular = JSON.parse(localStorage.getItem('dividasParaRecalcular') || '[]');
        if (!dividasParaRecalcular.includes(parcelaData.divida_id)) {
          dividasParaRecalcular.push(parcelaData.divida_id);
          localStorage.setItem('dividasParaRecalcular', JSON.stringify(dividasParaRecalcular));
        }
        
        // Disparar um evento customizado para notificar que a dívida precisa ser recalculada
        window.dispatchEvent(new CustomEvent('dividaRecalcular', { 
          detail: { dividaId: parcelaData.divida_id } 
        }));
        
        // Disparar evento para notificar mudança de status da parcela
        window.dispatchEvent(new CustomEvent('parcelaStatusChanged'));
      }

      setDespesas(prev => prev.map(despesa => despesa.id === id ? data as Despesa : despesa));
      
      toast({
        title: "Status atualizado",
        description: `Status da despesa alterado para ${status}!`,
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

  useEffect(() => {
    fetchDespesas();
  }, []);

  return {
    despesas,
    loading,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    updateDespesaStatus,
    refetch: fetchDespesas
  };
};