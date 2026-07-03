USE gestordeinventario;

-- Adiciona a coluna de identificação do dono sem apagar os seus dados atuais
ALTER TABLE computers ADD COLUMN usuario_id INT NOT NULL DEFAULT 1;
ALTER TABLE licenses ADD COLUMN usuario_id INT NOT NULL DEFAULT 1;