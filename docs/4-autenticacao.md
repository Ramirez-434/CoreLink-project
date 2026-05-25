# 4. Autenticação, Login e Segurança 🔐

Nós usamos a ferramenta `NextAuth` (conhecida agora como Auth.js) para gerenciar quem pode entrar e ver o quê.

A mágica toda acontece centralizada no arquivo `src/auth.ts`. 

## Como o Login Funciona (Passo a Passo)
1. O usuário digita o e-mail e a senha na página `login/page.tsx`.
2. Essa página manda as informações para o arquivo `auth.ts` dizendo: "Autenticação por Credentials" (Credentials Provider).
3. O `auth.ts` busca no Banco de Dados se existe um `User` com esse e-mail.
4. Ele verifica se a senha digitada é igual à senha guardada (usamos o `bcryptjs` para embaralhar/criptografar e desembaralhar senhas).
5. Se for válida, ele cria uma **Sessão** (Session), guardando um cookie (uma marca) no computador do cliente, mantendo-o logado.

## Redirecionamentos e Travas
- Quando um **Cliente Comum** loga, ele é redirecionado para a **Página Inicial (Home)**.
- Quando um **Administrador** (com o `role: "ADMIN"`) loga, ele é direcionado imediatamente para a tela `admin/dashboard`.

## A Trava de Segurança do Administrador (`src/app/admin/layout.tsx`)
Se você for nesse arquivo `layout.tsx` da pasta `admin`, vai ver que no topo dele, nós perguntamos à sessão: 
*"Esse usuário está logado e ele é um ADMIN?"*

Se a resposta for "Não" (ou se ninguém estiver logado), o código roda `redirect("/")`, expulsando a pessoa da tela administrativa e jogando-a na página inicial antes mesmo dela conseguir ver qualquer informação sigilosa.

## Como me deslogar? (Sair)
Qualquer botão de Sair chama uma função `signOut()` da própria ferramenta de Auth, que remove instantaneamente o "cookie" do navegador, tornando o visitante deslogado novamente.
