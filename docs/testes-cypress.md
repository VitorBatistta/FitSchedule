# Testes automatizados com Cypress

Esta seção documenta a suíte de testes end-to-end (E2E) do frontend utilizando Cypress.

---

## Estrutura dos Testes

- `cypress.config.ts`: Configuração principal do Cypress (porta `3000`, caminhos de spec e captura de falhas).
- `cypress/e2e/auth.cy.ts`: Cenários de autenticação, proteção de rotas e validações de campos no login.
- `cypress/e2e/students.cy.ts`: Cenários de acesso autenticado e listagem de alunos.
- `cypress/support/e2e.ts`: Comandos e preparação compartilhada da suíte.

---

## Como Rodar

Antes de testar, inicie o frontend na porta 3000:

```powershell
npm.cmd run dev
```

Em outro terminal, execute os testes em modo automático (linha de comando / CI):

```powershell
npm.cmd run test:e2e
```

Para abrir a interface gráfica interativa do Cypress:

```powershell
npm.cmd run test:e2e:open
```

---

## Cenários de Teste (Casos de Teste - CTs)

### 🔐 Módulo de Autenticação (`cypress/e2e/auth.cy.ts`)

#### CT-01: Redirecionamento de visitante não autenticado
- **Arquivo:** `cypress/e2e/auth.cy.ts`
- **Pré-condição:** Nenhuma sessão ativa no navegador (`localStorage` limpo).
- **Ação:** Acessar a rota protegida raiz (`/`).
- **Resultado esperado:** O sistema bloqueia o acesso, redireciona para a rota `/login` e exibe o cabeçalho "Acesso do personal".

#### CT-02: Validação de campo obrigatório — E-mail
- **Arquivo:** `cypress/e2e/auth.cy.ts`
- **Pré-condição:** Acesso à tela de login (`/login`).
- **Ação:** Preencher somente a senha e clicar no botão "Entrar".
- **Resultado esperado:** O formulário bloqueia a submissão, destaca a borda do input e exibe a mensagem de erro **"E-mail obrigatório."** em vermelho abaixo do campo.

#### CT-03: Validação de campo obrigatório — Senha
- **Arquivo:** `cypress/e2e/auth.cy.ts`
- **Pré-condição:** Acesso à tela de login (`/login`).
- **Ação:** Preencher somente o e-mail e clicar no botão "Entrar".
- **Resultado esperado:** O formulário bloqueia a submissão, destaca a borda do input e exibe a mensagem de erro **"Senha obrigatória."** em vermelho abaixo do campo.

#### CT-04: Validação de e-mail com formato inválido
- **Arquivo:** `cypress/e2e/auth.cy.ts`
- **Pré-condição:** Acesso à tela de login (`/login`).
- **Ação:** Inserir um texto com formato fora do padrão de e-mail (ex: `email-invalido`), preencher a senha e clicar em "Entrar".
- **Resultado esperado:** O sistema impede a autenticação e exibe a mensagem **"Insira um e-mail válido."** destacada em vermelho abaixo do campo de e-mail.

#### CT-05: Validação de credenciais inválidas
- **Arquivo:** `cypress/e2e/auth.cy.ts`
- **Pré-condição:** Acesso à tela de login (`/login`).
- **Ação:** Informar e-mail e senha inválidos e clicar no botão "Entrar".
- **Resultado esperado:** A API retorna código HTTP 401 e a interface exibe a notificação de erro **"E-mail ou senha inválidos"**, mantendo o usuário na tela de login.

#### CT-06: Validação de login realizado com sucesso
- **Arquivo:** `cypress/e2e/auth.cy.ts`
- **Pré-condição:** Usuário cadastrado com dados válidos de Administrador.
- **Ação:** Informar e-mail e senha corretos e clicar em "Entrar".
- **Resultado esperado:** O sistema autentica o usuário com sucesso, armazena a sessão no `localStorage`, redireciona para o painel principal (`/`) e renderiza os elementos do Dashboard ("Bom treino", "Alunos cadastrados").

---

### 🏋️ Módulo de Alunos (`cypress/e2e/students.cy.ts`)

#### CT-07: Acesso à tela de cadastro para usuário autenticado
- **Arquivo:** `cypress/e2e/students.cy.ts`
- **Pré-condição:** Usuário logado com permissão de gerenciamento de alunos.
- **Ação:** Efetuar login e navegar até a tela de alunos (`/alunos`).
- **Resultado esperado:** A tela de alunos é carregada com sucesso, exibindo o título **"Alunos"**, o botão de ação **"Novo aluno"** e o estado inicial **"Nenhum aluno cadastrado"**.

---

## Observações Técnicas

- **Mock de API:** Os testes utilizam `cy.intercept` para simular as respostas dos endpoints da API (`/api/auth/login`, `/api/dashboard`, `/api/alunos`). Isso garante que os testes E2E executem com rapidez e determinismo, sem depender do estado ou conexão com banco de dados externo.
- **Validação de Formulários:** Os testes cobrem tanto a validação nativa de restrições HTML (`checkValidity` / `valueMissing`) quanto o feedback visual reativo do design system (mensagens em vermelho e classes de destaque no input).
