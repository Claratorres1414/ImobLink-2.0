-- Permite conexão no banco
GRANT CONNECT ON DATABASE imoblink_db TO imoblink_app;
GRANT CONNECT ON DATABASE imoblink_db TO imoblink_migrator;

-- Permite uso do schema public
GRANT USAGE ON SCHEMA public TO imoblink_app;
GRANT USAGE ON SCHEMA public TO imoblink_migrator;

-- Permissões CRUD para aplicação
GRANT SELECT, INSERT, UPDATE, DELETE
      ON ALL TABLES IN SCHEMA public
          TO imoblink_app;

-- Permissões em sequences
GRANT USAGE, SELECT
             ON ALL SEQUENCES IN SCHEMA public
                 TO imoblink_app;

-- Permissões totais para migrator
GRANT ALL PRIVILEGES
ON ALL TABLES IN SCHEMA public
TO imoblink_migrator;

GRANT ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA public
TO imoblink_migrator;

GRANT CREATE
ON SCHEMA public
TO imoblink_migrator;