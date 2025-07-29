import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Veiculo } from "./useVeiculos";
import { TipoManutencao } from "./useTiposManutencao";

export interface VeiculoTipoManutencao {
  id: string;
  veiculo_id: string;
  tipo_manutencao_id: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  veiculo?: Veiculo;
  tipoManutencao?: TipoManutencao;
}

export const useVeiculosTiposManutencao = () => {
  const [vinculos, setVinculos] = useState<VeiculoTipoManutencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const fetchVinculos = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Primeiro, vamos verificar se a tabela existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('veiculos_tipos_manutencao')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('❌ Erro ao verificar tabela:', tableError);
        toast({
          title: "Erro",
          description: "Tabela de vínculos não encontrada. Execute a migração do banco de dados.",
          variant: "destructive"
        });
        setVinculos([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('veiculos_tipos_manutencao')
        .select(`
          *,
          veiculo:veiculos(*),
          tipoManutencao:tipos_manutencao(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar vínculos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar vínculos de manutenção",
          variant: "destructive"
        });
        setVinculos([]);
        return;
      }

      setVinculos(data || []);
    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar vínculos de manutenção",
        variant: "destructive"
      });
      setVinculos([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const adicionarVinculo = useCallback(async (veiculoId: string, tipoManutencaoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o vínculo já existe
      const vínculoExistente = vinculos.find(v => 
        v.veiculo_id === veiculoId && v.tipo_manutencao_id === tipoManutencaoId
      );

      if (vínculoExistente) {
        toast({
          title: "Aviso",
          description: "Este vínculo já existe",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('veiculos_tipos_manutencao')
        .insert({
          user_id: user.id,
          veiculo_id: veiculoId,
          tipo_manutencao_id: tipoManutencaoId,
          ativo: true
        });

      if (error) {
        console.error('❌ Erro ao adicionar vínculo:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar vínculo",
          variant: "destructive"
        });
        return;
      }

      // Buscar vínculos atualizados diretamente (reutilizando o user já obtido)
      const { data: vinculosAtualizados } = await supabase
        .from('veiculos_tipos_manutencao')
        .select(`
          *,
          veiculo:veiculos(*),
          tipoManutencao:tipos_manutencao(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setVinculos(vinculosAtualizados || []);
      
      toast({
        title: "Sucesso",
        description: "Vínculo adicionado com sucesso!"
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar vínculo:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar vínculo",
        variant: "destructive"
      });
    }
  }, [vinculos, toast]);

  const removerVinculo = useCallback(async (vinculoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('veiculos_tipos_manutencao')
        .delete()
        .eq('id', vinculoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao remover vínculo:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover vínculo",
          variant: "destructive"
        });
        return;
      }

      // Buscar vínculos atualizados diretamente
      const { data: vinculosAtualizados } = await supabase
        .from('veiculos_tipos_manutencao')
        .select(`
          *,
          veiculo:veiculos(*),
          tipoManutencao:tipos_manutencao(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setVinculos(vinculosAtualizados || []);
      
      toast({
        title: "Sucesso",
        description: "Vínculo removido com sucesso!"
      });
    } catch (error) {
      console.error('❌ Erro ao remover vínculo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover vínculo",
        variant: "destructive"
      });
    }
  }, [toast]);

  const alterarStatusVinculo = useCallback(async (vinculoId: string, ativo: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('veiculos_tipos_manutencao')
        .update({ ativo })
        .eq('id', vinculoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao alterar status do vínculo:', error);
        toast({
          title: "Erro",
          description: "Erro ao alterar status do vínculo",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      setVinculos(prev => prev.map(v => 
        v.id === vinculoId ? { ...v, ativo } : v
      ));

      toast({
        title: "Sucesso",
        description: `Vínculo ${ativo ? 'ativado' : 'desativado'} com sucesso!`
      });
    } catch (error) {
      console.error('❌ Erro ao alterar status do vínculo:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do vínculo",
        variant: "destructive"
      });
    }
  }, [toast]);

  const verificarVinculo = useCallback((veiculoId: string, tipoManutencaoId: string) => {
    return vinculos.some(v => 
      v.veiculo_id === veiculoId && 
      v.tipo_manutencao_id === tipoManutencaoId && 
      v.ativo
    );
  }, [vinculos]);

  // Inicializar apenas uma vez
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchVinculos();
    }
  }, [initialized]);

  return {
    vinculos,
    loading,
    adicionarVinculo,
    removerVinculo,
    alterarStatusVinculo,
    verificarVinculo,
    refetchVinculos: fetchVinculos
  };
}; 