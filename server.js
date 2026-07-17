// ========================================================
// ARQUIVO: server.js
// DESCRIÇÃO: Backend da aplicação AssetPulse.
// Este arquivo Node.js com Express e MySQL gerencia as rotas da API para autenticação de usuários,
// gestão de ativos (computadores) e gestão de licenças de software.
// Ele atua como o ponto central de comunicação entre o frontend e o banco de dados.
// ========================================================
require("dotenv").config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Configuração de acesso ao Banco de Dados (MySQL)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Função auxiliar para executar queries em formato Promise
function executarQuery(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Rotina de inicialização automática de tabelas (Migrations)
async function inicializarBancoDeDados() {
  console.log("🔄 Inicializando tabelas do banco de dados...");
  
  const queryUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,           
      nome VARCHAR(100) NOT NULL,                  
      email VARCHAR(100) UNIQUE NOT NULL,          
      senha VARCHAR(255) NOT NULL,                 
      tipo_conta ENUM('pessoal', 'empresarial') DEFAULT 'pessoal', 
      documento VARCHAR(20),                       
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );
  `;
  
  const querySoftwares = `
    CREATE TABLE IF NOT EXISTS softwares (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nome VARCHAR(100) NOT NULL,                  
      fornecedor VARCHAR(100),                     
      versao VARCHAR(50),                          
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const queryComputers = `
    CREATE TABLE IF NOT EXISTS computers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nome VARCHAR(100) NOT NULL,                  
      codigo_ativo VARCHAR(50) UNIQUE,             
      usuario_responsavel VARCHAR(100),            
      departamento VARCHAR(100),                   
      status ENUM('ativo', 'manutencao', 'descartado') DEFAULT 'ativo', 
      usuario_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const queryLicenses = `
    CREATE TABLE IF NOT EXISTS licenses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      software_id INT NOT NULL,                    
      chave_licenca VARCHAR(255),                  
      data_compra DATE,                            
      data_expiracao DATE NOT NULL,                
      quantidade INT DEFAULT 1,                    
      status ENUM('ativa', 'expirada', 'cancelada') DEFAULT 'ativa', 
      data_cancelamento DATE,                      
      usuario_id INT,
      FOREIGN KEY (software_id) REFERENCES softwares(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  try {
    await executarQuery(queryUsers);
    console.log("✅ Tabela 'users' verificada/criada.");
    
    await executarQuery(querySoftwares);
    console.log("✅ Tabela 'softwares' verificada/criada.");
    
    await executarQuery(queryComputers);
    console.log("✅ Tabela 'computers' verificada/criada.");
    
    await executarQuery(queryLicenses);
    console.log("✅ Tabela 'licenses' verificada/criada.");
    
    console.log("🎉 Inicialização do banco de dados concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a inicialização do banco de dados:", error);
  }
}

// Tenta conectar ao banco e avisa no console do Node.js se deu certo ou errado
db.connect((err) => {
  if (err) {
    console.error("❌ Erro de BD:", err);
    return;
  }
  console.log("✅ Conectado ao banco com sucesso!");
  inicializarBancoDeDados();
});

// Rotas de Autenticação (Usuários)
// Rota para cadastrar um novo usuário no banco de dados
app.post("/api/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;
  db.query(
    "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senha],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ erro: "Email já cadastrado!" });
        }
        return res.status(500).json({ erro: "Erro ao cadastrar" });
      }
      res.status(201).json({ mensagem: "Sucesso" });
    },
  );
});

// Rota para validar o acesso de um usuário e devolver seus dados (Login)
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND senha = ?",
    [email, senha],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ erro: "Inválido" });
      }
      const user = results[0];
      delete user.senha;
      res.status(200).json({ usuario: user });
    },
  );
});

