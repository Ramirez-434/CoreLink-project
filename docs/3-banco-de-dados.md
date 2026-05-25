# 3. Banco de Dados (Prisma Schema) 🗄️

O nosso banco de dados é onde todas as informações vivem permanentemente.
Nós usamos o arquivo `prisma/schema.prisma` para definir as "plantas" (ou tabelas) do banco. 

Aqui estão as principais Tabelas de forma simplificada:

## 1. User (Usuários e Clientes)
- Guarda quem está cadastrado no sistema.
- **role**: Pode ser `USER` (um cliente comum) ou `ADMIN` (O dono da loja/você). O sistema de segurança sempre olha para o `role` antes de liberar páginas como o dashboard.
- Guarda `email`, `password` (criptografada) e `phone` (telefone/whatsapp).

## 2. Product (Produtos / Sistemas)
- Representam os Softwares vendidos na plataforma (ex: "Sistema de Farmácia", "Gestor de Clínicas").
- **price**: O valor do sistema em centavos (ex: 5000 significa R$50,00) para evitar problemas de matemática com vírgula.
- **isSubscription**: Se for `true`, o produto é uma Assinatura (cobradas mensal/anual). Se for `false`, é uma licença vitalícia (compra única).
- **features**: É uma lista (Array) dos diferenciais do produto.
- **faq**: Perguntas Frequentes escritas em formato JSON (texto estruturado).

## 3. Order (Pedidos)
- Guarda o histórico de vendas.
- O Pedido relaciona o "Comprador" (`User`) com o "Sistema Comprado" (`Product`).
- **status**: Diz se o pedido está "Processando", "Aprovado", etc.

## 4. Message (Contato e Mensagens)
- Se um visitante ou usuário acessar a página de "/contato" e preencher o formulário, as dúvidas caem nesta tabela.
- Você (como Administrador) pode ler essas mensagens depois acessando o menu "Mensagens" no Painel Admin.

> 💡 **Como eu coloco isso para funcionar?**
> Toda vez que você modificar o arquivo `schema.prisma`, você precisa avisar o Banco de Dados Real. Para isso, você para o servidor e roda o comando `npx prisma db push`. Ele fará as alterações nas nuvens.
