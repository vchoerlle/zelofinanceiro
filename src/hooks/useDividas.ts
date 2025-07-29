import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useParcelasDividas } from "./useParcelasDividas";

export interface Divida {
  id: string;
  user_id: string;
  categoria_id?: string;
  descricao: string;
  valor_total: number;
  valor_pago: number;
  valor_restante: number;
  data_vencimento: string;
  parcelas: number;
  parcelas_pagas: number;
  status: 'pendente' | 'vencida' | 'quitada';
  credor: string;
  created_at: string;
  updated_at: string;
  categoria?: string; // ✅ Adicionar campo categoria para compatibilidade com o modal
  categorias?: {
    nome: string;
    cor: string;
    icone: string;
  };
}

export const useDividas = () => {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { createParcelasForDivida, deleteParcelasByDivida } = useParcelasDividas();

  const fetchDividas = async () => {
    try {
      const { data, error } = await supabase
        .from('dividas')
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setDividas((data || []) as Divida[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar parcelamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDivida = async (divida: Omit<Divida, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'categorias'>) => {
    try {
      const { data, error } = await supabase
        .from('dividas')
        .insert([{
          ...divida,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .single();

      if (error) throw error;
      setDividas(prev => [data as Divida, ...prev]);
      
      // Criar parcelas automaticamente
      if (data && divida.parcelas > 0 && divida.categoria_id) {
        await createParcelasForDivida(
          data.id,
          divida.descricao,
          divida.credor,
          divida.valor_total,
          divida.parcelas,
          divida.data_vencimento,
          divida.categoria_id
        );
      }
      
      toast({
        title: "Parcelamento criado",
        description: `Parcelamento criado com sucesso! ${divida.parcelas > 0 ? `${divida.parcelas} parcelas foram geradas automaticamente.` : ''}`,
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar parcelamento",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateDivida = async (id: string, updates: Partial<Divida>) => {
    try {
      const { data, error } = await supabase
        .from('dividas')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .single();

      if (error) throw error;
      setDividas(prev => prev.map(divida => divida.id === id ? data as Divida : divida));
      
      toast({
        title: "Parcelamento atualizado",
        description: "Parcelamento atualizado com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar parcelamento",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const recalculateDividaValues = async (dividaId: string) => {
    try {
      // Buscar todas as parcelas do parcelamento com o status da despesa
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas_dividas')
        .select(`
          id,
          valor_parcela,
          status,
          despesas (status)
        `)
        .eq('divida_id', dividaId);

      if (parcelasError) throw parcelasError;

      // Calcular valores baseado no status das despesas (que é o status real das parcelas)
      const parcelasPagas = parcelas.filter(p => p.despesas?.status === 'pago').length;
      const valorPago = parcelas.filter(p => p.despesas?.status === 'pago').reduce((total, p) => total + p.valor_parcela, 0);
      const valorTotal = parcelas.reduce((total, p) => total + p.valor_parcela, 0);
      const valorRestante = valorTotal - valorPago;

      // Determinar status do parcelamento baseado no status das despesas
      let status = 'pendente';
      if (parcelasPagas === parcelas.length) {
        status = 'quitada';
      } else if (parcelas.some(p => p.despesas?.status === 'atraso')) {
        status = 'vencida';
      }

      // Atualizar o parcelamento com os novos valores
      const { data, error } = await supabase
        .from('dividas')
        .update({
          valor_pago: valorPago,
          valor_restante: valorRestante,
          parcelas_pagas: parcelasPagas,
          status: status
        })
        .eq('id', dividaId)
        .select(`
          *,
          categorias (nome, cor, icone)
        `)
        .single();

      if (error) throw error;
      
      setDividas(prev => prev.map(divida => divida.id === dividaId ? data as Divida : divida));
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao recalcular valores do parcelamento:', error);
      return { data: null, error };
    }
  };

  const deleteDivida = async (id: string) => {
    try {
      // Primeiro deletar as parcelas relacionadas
      await deleteParcelasByDivida(id);
      
      // Depois deletar o parcelamento
      const { error } = await supabase
        .from('dividas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDividas(prev => prev.filter(divida => divida.id !== id));
      
      toast({
        title: "Parcelamento removido",
        description: "Parcelamento e todas as suas parcelas foram removidos com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover parcelamento",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchDividas();
  }, []);

  return {
    dividas,
    loading,
    createDivida,
    updateDivida,
    deleteDivida,
    recalculateDividaValues,
    refetch: fetchDividas
  };
};