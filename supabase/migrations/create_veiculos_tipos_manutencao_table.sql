-- =====================================================
-- MIGRAÇÃO: Criar tabela veiculos_tipos_manutencao
-- =====================================================
-- 
-- INSTRUÇÕES PARA EXECUÇÃO MANUAL:
-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 2. Vá para o projeto: bsaeyarodtkhkzcbku
-- 3. Acesse "SQL Editor" no menu lateral
-- 4. Cole todo este script e execute
-- 5. Verifique se as tabelas foram criadas em "Table Editor"
--
-- =====================================================

-- Criar tabela de relacionamento entre veículos e tipos de manutenção
CREATE TABLE IF NOT EXISTS veiculos_tipos_manutencao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  tipo_manutencao_id UUID NOT NULL REFERENCES tipos_manutencao(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(veiculo_id, tipo_manutencao_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_veiculos_tipos_manutencao_veiculo_id ON veiculos_tipos_manutencao(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_tipos_manutencao_tipo_id ON veiculos_tipos_manutencao(tipo_manutencao_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_tipos_manutencao_user_id ON veiculos_tipos_manutencao(user_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_tipos_manutencao_ativo ON veiculos_tipos_manutencao(ativo);

-- Adicionar campos na tabela manutencoes
ALTER TABLE manutencoes 
ADD COLUMN IF NOT EXISTS valor_manutencao DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS quilometragem_veiculo INTEGER DEFAULT NULL;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_veiculos_tipos_manutencao_updated_at 
    BEFORE UPDATE ON veiculos_tipos_manutencao 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICAÇÃO: Confirmar que as alterações foram aplicadas
-- =====================================================
-- 
-- Execute estas consultas para verificar se tudo foi criado corretamente:
--
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'veiculos_tipos_manutencao';
--
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'manutencoes' AND column_name IN ('valor_manutencao', 'quilometragem_veiculo');
--
-- ===================================================== 