# 1. Visão Geral do Projeto 🚀

Bem-vindo à documentação do **CoreLink / HJ Infor**! Este documento foi escrito para que qualquer pessoa consiga entender como o site funciona, do básico ao avançado.

## O que é esse sistema?
Este projeto é uma **Plataforma E-commerce para Sistemas e Softwares** (modelo SaaS - Software as a Service).
Ele permite que a empresa (HJ Infor) anuncie seus softwares na internet, e que clientes entrem no site, se cadastrem, e comprem o acesso aos sistemas através de assinaturas ou pagamentos únicos. O dono do sistema tem um painel próprio ("Admin") para gerenciar produtos, clientes, mensagens e vendas.

## Principais Tecnologias (A nossa "Stack")
Nós usamos um conjunto de ferramentas muito modernas para construir o site:

1. **Next.js (React):** É o "motor" do nosso site. Em vez de termos arquivos HTML separados, o Next.js constrói as páginas e torna o site super rápido e com cara de aplicativo. Usamos a versão mais recente com o *App Router*.
2. **Tailwind CSS:** Ferramenta que usamos para pintar o site (cores, margens, fontes). Em vez de arquivos de CSS gigantes, colocamos as classes diretamente nos botões e textos (exemplo: `bg-blue-500` pinta o fundo de azul).
3. **Prisma (ORM):** É o nosso tradutor de Banco de Dados. Em vez de escrever códigos complexos em SQL para salvar e buscar dados, o Prisma nos deixa fazer isso de forma simples com Javascript (ex: `prisma.user.findMany()`).
4. **PostgreSQL (Neon):** Onde todas as informações de usuários e compras ficam salvas fisicamente na nuvem.
5. **NextAuth.js (Auth.js v5):** O nosso porteiro. É a ferramenta de segurança que gerencia os Logins, Senhas e bloqueia o acesso para que clientes comuns não entrem no painel do administrador.

## Como rodar o sistema no seu computador?
1. Abra o terminal na pasta do projeto.
2. Certifique-se de que os pacotes estão instalados rodando: `npm install`
3. Se houver mudanças no Banco de Dados, rode: `npx prisma db push`
4. Ligue o servidor com: `npm run dev`
5. Acesse no navegador: `http://localhost:3000` (ou o link do ngrok se estiver usando túnel).
