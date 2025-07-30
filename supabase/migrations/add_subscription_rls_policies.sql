-- Política para bloquear acesso a todas as tabelas quando dias_restantes <= 0
-- Esta política será aplicada a todas as tabelas principais do sistema

-- 1. Política para tabela 'transacoes'
CREATE POLICY "Bloquear acesso quando assinatura expirada - transacoes" ON transacoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 2. Política para tabela 'despesas'
CREATE POLICY "Bloquear acesso quando assinatura expirada - despesas" ON despesas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 3. Política para tabela 'receitas'
CREATE POLICY "Bloquear acesso quando assinatura expirada - receitas" ON receitas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 4. Política para tabela 'dividas'
CREATE POLICY "Bloquear acesso quando assinatura expirada - dividas" ON dividas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 5. Política para tabela 'parcelas_dividas'
CREATE POLICY "Bloquear acesso quando assinatura expirada - parcelas_dividas" ON parcelas_dividas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 6. Política para tabela 'categorias'
CREATE POLICY "Bloquear acesso quando assinatura expirada - categorias" ON categorias
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 7. Política para tabela 'metas'
CREATE POLICY "Bloquear acesso quando assinatura expirada - metas" ON metas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 8. Política para tabela 'categorias_metas'
CREATE POLICY "Bloquear acesso quando assinatura expirada - categorias_metas" ON categorias_metas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 9. Política para tabela 'veiculos'
CREATE POLICY "Bloquear acesso quando assinatura expirada - veiculos" ON veiculos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 10. Política para tabela 'tipos_manutencao'
CREATE POLICY "Bloquear acesso quando assinatura expirada - tipos_manutencao" ON tipos_manutencao
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 11. Política para tabela 'manutencoes'
CREATE POLICY "Bloquear acesso quando assinatura expirada - manutencoes" ON manutencoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 12. Política para tabela 'veiculos_tipos_manutencao'
CREATE POLICY "Bloquear acesso quando assinatura expirada - veiculos_tipos_manutencao" ON veiculos_tipos_manutencao
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 13. Política para tabela 'orcamentos_mercado'
CREATE POLICY "Bloquear acesso quando assinatura expirada - orcamentos_mercado" ON orcamentos_mercado
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 14. Política para tabela 'itens_mercado'
CREATE POLICY "Bloquear acesso quando assinatura expirada - itens_mercado" ON itens_mercado
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 15. Política para tabela 'categorias_mercado'
CREATE POLICY "Bloquear acesso quando assinatura expirada - categorias_mercado" ON categorias_mercado
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 16. Política para tabela 'lista_compras'
CREATE POLICY "Bloquear acesso quando assinatura expirada - lista_compras" ON lista_compras
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- 17. Política para tabela 'ia_analysis_results'
CREATE POLICY "Bloquear acesso quando assinatura expirada - ia_analysis_results" ON ia_analysis_results
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);

-- Nota: A tabela 'profiles' não precisa desta política pois o usuário sempre deve poder acessar seu próprio perfil
-- para verificar o status da assinatura 