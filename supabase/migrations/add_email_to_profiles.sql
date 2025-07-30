-- Adicionar campo email na tabela profiles
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Criar índice único para o campo email
CREATE UNIQUE INDEX profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN profiles.email IS 'Email do usuário para verificação de duplicação'; 