// Rotas de Computadores (Ativos)
// Rota para listar todos os computadores cadastrados
app.get("/api/ativos", (req, res) => {
  const usuario_id = req.query.usuario_id;
  db.query(
    "SELECT id, nome, codigo_ativo, departamento, status FROM computers WHERE usuario_id = ?",
    [usuario_id],
    (err, results) => {
      if (err) {
        console.error("❌ Erro no GET /api/ativos:", err);
        return res.status(500).json({ erro: "Erro ao buscar dados no banco." });
      }
      res.status(200).json(results);
    },
  );
});

// Rota para cadastrar um novo computador no sistema
app.post("/api/ativos", (req, res) => {
  const { nome_computador, codigo_ativo, departamento, status, usuario_id } =
    req.body;
  let statusDB =
    status === "manutencao"
      ? "manutencao"
      : status === "descartado"
        ? "descartado"
        : "ativo";

  db.query(
    "INSERT INTO computers (nome, codigo_ativo, departamento, status, usuario_id) VALUES (?, ?, ?, ?, ?)",
    [nome_computador, codigo_ativo, departamento, statusDB, usuario_id],
    (err) => {
      if (err) {
        console.error("❌ Erro no POST /api/ativos:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({
              erro: "Este código de ativo já está em uso por outro PC.",
            });
        }
        return res
          .status(500)
          .json({ erro: "Erro SQL ao tentar salvar no banco de dados." });
      }
      res.status(201).json({ mensagem: "Sucesso" });
    },
  );
});

// Rota para editar os dados de um computador específico (usando o :id na URL)
app.put("/api/ativos/:id", (req, res) => {
  const { nome, codigo_ativo, departamento, status } = req.body;
  db.query(
    "UPDATE computers SET nome = ?, codigo_ativo = ?, departamento = ?, status = ? WHERE id = ?",
    [nome, codigo_ativo, departamento, status, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ erro: "Erro" });
      }
      res.status(200).json({ mensagem: "Sucesso" });
    },
  );
});

// Rota para apagar (deletar) permanentemente um computador
app.delete("/api/ativos/:id", (req, res) => {
  db.query("DELETE FROM computers WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ erro: "Erro" });
    }
    res.status(200).json({ mensagem: "Sucesso" });
  });
});

// Rotas de Licenças e Softwares
// Rota para buscar as licenças, fazendo JOIN com softwares e calculando os dias restantes (DATEDIFF)
app.get("/api/licencas", (req, res) => {
  const usuario_id = req.query.usuario_id;
  const sql = `
        SELECT l.id, s.nome AS software, l.chave_licenca, l.data_compra, l.data_expiracao, l.status, l.data_cancelamento,
        DATEDIFF(l.data_expiracao, CURDATE()) AS dias_restantes
        FROM licenses l JOIN softwares s ON l.software_id = s.id WHERE l.usuario_id = ? ORDER BY dias_restantes ASC
    `;
  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar licenças" });
    }
    res.status(200).json(results);
  });
});

// Rota para registrar uma nova licença. Verifica primeiro se o software já existe; se não existir, cria-o antes.
app.post("/api/licencas", (req, res) => {
  const { software, fornecedor, chave, compra, vencimento, usuario_id } =
    req.body;
  db.query(
    "SELECT id FROM softwares WHERE nome = ?",
    [software],
    (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro no banco" });
      }
      if (results.length > 0) {
        inserirLicenca(results[0].id);
      } else {
        db.query(
          "INSERT INTO softwares (nome, fornecedor) VALUES (?, ?)",
          [software, fornecedor],
          (err, result) => {
            if (err) {
              return res.status(500).json({ erro: "Erro ao criar software" });
            }
            inserirLicenca(result.insertId);
          },
        );
      }
    },
  );

  // Função auxiliar para inserir apenas a licença usando o ID do software (existente ou recém-criado)
  function inserirLicenca(software_id) {
    const sql =
      'INSERT INTO licenses (software_id, chave_licenca, data_compra, data_expiracao, status, usuario_id) VALUES (?, ?, ?, ?, "ativa", ?)';
    db.query(
      sql,
      [software_id, chave, compra, vencimento, usuario_id],
      (err) => {
        if (err) {
          return res.status(500).json({ erro: "Erro ao salvar licença" });
        }
        res.status(201).json({ mensagem: "Licença cadastrada!" });
      },
    );
  }
});

