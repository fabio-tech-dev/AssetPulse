<div align="center">
  <img src="logo.svg" alt="AssetPulse Logo" width="130" />

  # 🟣 AssetPulse

  *Sistema SaaS Multi-Tenant para Gestão Inteligente de Inventário de TI*

  ![Node.js](https://img.shields.io/badge/Node.js-662d91?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express.js-9b59b6?style=for-the-badge&logo=express&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-662d91?style=for-the-badge&logo=mysql&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-9b59b6?style=for-the-badge&logo=javascript&logoColor=white)
</div>

<br>

## 📝 Sobre o Projeto

O **AssetPulse** é uma solução robusta desenvolvida para resolver dores reais de gestão tecnológica. Ele funciona como uma plataforma centralizada para o controle total de hardwares, monitoramento rigoroso de licenças de software e acompanhamento automatizado de prazos de vencimento. 

A arquitetura foi projetada seguindo o modelo **Multi-Tenant**, o que significa que o sistema é capaz de servir múltiplos clientes ou empresas de forma completamente isolada, garantindo total privacidade, integridade e segurança para os dados de cada usuário.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, JavaScript (ES6+) com foco em usabilidade e interface responsiva.
* **Back-end:** Node.js e Express, estruturando uma API ágil e organizada.
* **Segurança:** Dotenv para criptografia e isolamento de variáveis de ambiente.
* **Banco de Dados:** MySQL, utilizando modelagem relacional avançada e consultas otimizadas.

---

## 📌 Principais Funcionalidades

* 🖥️ **Gestão de Ativos (Computadores):** Controle completo (CRUD) de hardwares com monitoramento de status em tempo real (Ativo, Manutenção ou Descartado).
* 🔑 **Controle de Licenças:** Cadastro de chaves de ativação com cálculo automático de dias restantes para o vencimento através da função `DATEDIFF` do SQL, permitindo ações rápidas de renovação ou cancelamento.
* 🔐 **Autenticação Segura:** Sistema completo de cadastro e login de usuários com validação direta e segura no banco de dados.
* 🛡️ **Proteção de Dados:** Código backend estruturado para nunca expor credenciais ou senhas de servidores, utilizando boas práticas de desenvolvimento seguro.

---

## ⚙️ Como executar este projeto

Para rodar e testar esta aplicação localmente no seu ambiente de desenvolvimento, siga o passo a passo abaixo:

### 1️⃣ Clone o repositório
```bash
git clone [https://github.com/fabio-tech-dev/AssetPulse.git](https://github.com/fabio-tech-dev/AssetPulse.git)
