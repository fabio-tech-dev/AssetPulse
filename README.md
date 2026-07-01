# AssetPulse 🚀

O **AssetPulse** é um sistema SaaS (Software as a Service) Multi-Tenant desenvolvido para a gestão inteligente de inventário e ativos de TI. O objetivo central é oferecer uma plataforma centralizada para controle de hardware, licenças de software e acompanhamento de vencimentos, otimizando o trabalho de gestores de tecnologia e suporte técnico.

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, JavaScript (ES6+)
* **Back-end:** Node.js, Express, Dotenv (Segurança de credenciais)
* **Banco de Dados:** MySQL (Modelagem relacional e Consultas SQL)
* **Arquitetura:** Multi-Tenant (Isolamento seguro de dados por cliente/usuário)

## 📌 Principais Funcionalidades

* **Gestão de Ativos (Computadores):** Cadastro, edição, listagem e exclusão de hardwares com controle de status (Ativo, Manutenção, Descartado).
* **Controle de Licenças:** Cadastro de chaves de softwares com cálculo automático de dias restantes para o vencimento (DATEDIFF) e funções de renovação ou cancelamento.
* **Autenticação Segura:** Sistema de cadastro e login de usuários com validação direta no banco de dados.
* **Segurança Prática:** Arquitetura configurada com variáveis de ambiente (`.env`) para total proteção das credenciais de acesso ao banco de dados.

---

## ⚙️ Como executar este projeto

Para rodar este projeto localmente no seu computador, siga os passos abaixo:

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/fabio-tech-dev/AssetPulse.git](https://github.com/fabio-tech-dev/AssetPulse.git)
Instale as dependências:
Abra o terminal dentro da pasta raiz do projeto e execute o comando para instalar as bibliotecas necessárias:

Bash
npm install
Configure as variáveis de ambiente:
Crie um arquivo chamado .env (exatamente com o ponto no início) na raiz do projeto e configure as suas credenciais locais do MySQL:

Plaintext
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql
DB_NAME=gestordeinventario
PORT=3000
Configure o Banco de Dados:

Abra o seu gerenciador MySQL (como o MySQL Workbench ou phpMyAdmin).

Crie um banco de dados com o nome gestordeinventario.

Importe e execute o arquivo database.sql (que deve estar na pasta do projeto) para criar a estrutura das tabelas automaticamente.

Inicie o servidor:
No terminal, execute o comando abaixo para ligar a API backend:

Bash
node server.js
Se tudo estiver correto, você verá a mensagem de conexão com sucesso no banco de dados!

Desenvolvido por Fábio Matheus Soares da Silva.