// Rota para renovar uma licença (atualiza a data de expiração e o status para ativa)
app.put("/api/licencas/:id/renovar", (req, res) => {
  const { nova_data } = req.body;
  if (!nova_data) {
    return res.status(400).json({ erro: "A nova data é obrigatória!" });
  }
  db.query(
    'UPDATE licenses SET data_expiracao = ?, status = "ativa" WHERE id = ?',
    [nova_data, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao renovar" });
      }
      res.status(200).json({ mensagem: "Renovada!" });
    },
  );
});

// Rota para cancelar uma licença (muda o status para "cancelada" e anota a data)
app.put("/api/licencas/:id/cancelar", (req, res) => {
  const { data_cancelamento } = req.body;
  if (!data_cancelamento) {
    return res.status(400).json({ erro: "A data é obrigatória!" });
  }
  db.query(
    'UPDATE licenses SET status = "cancelada", data_cancelamento = ? WHERE id = ?',
    [data_cancelamento, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao cancelar" });
      }
      res.status(200).json({ mensagem: "Cancelada!" });
    },
  );
});

// ==========================================
// MÓDULO DO AGENTE DE IA (ASSETPULSE COPILOT)
// ==========================================

// Função auxiliar que o Node.js vai usar para ir no MySQL quando a IA pedir
function buscarResumoAtivosDoBanco(usuario_id) {
    return new Promise((resolve, reject) => {
        // Multi-tenant check: filter by usuario_id if available
        const query = usuario_id 
            ? 'SELECT status, COUNT(*) as total FROM computers WHERE usuario_id = ? GROUP BY status'
            : 'SELECT status, COUNT(*) as total FROM computers GROUP BY status';
        const params = usuario_id ? [usuario_id] : [];
        
        db.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results); // Retorna algo como [{status: 'ativo', total: 10}, ...]
        });
    });
}

// Rota que recebe a mensagem do painel frontal
app.post('/api/chat', async (req, res) => {
    const mensagemUsuario = req.body.mensagem;
    const usuario_id = req.body.usuario_id;

    // 1. Configurando a IA e ensinando a ela qual "ferramenta" ela tem
    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        systemInstruction: "Você é o assistente virtual do sistema AssetPulse, focado em inventário de TI. Seja direto e profissional.",
        tools: [{
            functionDeclarations: [{
                name: "consultar_banco_ativos",
                description: "Use esta função SEMPRE que o usuário perguntar sobre a quantidade de computadores, PCs ativos, inativos ou em manutenção."
            }]
        }]
    });

    try {
        // 2. Inicia o chat e envia a pergunta do usuário
        const chat = model.startChat();
        const result = await chat.sendMessage(mensagemUsuario);
        
        // 3. Verifica se a IA decidiu que precisa usar a ferramenta (ir no banco de dados)
        const chamadasDeFuncao = result.response.functionCalls();

        if (chamadasDeFuncao && chamadasDeFuncao.length > 0 && chamadasDeFuncao[0].name === "consultar_banco_ativos") {
            console.log("🤖 IA solicitou acesso ao Banco de Dados...");
            
            // O Node.js vai lá no MySQL buscar os dados reais
            const dadosDoBanco = await buscarResumoAtivosDoBanco(usuario_id);

            // Devolvemos a resposta do MySQL para a IA processar
            const respostaFinal = await chat.sendMessage([{
                functionResponse: {
                    name: "consultar_banco_ativos",
                    response: { dados: dadosDoBanco }
                }
            }]);

            // Devolve a resposta mastigada pela IA para o Frontend
            return res.json({ resposta: respostaFinal.response.text() });
        }

        // Se a pergunta foi só "Olá" ou algo que não precisou de banco, responde normalmente
        return res.json({ resposta: result.response.text() });

    } catch (error) {
        console.error("Erro na IA:", error);
        res.status(500).json({ resposta: "Ops, meus circuitos falharam ao tentar pensar." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
