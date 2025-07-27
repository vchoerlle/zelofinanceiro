-- Adicionar constraint único para evitar categorias duplicadas
-- Esta migração adiciona uma constraint única na tabela categorias
-- para impedir que um usuário tenha múltiplas categorias com o mesmo nome e tipo

-- Adicionar constraint único (user_id, nome, tipo)
-- A constraint é case-insensitive usando LOWER() para normalizar o nome
ALTER TABLE categorias 
ADD CONSTRAINT categorias_user_nome_tipo_unique 
UNIQUE (user_id, LOWER(nome), tipo);

-- Comentário explicativo
COMMENT ON CONSTRAINT categorias_user_nome_tipo_unique ON categorias IS 
'Impede que um usuário tenha múltiplas categorias com o mesmo nome e tipo (case-insensitive)'; 