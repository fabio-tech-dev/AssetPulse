// ========================================================
// ARQUIVO: server.js
// DESCRIÇÃO: Backend da aplicação AssetPulse.
// Este arquivo Node.js com Express e MySQL gerencia as rotas da API para autenticação de usuários,
// gestão de ativos (computadores) e gestão de licenças de software.
// Ele atua como o ponto central de comunicação entre o frontend e o banco de dados.
// ========================================================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração de acesso ao Banco de Dados (MySQL)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '123456', 
    database: 'root'
});

// Tenta conectar ao banco e avisa no console do Node.js se deu certo ou errado
db.connect((err) => {
    if (err) { 
        console.error('❌ Erro de BD:', err); 
        return; 
    }
    console.log('✅ Conectado ao banco "gestordeinventario" com sucesso!');
});

// Rotas de Autenticação (Usuários)
// Rota para cadastrar um novo usuário no banco de dados
app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    db.query(
        'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
        [nome, email, senha],
        (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ erro: 'Email já cadastrado!' });
                }
                return res.status(500).json({ erro: 'Erro ao cadastrar' });
            }
            res.status(201).json({ mensagem: 'Sucesso' });
        }
    );
});

// Rota para validar o acesso de um usuário e devolver seus dados (Login)
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    db.query(
        'SELECT * FROM users WHERE email = ? AND senha = ?',
        [email, senha],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ erro: 'Inválido' });
            }
            const user = results[0]; 
            delete user.senha;
            res.status(200).json({ usuario: user });
        }
    );
});

// Rotas de Computadores (Ativos)
// Rota para listar todos os computadores cadastrados
app.get('/api/ativos', (req, res) => {
    const usuario_id = req.query.usuario_id;
    db.query(
        'SELECT id, nome, codigo_ativo, departamento, status FROM computers WHERE usuario_id = ?',
        [usuario_id],
        (err, results) => {
            if (err) {
                console.error('❌ Erro no GET /api/ativos:', err);
                return res.status(500).json({ erro: 'Erro ao buscar dados no banco.' });
            }
            res.status(200).json(results);
        }
    );
});

// Rota para cadastrar um novo computador no sistema
app.post('/api/ativos', (req, res) => {
    const { nome_computador, codigo_ativo, departamento, status, usuario_id } = req.body;
    let statusDB = status === 'manutencao' ? 'manutencao' : (status === 'descartado' ? 'descartado' : 'ativo');
    
    db.query(
        'INSERT INTO computers (nome, codigo_ativo, departamento, status, usuario_id) VALUES (?, ?, ?, ?, ?)', 
        [nome_computador, codigo_ativo, departamento, statusDB, usuario_id],
        (err) => {
            if (err) {
                console.error('❌ Erro no POST /api/ativos:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ erro: 'Este código de ativo já está em uso por outro PC.' });
                }
                return res.status(500).json({ erro: 'Erro SQL ao tentar salvar no banco de dados.' });
            }
            res.status(201).json({ mensagem: 'Sucesso' });
        }
    );
});

// Rota para editar os dados de um computador específico (usando o :id na URL)
app.put('/api/ativos/:id', (req, res) => {
    const { nome, codigo_ativo, departamento, status } = req.body; 
    db.query(
        'UPDATE computers SET nome = ?, codigo_ativo = ?, departamento = ?, status = ? WHERE id = ?', 
        [nome, codigo_ativo, departamento, status, req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro' });
            }
            res.status(200).json({ mensagem: 'Sucesso' });
        }
    );
});

// Rota para apagar (deletar) permanentemente um computador
app.delete('/api/ativos/:id', (req, res) => {
    db.query(
        'DELETE FROM computers WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro' });
            }
            res.status(200).json({ mensagem: 'Sucesso' });
        }
    );
});

// Rotas de Licenças e Softwares
// Rota para buscar as licenças, fazendo JOIN com softwares e calculando os dias restantes (DATEDIFF)
app.get('/api/licencas', (req, res) => {
    const usuario_id = req.query.usuario_id;
    const sql = `
        SELECT l.id, s.nome AS software, l.chave_licenca, l.data_compra, l.data_expiracao, l.status, l.data_cancelamento,
        DATEDIFF(l.data_expiracao, CURDATE()) AS dias_restantes
        FROM licenses l JOIN softwares s ON l.software_id = s.id WHERE l.usuario_id = ? ORDER BY dias_restantes ASC
    `;
    db.query(sql, [usuario_id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar licenças' });
        }
        res.status(200).json(results);
    });
});

// Rota para registrar uma nova licença. Verifica primeiro se o software já existe; se não existir, cria-o antes.
app.post('/api/licencas', (req, res) => {
    const { software, fornecedor, chave, compra, vencimento, usuario_id } = req.body;
    db.query(
        'SELECT id FROM softwares WHERE nome = ?',
        [software],
        (err, results) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro no banco' });
            }
            if (results.length > 0) {
                inserirLicenca(results[0].id); 
            } else {
                db.query(
                    'INSERT INTO softwares (nome, fornecedor) VALUES (?, ?)',
                    [software, fornecedor],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({ erro: 'Erro ao criar software' });
                        }
                        inserirLicenca(result.insertId); 
                    }
                );
            }
        }
    );

    // Função auxiliar para inserir apenas a licença usando o ID do software (existente ou recém-criado)
    function inserirLicenca(software_id) {
        const sql = 'INSERT INTO licenses (software_id, chave_licenca, data_compra, data_expiracao, status, usuario_id) VALUES (?, ?, ?, ?, "ativa", ?)';
        db.query(
            sql,
            [software_id, chave, compra, vencimento, usuario_id],
            (err) => {
                if (err) {
                    return res.status(500).json({ erro: 'Erro ao salvar licença' });
                }
                res.status(201).json({ mensagem: 'Licença cadastrada!' });
            }
        );
    }
});

// Rota para renovar uma licença (atualiza a data de expiração e o status para ativa)
app.put('/api/licencas/:id/renovar', (req, res) => {
    const { nova_data } = req.body; 
    if (!nova_data) {
        return res.status(400).json({ erro: 'A nova data é obrigatória!' });
    }
    db.query(
        'UPDATE licenses SET data_expiracao = ?, status = "ativa" WHERE id = ?',
        [nova_data, req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao renovar' });
            }
            res.status(200).json({ mensagem: 'Renovada!' });
        }
    );
});

// Rota para cancelar uma licença (muda o status para "cancelada" e anota a data)
app.put('/api/licencas/:id/cancelar', (req, res) => {
    const { data_cancelamento } = req.body; 
    if (!data_cancelamento) {
        return res.status(400).json({ erro: 'A data é obrigatória!' });
    }
    db.query(
        'UPDATE licenses SET status = "cancelada", data_cancelamento = ? WHERE id = ?',
        [data_cancelamento, req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao cancelar' });
            }
            res.status(200).json({ mensagem: 'Cancelada!' });
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));