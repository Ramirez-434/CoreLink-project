# 2. Estrutura de Pastas (Onde cada coisa mora) 📁

Se você for explorar os arquivos de código deste sistema, a pasta mais importante é a `src` (Source/Fonte).
Aqui está a explicação "mastigada" do que faz cada pasta dentro de `src`:

## 📂 `src/app` (O Roteamento do Next.js)
No Next.js, as pastas dentro de `src/app` viram automaticamente páginas e URLs no navegador.

- **`(public)`**: Esta pasta tem os parênteses porque ela **não** afeta a URL. Ela serve apenas para agrupar as telas públicas (que todo mundo acessa).
  - `/page.tsx`: É a tela inicial (`/`), a primeira página do site.
  - `/sistemas/page.tsx`: O catálogo de produtos do site.
  - `/login/page.tsx`: Tela de login.
  - `/cadastro/page.tsx`: Tela de criação de conta.
  - `/produto/[id]/page.tsx`: Quando você clica em um produto, ele abre nesta tela. O `[id]` significa que a página é dinâmica (pode ser o ID de qualquer produto).
  - `/checkout/[id]/page.tsx`: É a tela de finalização de compra.
- **`admin`**: É a pasta com todas as telas que só o administrador tem acesso. Se alguém entrar em `seusite.com/admin/dashboard` cairá aqui.
  - **`layout.tsx`**: Este arquivo dita o "esqueleto" de todas as telas de administrador (como a barra lateral escura e a trava de segurança de login).

## 📂 `src/components` (Peças de Lego)
Aqui ficam os **Componentes**. Pense em componentes como bloquinhos de Lego: você monta uma vez e usa em várias páginas para não repetir código.
- `ui/Navbar.tsx`: A barra de navegação no topo de todas as páginas.
- `ui/Footer.tsx`: O rodapé.
- `ThemeToggle.tsx`: O botão mágico que altera o site para o "Modo Escuro".

## 📂 `src/actions` (Server Actions - A Mágica do Banco de Dados)
Sempre que uma página precisa salvar, editar ou apagar informações do banco de dados, ela chama uma função que está nesta pasta. É aqui que está o código seguro que nunca vai pro navegador do cliente.
- `auth.ts`: Funções para cadastrar usuário ou validar login.
- `product.ts`: Funções para criar, editar ou apagar um sistema (produto).
- `order.ts`: Funções para registrar que alguém fez uma compra.

## 📂 Outros arquivos importantes na raiz do projeto
- `prisma/schema.prisma`: É o arquivo onde dizemos quais são as tabelas e os campos que o banco de dados deve ter.
- `.env`: Arquivo super-secreto. Ficam as senhas e links de banco de dados e APIs (NUNCA mostre para os clientes).
- `next.config.ts`: As configurações gerais e permissões do Next.js (como as de segurança de domínio).
