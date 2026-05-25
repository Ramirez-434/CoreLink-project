# 5. Fluxo do Cliente e Design Visual 🎨

## Fluxo do Cliente (Passo a Passo)

Como um cliente navega na HJ Infor até comprar um sistema? Aqui está o "Caminho Feliz" que criamos para ele:

1. **A Descoberta (Home / Sistemas):** O cliente acessa o site público e visualiza a lista de Sistemas com seus títulos e preços.
2. **A Avaliação (Página do Produto - Landing Page):** Ao clicar em "Ver Detalhes", ele vai para a página do produto específico. Essa tela é desenhada como uma *Landing Page*, mostrando:
   - Características escritas de forma bonita com Markdown (Textos ricos e estruturados).
   - Selos de segurança, garantia e confiança (Trust Badges).
   - Lista de funcionalidades (Features) com "checkmarks".
   - Um botão gigante que chama para a compra.
3. **O Cadastro (Para quem não logou):** Se o botão for clicado e o usuário não tiver conta, a loja pede para ele se cadastrar (passando pela aprovação da Política de LGPD).
4. **O Checkout (O Pagamento):** Logado, ele é direcionado à página final de Pagamento (Checkout). Lá nós simulamos o pedido (atualmente integrado com as Server Actions).
5. **A Confirmação (Minha Conta):** O pedido é salvo no banco, e o cliente vai para o painel dele ("Minha Conta"), onde o sistema diz: "Tudo Certo, pedido Processando".

## Estética (UI/UX) e o TailwindCSS
A HJ Infor usa o **TailwindCSS** para pintura e estilo. As vantagens dessa decisão:
- É super flexível. Se você olhar no código, em vez de ver `style="color: blue"`, você vai ver as palavras `text-primary`.
- **Modo Escuro (Dark Mode):** Nosso sistema já entende o "dark mode". O Tailwind faz isso com uma classe muito simples: `dark:bg-gray-900`. Isso diz que se a pessoa ativou o modo escuro, a cor do fundo daquele bloco virará um cinza quase preto. Se não, usa a cor clara normal.

## Componentes Compartilhados (O Navbar)
O Navbar também é inteligente. Ele consegue puxar o Auth e perceber: "Opa, se tem alguém aqui com o Role 'ADMIN', vou trocar o botão de Login por um botão dizendo 'Acessar Admin'."
Se for um usuário comum, mostra o botão de "Minha Conta" e um ícone de Sair.
Tudo isso acontece em Tempo Real sem precisar carregar novas páginas.
