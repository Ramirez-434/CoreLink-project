# HJ Infor / CoreLink - E-commerce de Softwares 🚀

Bem-vindo ao repositório oficial da plataforma CoreLink (HJ Infor). 
Este é um SaaS E-commerce completo feito com tecnologias de ponta para venda de sistemas, gestão de clientes e faturamento automatizado.

## 📚 Documentação do Código (Para Desenvolvedores e Administradores)
Nós preparamos uma documentação detalhada (fácil de ler e "bem mastigada") explicando todo o código e os fluxos do sistema.
Se você precisa entender como este sistema foi feito, confira os arquivos de leitura obrigatória na pasta `docs/`:

- [1. Visão Geral e Tecnologias](docs/1-visao-geral.md)
- [2. Estrutura de Pastas e Rotas](docs/2-estrutura-de-pastas.md)
- [3. O Banco de Dados (Prisma)](docs/3-banco-de-dados.md)
- [4. Autenticação e Segurança (Logins)](docs/4-autenticacao.md)
- [5. O Fluxo de Vendas e o Design](docs/5-fluxo-e-design.md)

## 🛠️ Tecnologias Principais
- Next.js 15 (App Router)
- React e Server Actions
- TailwindCSS (Styling e Dark Mode)
- Prisma ORM com PostgreSQL (Neon DB)
- NextAuth.js (Auth.js v5) para Autenticação Segura

## ⚙️ Como Rodar Localmente

1. Abra a pasta do projeto em seu terminal.
2. Certifique-se de ter as variáveis configuradas corretamente no arquivo `.env`.
3. Instale os pacotes:
```bash
npm install
```
4. Sincronize as tabelas do Banco de Dados:
```bash
npx prisma db push
```
5. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Pronto! Acesse `http://localhost:3000` no seu navegador!
