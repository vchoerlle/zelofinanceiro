-- Criar tabela lista_compras
CREATE TABLE IF NOT EXISTS lista_compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  unidade_medida VARCHAR(50) NOT NULL DEFAULT 'un',
  comprado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_lista_compras_user_id ON lista_compras(user_id);
CREATE INDEX IF NOT EXISTS idx_lista_compras_comprado ON lista_compras(comprado);
CREATE INDEX IF NOT EXISTS idx_lista_compras_created_at ON lista_compras(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE lista_compras ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários verem apenas seus próprios itens
CREATE POLICY "Users can view own lista_compras" ON lista_compras
  FOR SELECT USING (auth.uid() = user_id);

-- Criar política para usuários inserirem seus próprios itens
CREATE POLICY "Users can insert own lista_compras" ON lista_compras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar política para usuários atualizarem seus próprios itens
CREATE POLICY "Users can update own lista_compras" ON lista_compras
  FOR UPDATE USING (auth.uid() = user_id);

-- Criar política para usuários deletarem seus próprios itens
CREATE POLICY "Users can delete own lista_compras" ON lista_compras
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_lista_compras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lista_compras_updated_at_trigger
  BEFORE UPDATE ON lista_compras
  FOR EACH ROW
  EXECUTE FUNCTION update_lista_compras_updated_at(); 