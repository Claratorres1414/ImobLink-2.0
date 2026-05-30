-- Permite conexão no banco
GRANT CONNECT ON DATABASE imoblink_db TO imoblink_app;
GRANT CONNECT ON DATABASE imoblink_db TO imoblink_migrator;

\c imoblink_db;

-- Permite uso do schema public
GRANT USAGE ON SCHEMA public TO imoblink_app;
GRANT USAGE ON SCHEMA public TO imoblink_migrator;

-- Migrator pode criar estruturas
GRANT CREATE ON SCHEMA public TO imoblink_migrator;

-- CRUD para aplicação nas tabelas atuais
GRANT SELECT, INSERT, UPDATE, DELETE
      ON ALL TABLES IN SCHEMA public
          TO imoblink_app;

-- Permissões nas sequences atuais
GRANT USAGE, SELECT
             ON ALL SEQUENCES IN SCHEMA public
                 TO imoblink_app;

-- Permissões automáticas para FUTURAS tabelas
ALTER DEFAULT PRIVILEGES
FOR ROLE imoblink_migrator
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
      ON TABLES TO imoblink_app;

-- Permissões automáticas para FUTURAS sequences
ALTER DEFAULT PRIVILEGES
FOR ROLE imoblink_migrator
IN SCHEMA public
GRANT USAGE, SELECT
             ON SEQUENCES TO imoblink_app;