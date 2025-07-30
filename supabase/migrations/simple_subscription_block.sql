-- Comando para executar no Supabase Dashboard SQL Editor
-- Este comando adiciona políticas RLS para bloquear acesso quando dias_restantes <= 0

-- Política para transacoes
CREATE POLICY "Bloquear acesso quando assinatura expirada - transacoes" ON transacoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para despesas
CREATE POLICY "Bloquear acesso quando assinatura expirada - despesas" ON despesas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para receitas
CREATE POLICY "Bloquear acesso quando assinatura expirada - receitas" ON receitas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para dividas
CREATE POLICY "Bloquear acesso quando assinatura expirada - dividas" ON dividas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para categorias
CREATE POLICY "Bloquear acesso quando assinatura expirada - categorias" ON categorias
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para metas
CREATE POLICY "Bloquear acesso quando assinatura expirada - metas" ON metas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para veiculos
CREATE POLICY "Bloquear acesso quando assinatura expirada - veiculos" ON veiculos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para manutencoes
CREATE POLICY "Bloquear acesso quando assinatura expirada - manutencoes" ON manutencoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para orcamentos_mercado
CREATE POLICY "Bloquear acesso quando assinatura expirada - orcamentos_mercado" ON orcamentos_mercado
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para itens_mercado
CREATE POLICY "Bloquear acesso quando assinatura expirada - itens_mercado" ON itens_mercado
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para lista_compras
CREATE POLICY "Bloquear acesso quando assinatura expirada - lista_compras" ON lista_compras
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Política para ia_analysis_results
CREATE POLICY "Bloquear acesso quando assinatura expirada - ia_analysis_results" ON ia_analysis_results
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
); 