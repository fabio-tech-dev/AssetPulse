<div align="center">
  <img src="logo.svg" alt="AssetPulse Logo" width="130" />

  # AssetPulse

  *Sistema SaaS Multi-Tenant para Gestão Inteligente de Inventário de TI*

  ![Node.js](https://img.shields.io/badge/Node.js-662d91?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express.js-9b59b6?style=for-the-badge&logo=express&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-662d91?style=for-the-badge&logo=mysql&logoColor=white)
  ![Gemini AI](https://img.shields.io/badge/Gemini%20AI-9b59b6?style=for-the-badge&logo=google-gemini&logoColor=white)
</div>

<br>

## 📝 Sobre o Projeto

O **AssetPulse** é uma plataforma ITAM (*IT Asset Management*) em nuvem focada em eliminar a desorganização de planilhas locais para o controle de parque tecnológico e licenças corporativas. 

A arquitetura foi projetada sob o modelo **Multi-Tenant**, garantindo o isolamento estrito de dados e a integridade do inventário para múltiplos clientes na mesma base. Além disso, conta com um **Agente de IA (PulseBot)** integrado, capaz de interagir de forma inteligente com o banco de dados para entregar respostas e métricas do inventário em tempo real.

---

## 🛠️ Tecnologias Utilizadas

*   **Front-end:** HTML5, CSS3, JavaScript (ES6+ Vanilla JS). Interface rápida, livre de frameworks pesados, focada em performance (UX) com modais flutuantes escuros e gradientes roxos.
*   **Back-end:** Node.js com Express estruturado como uma API RESTful.
*   **Inteligência Artificial:** SDK `@google/generative-ai` utilizando o modelo `gemini-3.5-flash` para automação de conversas e consultas assistidas (*Function Calling*).
*   **Banco de Dados:** MySQL (modelagem relacional avançada com SSL seguro ativo para integração com provedores em nuvem como a Aiven).

---

## 📌 Principais Funcionalidades

*   🖥️ **Gestão de Ativos (Computadores):** CRUD completo de equipamentos físicos com classificação por departamento e status (Ativo, Manutenção, Descartado).
*   🔑 **Controle de Licenças:** Cadastro de chaves e controle de validade com cálculo dinâmico de expiração.
*   🤖 **PulseBot (Agente de IA):** Chatbot flutuante inteligente integrado que responde dúvidas do sistema e consulta ativamente dados estatísticos do banco.
*   🖨️ **Etiquetas Inteligentes (QR Code):** Geração dinâmica de QR Code para etiquetamento térmico de equipamentos físicos.
*   📊 **Relatórios em CSV:** Exportação instantânea das tabelas de inventário visíveis em formato compatível com Excel.
*   🔄 **Auto-Criação de Tabelas (Migrations):** Inicialização automática e segura do schema do banco de dados na inicialização do servidor.

---

## ⚙️ Como executar o projeto localmente

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/fabio-tech-dev/AssetPulse.git
```

### 2️⃣ Instale as dependências
```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto contendo os parâmetros de conexão:
```env
DB_HOST=seu_host_do_banco
DB_PORT=porta_do_banco
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=gestordeinventario
PORT=3000
GEMINI_API_KEY=sua_chave_do_gemini
```

### 4️⃣ Inicialize o banco de dados e o servidor
O sistema está programado para verificar e criar automaticamente as tabelas necessárias (`users`, `softwares`, `computers`, `licenses`) na primeira inicialização. Basta rodar:
```bash
node server.js
```
Assim que a conexão for bem-sucedida, os logs de criação de tabelas serão exibidos e o sistema estará pronto em `http://localhost:3000`.
