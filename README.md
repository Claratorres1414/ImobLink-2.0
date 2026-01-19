# ImobLink 2.0

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Build](https://img.shields.io/badge/build-passing-success)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
[![Contributing](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

ImobLink é uma plataforma voltada para o setor imobiliário, funcionando como uma rede social de anúncios de imóveis, onde usuários podem publicar, interagir, favoritar e comentar anúncios.

Este repositório contém **todo o ecossistema da aplicação**, incluindo:
- Front-end
- Backend
- Microserviços
- Integrações externas

> ⚠️ **Importante:** As contribuições desse projeto foram divididas em diferentes encargos. Sendo a contribuição de Clara Torres neste projeto **exclusivamente o desenvolvimento do backend**, utilizando **Java com Spring Boot**, a contribuição de Mateus Barros **exclusivamente o desenvolvimento do frontend**, utilizando **React** e a contribuição de Pedro Cauã **o desenvolvimento dos microsserviços, dashboard administrativa e treinamento de IA**, utilizando **python com FastAPI**.

---

## 🚀 Tecnologias Utilizadas (Backend)
- Java
- Spring Boot
- Spring Security (JWT)
- PostgreSQL
- JPA / Hibernate
- Gradle
- Integração com Microserviços
- Upload e gerenciamento de imagens (Multipart)

---

## 🧠 Principais Funcionalidades do Backend

- Autenticação e autorização via JWT
- Controle de acesso por roles (USER, ADMIN, SUPER_ADMIN)
- Cadastro e gerenciamento de usuários
- Publicação de anúncios imobiliários com imagens
- Sistema de curtidas e favoritos
- Comentários em posts e perfis
- Sistema de seguidores
- Área administrativa com métricas da plataforma
- Integração com microserviço para:
    - Geração automática de legendas
    - OCR para autopreenchimento de dados

---

## 🧩 Arquitetura e Segurança

- API REST seguindo arquitetura em camadas
- Controllers organizados por domínio
- Autorização baseada em roles
- Endpoints públicos e protegidos
- Token JWT para autenticação
- Validações e regras de negócio no service layer

---

## 📂 Principais Endpoints (Resumo)

### Autenticação
- `POST /api/auth/register`
- `POST /api/auth/login`

### Usuários
- Gerenciamento de perfil
- Atualização de dados e senha
- Upload de imagem de perfil

### Publicações
- Criar, editar e deletar posts
- Curtir e favoritar publicações
- Listagem de posts e favoritos

### Comentários
- Comentários em posts e perfis
- Exclusão pelo autor

### Administração
- Promoção de usuários
- Visualização de métricas da plataforma

---

## ▶️ Como Executar o Backend

1. Clone o repositório
2. Configure o banco PostgreSQL
3. Ajuste as variáveis de ambiente
4. Execute o backend via Gradle
5. A API estará disponível em `http://localhost:8080`

---

## 🗒️ Documentação da API

### Swagger UI (Ambiente local)
http://localhost:8080/swagger-ui/index.html

### OpenAPI Contract
O contrato da API está versionado neste repositório:
docs/api/openapi.json

Esse arquivo é gerado automaticamente a partir do Swagger ao subir o backend.

### Autenticação
Esta API utiliza autenticação via JWT Bearer Token.

No Swagger, clique em **Authorize** e cole seu token no formato:
Bearer SEU_TOKEN_AQUI

### Usuário de teste
O token pode ser obtido utilizando o endpoint de login com o usuário de exemplo:

```json
{
  "email": "user0@gmail.com",
  "password": "123456"
}
```

---

## 📚 O que Aprendi com este Projeto (Clara Torres)

- Implementação prática de autenticação e autorização com JWT
- Controle de acesso baseado em roles
- Organização de uma API REST de médio porte
- Integração com microserviços externos
- Boas práticas de arquitetura backend com Spring Boot

---

## 🤝 Contribuindo

Contribuições são bem-vindas!  
Se você deseja colaborar com o projeto, por favor leia o guia de contribuição:

➡️ [CONTRIBUTING.md](CONTRIBUTING.md)

Lá você encontrará:
- Padrões de branch e commits
- Estrutura do projeto
- Regras para Pull Requests
- Boas práticas para frontend e backend