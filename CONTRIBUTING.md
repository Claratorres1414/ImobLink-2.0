# Contributing to ImobLink

Obrigado por considerar contribuir com o **ImobLink**! 🚀

Este projeto é um sistema completo para o ecossistema imobiliário, composto por frontend, backend e microserviços organizados em um único repositório (monorepo).

Este documento descreve como você pode colaborar de forma organizada, clara e profissional.

---

## 📌 Estrutura do Repositório

A estrutura geral do projeto segue o padrão:

```
/
├── frontend/        # Aplicação React (interface do usuário)
├── backend/         # API principal em Java (Spring Boot)
├── microservices/  # Serviços auxiliares e integrações
└── README.md
```

Antes de contribuir, identifique qual parte do sistema será impactada pela sua mudança.

---

## 🐞 Reportando Problemas (Issues)

Se você encontrou um bug ou deseja sugerir uma melhoria:

1. Verifique se já não existe uma issue semelhante aberta
2. Crie uma nova issue contendo:

    * Descrição clara do problema ou sugestão
    * Passos para reproduzir (se aplicável)
    * Resultado esperado
    * Ambiente (sistema operacional, versão do Java, Node.js, banco de dados, etc.)

---

## 🌱 Fluxo de Desenvolvimento

O fluxo padrão de contribuição é:

1. Faça um fork do repositório (se aplicável)
2. Crie uma branch a partir da `main`:

   ```
   git checkout -b feature/nome-da-feature
   ```

   ou

   ```
   git checkout -b fix/nome-do-bug
   ```
3. Desenvolva sua alteração
4. Faça commits claros e organizados
5. Abra um Pull Request para a branch `main`

---

## ✍️ Padrão de Commits

Utilize mensagens de commit padronizadas e descritivas:

### Formato

```
Ref. #número | tipo: descrição curta
```

### Exemplos

```
feature: adiciona autenticação JWT no backend
fix: corrige validação de formulário no frontend
docs: atualiza documentação da API
refactor: reorganiza pacotes do backend
```

---

## 🔍 Padrões de Código

### Backend (Java / Spring Boot)

* Utilize arquitetura em camadas (Controller, Service, Repository)
* Evite lógica de negócio nos controllers
* Utilize DTOs para comunicação com o frontend
* Mantenha nomes de classes e métodos em inglês
* Priorize código limpo e legível

### Frontend (React)

* Crie componentes reutilizáveis
* Separe lógica de negócio da camada de UI
* Mantenha organização por pastas (components, pages, services, hooks)
* Utilize nomes descritivos para componentes e funções

---

## 🔄 Pull Requests

Antes de abrir um Pull Request, verifique se:

* O projeto compila e executa corretamente
* Nenhum arquivo desnecessário foi incluído (ex: `node_modules`, builds, arquivos de IDE)
* O PR descreve claramente:

    * O que foi feito
    * Por que foi feito
    * Quais partes do sistema foram impactadas

### Título do PR

Use um padrão claro:

```
feature: integração do frontend com endpoint de listagem de imóveis
```

---

## 🧪 Testes

Sempre que possível:

* Teste os endpoints do backend com Insomnia ou Postman
* Valide os fluxos principais da interface no frontend
* Verifique se não houve regressões em funcionalidades existentes

---

## 📄 Licença

Ao contribuir com este projeto, você concorda que sua contribuição será licenciada sob a **Licença MIT**, conforme definido no arquivo `LICENSE` deste repositório.

---

## 🤝 Código de Conduta

Este projeto preza por um ambiente respeitoso e colaborativo.
Comportamentos ofensivos, desrespeitosos ou discriminatórios não são tolerados.

---

## 📬 Contato

Se tiver dúvidas, abra uma issue no repositório para discussão com os mantenedores.

Obrigado por contribuir com o **ImobLink**! 🏡✨
Sua colaboração ajuda a tornar este projeto cada vez melhor.
