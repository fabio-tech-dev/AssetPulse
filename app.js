// ========================================================
// ARQUIVO: app.js
// DESCRIÇÃO: Lógica JavaScript para o frontend do AssetPulse (index.html).
// Este script gerencia a interface do usuário, interage com a API de backend
// para carregar e manipular dados de ativos e licenças, e controla modais
// e alertas visuais.
// ========================================================
// Verifica se há um usuário salvo no navegador (logado). Se não houver, expulsa de volta para o login.
const usuarioString = localStorage.getItem("usuarioLogado");
if (!usuarioString) {
  window.location.href = "login.html";
}

const usuarioId = JSON.parse(usuarioString).id;

// Função que encerra a sessão do usuário limpando o LocalStorage
function fazerLogout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

let listaAtivosGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
  if (usuarioString) {
    try {
      const usuarioLogado = JSON.parse(usuarioString);
      const msgBoasVindas = document.getElementById("mensagem-boas-vindas");
      if (msgBoasVindas && usuarioLogado.nome) {
        const primeiroNome = usuarioLogado.nome.split(" ")[0];
        msgBoasVindas.innerText = `Bem-vindo, ${primeiroNome}! 👋`;
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  }
  iniciarCarrossel();
  carregarAtivos();
  carregarLicencas();
  criarCardSobre();
});

// Oculta todas as telas do sistema e mostra apenas a que foi clicada no menu
function alternarTela(telaAlvo) {
  document.getElementById("tela-inicio").style.display = "none";
  document.getElementById("tela-gerenciar-ativos").style.display = "none";
  document.getElementById("tela-gerenciar-licencas").style.display = "none";
  document.getElementById(telaAlvo).style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Cria dinamicamente as notificações (Toasts) flutuantes no canto da tela com HTML
function mostrarAlertaCustom(titulo, mensagem, tipo, icone) {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-long toast-${tipo}`;
  toast.innerHTML = `
        <div class="toast-icon">${icone}</div>
        <div class="toast-content" style="flex: 1;">
            <h4>${titulo}</h4>
            <p>${mensagem}</p>
        </div>
        <button class="btn-fechar-toast" onclick="this.parentElement.remove()" title="Fechar alerta">&times;</button>
    `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 6000);
}

// Banco de dados local com as informações exibidas no modal dinâmico de recursos
const bancoDeInformacoes = {
  nuvem: {
    icone: "☁️",
    titulo: "Nuvem e Backups",
    texto: `<p style="margin-top:0;">O AssetPulse utiliza arquitetura distribuída. Toda a base de dados do seu inventário é sincronizada em nuvem em tempo real.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Bancos de dados MySQL otimizados.</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Rotinas de backup automatizadas.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Acesso remoto de qualquer lugar do mundo.</li>
                </ul>`,
  },
  seguranca: {
    icone: "🔒",
    titulo: "Segurança Avançada",
    texto: `<p style="margin-top:0;">Lidamos com chaves de licença caras e dados sensíveis. Por isso, nossa segurança é de nível empresarial.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Criptografia na transmissão de dados.</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Sistema de Login com senhas ocultas.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Proteção contra injeções SQL.</li>
                </ul>`,
  },
  suporte: {
    icone: "🚀",
    titulo: "Suporte Dedicado",
    texto: `<p style="margin-top:0;">Seus dados não ficam presos. Prezamos pela transparência e agilidade na prestação de contas (Reports) para a diretoria.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Exportação instantânea para CSV/Excel.</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Filtros inteligentes que organizam os dados.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Design focado na facilidade de uso (UX).</li>
                </ul>`,
  },
  alertas: {
    icone: "🔄",
    titulo: "Alertas Inteligentes",
    texto: `<p style="margin-top:0;">Esquecer a data de renovação pode parar a empresa. O AssetPulse calcula diariamente a validade de todas as licenças.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Identificação visual baseada no status.</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Cards de KPI alertam expiramentos.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Contagem regressiva feita pelo servidor.</li>
                </ul>`,
  },
  api: {
    icone: "⚙️",
    titulo: "API Poderosa",
    texto: `<p style="margin-top:0;">O coração do AssetPulse é o seu backend em Node.js. Ele funciona como uma API RESTful completa e escalável.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Rotas estruturadas (GET, POST, PUT, DELETE).</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Respostas rápidas e padronizadas em JSON.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Integração futura com PowerBI e Active Directory.</li>
                </ul>`,
  },
  manutencao: {
    icone: "🛠️",
    titulo: "Gestão de Manutenção",
    texto: `<p style="margin-top:0;">Saiba a saúde real das máquinas. Isole equipamentos que estão na bancada, facilitando a vida dos técnicos de campo.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Mude o status para "Em Manutenção" rápido.</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Recalculo da saúde do parque na hora.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> Histórico limpo sem perder o rastreio.</li>
                </ul>`,
  },
  sobre: {
    icone: "🏢",
    titulo: "Sobre a AssetPulse",
    texto: `<p style="margin-top:0;">O AssetPulse é uma solução inovadora projetada para revolucionar a forma como as empresas gerenciam seus ativos de TI e licenças de software.</p>
                <ul style="list-style: none; padding: 0; margin-top: 15px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> <b>Missão:</b> Simplificar e automatizar a gestão de inventário.</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> <b>Visão:</b> Ser a plataforma líder em controle de hardwares.</li>
                    <li style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;"><span style="color:#00e676;">✓</span> <b>Valores:</b> Segurança, eficiência e inovação tecnológica.</li>
                </ul>`,
  },
};

// Injeta dinamicamente um card gigante no final do grid de serviços
function criarCardSobre() {
  const grid = document.querySelector(".servicos-grid");
  if (grid) {
    const card = document.createElement("a");
    card.href = "#";
    card.className = "servico-card destaque-sobre";
    card.onclick = (e) => {
      e.preventDefault();
      abrirModalInfo("sobre");
    };
    card.innerHTML = `
            <div class="servico-icone">🏢</div>
            <h3 style="font-size: 22px; color: #d8b4fe;">Sobre a AssetPulse</h3>
            <p style="font-size: 16px; max-width: 800px; margin: 0 auto;">Descubra como revolucionamos a gestão de ativos de TI e licenças de software. Clique para conhecer nossa Missão, Visão e Valores.</p>
        `;
    grid.appendChild(card);
  }
}

function abrirModalInfo(chave) {
  const info = bancoDeInformacoes[chave];
  document.getElementById("info-icone").innerText = info.icone;
  document.getElementById("info-titulo").innerText = info.titulo;
  document.getElementById("info-conteudo").innerHTML = info.texto;
  document.getElementById("modal-info-recurso").classList.add("mostrar");
}

function fecharModalInfo() {
  document.getElementById("modal-info-recurso").classList.remove("mostrar");
}

// Calcula a "saúde" do inventário avaliando a porcentagem de eficiência + quantidade de licenças críticas
function atualizarStatusGeral() {
  let effStr = document
    .getElementById("eficiencia-texto")
    .innerText.replace("%", "");
  let eff = parseInt(effStr) || 0;
  let alertas =
    parseInt(document.getElementById("kpi-licencas").innerText) || 0;
  let totalPcs =
    parseInt(document.getElementById("kpi-total-pcs").innerText) || 0;

  let statusText = "Excelente";

  if (totalPcs === 0) {
    statusText = "Sistema Vazio";
    document.getElementById("eficiencia-texto").innerText = "100%";
    document.getElementById("health-percentage").innerText =
      "Aguardando Cadastro";
  } else {
    if (eff < 80 || alertas > 0) statusText = "Atenção";
    if (eff < 50 || alertas > 5) statusText = "Crítico";
  }

  document.getElementById("kpi-status").innerText = statusText;
}

// Busca os computadores da API e injeta as linhas nas tabelas dinamicamente
async function carregarAtivos() {
  try {
    const response = await fetch(
      "https://assetpulse-lh3s.onrender.com/api/ativos?usuario_id=" + usuarioId,
    );
    if (!response.ok) {
      const errObj = await response.json().catch(() => ({}));
      throw new Error(
        errObj.erro || "Erro na API de Ativos (" + response.status + ")",
      );
    }
    const ativos = await response.json();
    listaAtivosGlobal = ativos;

    const tbodyResumo = document.getElementById("corpo-tabela");
    const tbodyCompleta = document.getElementById(
      "corpo-tabela-ativos-completa",
    );

    if (tbodyResumo) tbodyResumo.innerHTML = "";
    if (tbodyCompleta) tbodyCompleta.innerHTML = "";

    let totalAtivos = ativos.length;
    let emManutencao = 0;
    let ativosFuncionando = 0;

    ativos.forEach((ativo, index) => {
      if (ativo.status === "manutencao") {
        emManutencao++;
      }
      if (ativo.status === "ativo") {
        ativosFuncionando++;
      }

      let classeBolinha =
        ativo.status === "ativo"
          ? "dot-ativo"
          : ativo.status === "manutencao"
            ? "dot-manutencao"
            : "dot-descartado";
      let textoStatus =
        ativo.status === "ativo"
          ? "Ativo"
          : ativo.status === "manutencao"
            ? "Em Manutenção"
            : "Inativo";

      if (index < 5 && tbodyResumo) {
        tbodyResumo.innerHTML += `
                    <tr>
                        <td>${ativo.id}</td>
                        <td>${ativo.nome}</td>
                        <td>${ativo.codigo_ativo}</td>
                        <td>${ativo.departamento}</td>
                        <td><span class="status-dot ${classeBolinha}"></span> ${textoStatus}</td>
                    </tr>`;
      }
      
      if (tbodyCompleta) {
        tbodyCompleta.innerHTML += `
                    <tr>
                        <td>${ativo.id}</td>
                        <td>${ativo.nome}</td>
                    <td>${ativo.codigo_ativo}</td>
                    <td>${ativo.departamento}</td>
                    <td><span class="status-dot ${classeBolinha}"></span> ${textoStatus}</td>
                    <td>
                        <div class="dropdown-acoes">
                            <button class="btn-opcoes" onclick="abrirMenuAcoes(this)">⋮</button>
                            <div class="menu-acoes-oculto">
                                <button class="btn-editar-menu" onclick="abrirModalEditar(${ativo.id})">✏️ Editar</button>
                                <button class="btn-excluir-menu" onclick="abrirModalExcluir(${ativo.id})">🗑️ Excluir</button>
                                <button class="btn-qr-menu" onclick="abrirModalQR(${ativo.id}, ${JSON.stringify(ativo.nome)})">📱 QR Code</button>
                              </div>
                        </div>
                    </td>
                    </tr>`;
      }
    });

    if (totalAtivos > 5 && tbodyResumo) {
      tbodyResumo.innerHTML += `
                <tr>
                    <td colspan="5" style="text-align: center; color: #a78bfa; font-size: 14px; font-style: italic;">
                        Existem mais ${totalAtivos - 5} computadores. Vá em <b>Gestão de Ativos</b> para ver a lista completa.
                    </td>
                </tr>`;
    }

    document.getElementById("kpi-total-pcs").innerText = totalAtivos;
    document.getElementById("kpi-manutencao").innerText = emManutencao;

    // Lógica matemática para preencher a barra de integridade do painel
    let eficiencia =
      totalAtivos > 0 ? Math.round((ativosFuncionando / totalAtivos) * 100) : 0;

    if (totalAtivos > 0) {
      document.getElementById("eficiencia-texto").innerText = eficiencia + "%";
      document.getElementById("health-percentage").innerText = eficiencia + "%";
    }

    document.getElementById("health-bar-fill").style.width = eficiencia + "%";

    let fill = document.getElementById("health-bar-fill");
    if (eficiencia >= 80 || totalAtivos === 0) {
      fill.style.background = "linear-gradient(90deg, #2ecc71, #27ae60)";
    } else if (eficiencia >= 50) {
      fill.style.background = "linear-gradient(90deg, #f1c40f, #f39c12)";
    } else {
      fill.style.background = "linear-gradient(90deg, #e74c3c, #c0392b)";
    }

    atualizarStatusGeral();
  } catch (error) {
    console.error(error);
    const tbodyResumo = document.getElementById("corpo-tabela");
    if (tbodyResumo)
      tbodyResumo.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Falha: ${error.message === "Failed to fetch" ? "Servidor Node.js Offline ou Indisponível" : error.message}</td></tr>`;
  }
}

// Puxa as licenças do backend, separando o que está prestes a expirar, ativas e as canceladas
async function carregarLicencas() {
  try {
    const response = await fetch(
      "https://assetpulse-lh3s.onrender.com/api/licencas?usuario_id=" + usuarioId,
    );
    if (!response.ok) throw new Error("Erro na API de Licenças");
    const licencas = await response.json();

    const tbodyResumo = document.getElementById("corpo-tabela-licencas-resumo");
    const tbodyCompleta = document.getElementById("corpo-tabela-licencas");
    const tbodyCanceladas = document.getElementById(
      "corpo-tabela-licencas-canceladas",
    );

    tbodyResumo.innerHTML = "";
    tbodyCompleta.innerHTML = "";
    tbodyCanceladas.innerHTML = "";

    let temCancelada = false;
    let licencasAlerta = 0;

    licencas.forEach((lic) => {
      const dataCompra = lic.data_compra
        ? new Date(lic.data_compra).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })
        : "N/A";
      const dataVenc = lic.data_expiracao
        ? new Date(lic.data_expiracao).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })
        : "N/A";

      if (lic.status === "cancelada") {
        temCancelada = true;
        const dataCanc = lic.data_cancelamento
          ? new Date(lic.data_cancelamento).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })
          : "N/A";

        tbodyCanceladas.innerHTML += `
                    <tr>
                        <td><b>${lic.software}</b></td>
                        <td><span style="font-family: monospace;">${lic.chave_licenca}</span></td>
                        <td>${dataCompra}</td>
                        <td>${dataCanc}</td>
                    </tr>`;
      } else {
        let classeBolinha = "dot-ativo";
        let textoStatus = `${lic.dias_restantes} dias restantes`;

        if (lic.dias_restantes <= 0) {
          classeBolinha = "dot-descartado";
          textoStatus = "Expirada!";
          licencasAlerta++;
        } else if (lic.dias_restantes <= 30) {
          classeBolinha = "dot-manutencao";
          licencasAlerta++;
        }

        tbodyResumo.innerHTML += `
                    <tr>
                        <td><b>${lic.software}</b></td>
                        <td>${dataVenc}</td>
                        <td><span class="status-dot ${classeBolinha}"></span> ${textoStatus}</td>
                    </tr>`;

        tbodyCompleta.innerHTML += `
                    <tr>
                        <td><b>${lic.software}</b></td>
                        <td><span style="font-family: monospace; color: #8e44ad;">${lic.chave_licenca}</span></td>
                        <td>${dataCompra}</td>
                        <td>${dataVenc}</td>
                        <td><span class="status-dot ${classeBolinha}"></span> ${textoStatus}</td>
                        <td>
                            <div class="dropdown-acoes">
                                <button class="btn-opcoes" onclick="abrirMenuAcoes(this)">⋮</button>
                                <div class="menu-acoes-oculto">
                                    <button class="btn-editar-menu" onclick="abrirModalRenovar(${lic.id}, '${lic.software}')">🔄 Renovar</button>
                                    <button class="btn-excluir-menu" onclick="abrirModalCancelar(${lic.id}, '${lic.software}')">🚫 Cancelar</button>
                                </div>
                            </div>
                        </td>
                    </tr>`;
      }
    });

    if (!temCancelada) {
      tbodyCanceladas.innerHTML =
        '<tr><td colspan="4" style="text-align: center; color: #a59caf;">Nenhuma licença cancelada até o momento.</td></tr>';
    }

    document.getElementById("kpi-licencas").innerText = licencasAlerta;
    atualizarStatusGeral();
  } catch (error) {
    console.error(error);
  }
}

function abrirModalLicenca(event) {
  if (event) {
    event.preventDefault();
  }
  document.getElementById("modal-cadastro-licenca").classList.add("mostrar");
}

function fecharModalLicenca() {
  document.getElementById("modal-cadastro-licenca").classList.remove("mostrar");
}

document
  .getElementById("form-nova-licenca")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const dados = {
      software: document.getElementById("nova-lic-nome").value,
      fornecedor: document.getElementById("nova-lic-fornecedor").value,
      chave: document.getElementById("nova-lic-chave").value,
      compra: document.getElementById("nova-lic-compra").value,
      vencimento: document.getElementById("nova-lic-vencimento").value,
      usuario_id: usuarioId,
    };

    try {
      const response = await fetch("https://assetpulse-lh3s.onrender.com/api/licencas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        fecharModalLicenca();
        document.getElementById("form-nova-licenca").reset();
        carregarLicencas();
        mostrarAlertaCustom(
          "Licença Registrada",
          "O software e a licença foram vinculados ao sistema com sucesso!",
          "success",
          "🔐",
        );
      } else {
        mostrarAlertaCustom(
          "Erro",
          "Falha ao cadastrar a licença.",
          "error",
          "❌",
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

function abrirModalRenovar(id, nomeSoftware) {
  document.getElementById("renovar-lic-id").value = id;
  document.getElementById("renovar-lic-nome").innerText = nomeSoftware;
  document.getElementById("renovar-lic-nova-data").value = "";
  document.getElementById("modal-renovar-licenca").classList.add("mostrar");
}

function fecharModalRenovar() {
  document.getElementById("modal-renovar-licenca").classList.remove("mostrar");
}

document
  .getElementById("form-renovar-licenca")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("renovar-lic-id").value;
    const novaData = document.getElementById("renovar-lic-nova-data").value;
    const nomeSoftware = document.getElementById("renovar-lic-nome").innerText;

    try {
      const response = await fetch(
        `https://assetpulse-lh3s.onrender.com/api/licencas/${id}/renovar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nova_data: novaData }),
        },
      );

      if (response.ok) {
        fecharModalRenovar();
        carregarLicencas();
        const dataBrasileira = new Date(novaData).toLocaleDateString("pt-BR", {
          timeZone: "UTC",
        });
        mostrarAlertaCustom(
          "Renovação Concluída",
          `A licença do ${nomeSoftware} agora é válida até: ${dataBrasileira} 📅`,
          "success",
          "⭐",
        );
      } else {
        mostrarAlertaCustom(
          "Erro",
          "Erro ao processar renovação.",
          "error",
          "❌",
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

function abrirModalCancelar(id, nomeSoftware) {
  document.getElementById("cancelar-lic-id").value = id;
  document.getElementById("cancelar-lic-nome").innerText = nomeSoftware;
  document.getElementById("cancelar-lic-data").valueAsDate = new Date();
  document.getElementById("modal-cancelar-licenca").classList.add("mostrar");
}

function fecharModalCancelar() {
  document.getElementById("modal-cancelar-licenca").classList.remove("mostrar");
}

document
  .getElementById("form-cancelar-licenca")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("cancelar-lic-id").value;
    const dataCanc = document.getElementById("cancelar-lic-data").value;
    const nomeSoftware = document.getElementById("cancelar-lic-nome").innerText;

    try {
      const response = await fetch(
        `https://assetpulse-lh3s.onrender.com/api/licencas/${id}/cancelar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data_cancelamento: dataCanc }),
        },
      );

      if (response.ok) {
        fecharModalCancelar();
        carregarLicencas();
        mostrarAlertaCustom(
          "Licença Cancelada",
          `A licença do ${nomeSoftware} foi movida para o histórico de cancelados.`,
          "info",
          "🚫",
        );
      } else {
        mostrarAlertaCustom(
          "Erro",
          "Erro ao processar cancelamento.",
          "error",
          "❌",
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

// Habilita ou desabilita o campo de código para gerar um texto aleatório automaticamente
const checkboxGerar = document.getElementById("check-gerar-codigo");
const inputCodigo = document.getElementById("novo-pc-codigo");

if (checkboxGerar && inputCodigo) {
  checkboxGerar.addEventListener("change", function () {
    if (this.checked) {
      inputCodigo.disabled = true;
      inputCodigo.value = "";
      inputCodigo.style.backgroundColor = "#1e1835";
      inputCodigo.placeholder = "Gerando automaticamente...";
    } else {
      inputCodigo.disabled = false;
      inputCodigo.style.backgroundColor = "";
      inputCodigo.placeholder = "Ex: ATV-015";
    }
  });
}

function abrirModalPC(event) {
  if (event) {
    event.preventDefault();
  }
  document.getElementById("modal-cadastro-pc").classList.add("mostrar");
}

function fecharModalPC() {
  document.getElementById("modal-cadastro-pc").classList.remove("mostrar");
}

// Dispara quando tentamos salvar um novo Computador no sistema
document
  .getElementById("form-novo-pc")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const inputCodigoLcl = document.getElementById("novo-pc-codigo");
      const checkboxGerarLcl = document.getElementById("check-gerar-codigo");

      let codigoFinal = inputCodigoLcl ? inputCodigoLcl.value.trim() : "";
      const querGerarAutomatico = checkboxGerarLcl
        ? checkboxGerarLcl.checked
        : false;
      let codigoInjetadoFoiGerado = false;

      if (!querGerarAutomatico && codigoFinal === "") {
        mostrarAlertaCustom(
          "Atenção!",
          "Por favor, digite o Código do Ativo.",
          "info",
          "⚠️",
        );
        if (inputCodigoLcl) {
          inputCodigoLcl.classList.add("input-erro");
          setTimeout(() => inputCodigoLcl.classList.remove("input-erro"), 800);
        }
        return;
      }

      if (querGerarAutomatico) {
        codigoFinal =
          "SYS-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        codigoInjetadoFoiGerado = true;
      }

      const nomeEl = document.getElementById("novo-pc-nome");
      const deptoEl = document.getElementById("novo-pc-depto");
      const statusEl = document.getElementById("novo-pc-status");

      // Trava de segurança: Se os IDs no HTML estiverem mal escritos, ele avisa no ecrã.
      if (!nomeEl || !deptoEl || !statusEl) {
        throw new Error(
          "Campos do formulário não encontrados no HTML (Verifique os IDs no ficheiro html).",
        );
      }

      const dados = {
        nome_computador: nomeEl.value,
        codigo_ativo: codigoFinal,
        departamento: deptoEl.value,
        status: statusEl.value,
        usuario_id: usuarioId,
      };

      const response = await fetch("https://assetpulse-lh3s.onrender.com/api/ativos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        fecharModalPC();
        document.getElementById("form-novo-pc").reset();
        if (inputCodigoLcl) {
          inputCodigoLcl.disabled = false;
          inputCodigoLcl.style.backgroundColor = "";
          inputCodigoLcl.placeholder = "Ex: ATV-015";
        }
        carregarAtivos();

        if (codigoInjetadoFoiGerado) {
          mostrarAlertaCustom(
            "Computador Cadastrado!",
            `🤖 Código gerado: ${codigoFinal}\n\n⚠️ IMPORTANTE:\nSe este computador possuir uma etiqueta física, você pode editar depois.`,
            "info",
            "💻",
          );
        } else {
          mostrarAlertaCustom(
            "Tudo Certo!",
            `Computador salvo com código: ${codigoFinal}`,
            "success",
            "✅",
          );
        }
      } else {
        const dataErro = await response.json();
        mostrarAlertaCustom(
          "Atenção",
          dataErro.erro || "Falha ao cadastrar o computador.",
          "error",
          "❌",
        );
      }
    } catch (error) {
      console.error(error);
      mostrarAlertaCustom(
        "Falha de Sistema",
        error.message === "Failed to fetch"
          ? "Servidor Node.js Offline"
          : error.message,
        "error",
        "❌",
      );
    }
  });

function abrirModalEditar(id) {
  const pc = listaAtivosGlobal.find((ativo) => ativo.id === id);
  if (!pc) return;
  document.getElementById("edit-pc-id").value = pc.id;
  document.getElementById("edit-pc-nome").value = pc.nome_computador || pc.nome;
  document.getElementById("edit-pc-codigo").value =
    pc.codigo_ativo || pc.codigo;
  document.getElementById("edit-pc-depto").value = pc.departamento;
  document.getElementById("edit-pc-status").value = pc.status;
  document.getElementById("modal-editar-pc").classList.add("mostrar");
}

function fecharModalEditar() {
  document.getElementById("modal-editar-pc").classList.remove("mostrar");
}

document
  .getElementById("form-editar-pc")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-pc-id").value;
    const dadosAtualizados = {
      nome: document.getElementById("edit-pc-nome").value,
      codigo_ativo: document.getElementById("edit-pc-codigo").value,
      departamento: document.getElementById("edit-pc-depto").value,
      status: document.getElementById("edit-pc-status").value,
    };

    try {
      const response = await fetch(`https://assetpulse-lh3s.onrender.com/api/ativos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados),
      });

      if (response.ok) {
        fecharModalEditar();
        carregarAtivos();
        mostrarAlertaCustom("Sucesso!", "Dados atualizados.", "success", "✏️");
      }
    } catch (error) {
      console.error(error);
    }
  });

function abrirModalExcluir(id) {
  const pc = listaAtivosGlobal.find((ativo) => ativo.id === id);
  if (!pc) return;
  document.getElementById("excluir-pc-id").value = pc.id;
  document.getElementById("excluir-pc-nome").innerText =
    pc.nome || pc.nome_computador || "Este Computador";
  document.getElementById("modal-excluir-pc").classList.add("mostrar");
}

function fecharModalExcluir() {
  document.getElementById("modal-excluir-pc").classList.remove("mostrar");
}

document
  .getElementById("form-excluir-pc")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("excluir-pc-id").value;
    try {
      const res = await fetch(`https://assetpulse-lh3s.onrender.com/api/ativos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fecharModalExcluir();
        carregarAtivos();
        mostrarAlertaCustom(
          "Excluído",
          "Removido com sucesso.",
          "success",
          "🗑️",
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

// Converte os dados visíveis na tabela de ATIVOS para um arquivo CSV e faz o download automático
function gerarRelatorioCSV(event) {
  if (event) {
    event.preventDefault();
  }
  const tabela = document.getElementById("tabela-ativos-completa");
  const linhas = tabela.querySelectorAll("tbody tr:not(.linha-vazia)");
  let csv = [];
  let BOM = "\uFEFF";

  csv.push(
    '"ID";"Nome do Computador";"Código do Ativo";"Departamento";"Status"',
  );

  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].querySelector("td[colspan]")) continue;
    let linhaAtual = [];
    let colunas = linhas[i].querySelectorAll("td");
    for (let j = 0; j < colunas.length - 1; j++) {
      let texto = colunas[j].innerText.replace(/(\r\n|\n|\r)/gm, " ");
      linhaAtual.push(`"${texto}"`);
    }
    csv.push(linhaAtual.join(";"));
  }
  iniciarDownload(BOM + csv.join("\n"), "relatorio_pcs.csv");
}

// Converte os dados visíveis na tabela de LICENÇAS para um arquivo CSV e faz o download automático
function gerarRelatorioLicencas(event) {
  if (event) {
    event.preventDefault();
  }
  const tabela = document.getElementById("tabela-licencas");
  const linhas = tabela.querySelectorAll("tbody tr:not(.linha-vazia)");
  let csv = [];
  let BOM = "\uFEFF";

  csv.push('"Software";"Chave (Key)";"Data de Compra";"Vencimento";"Status"');

  linhas.forEach((linha) => {
    if (linha.querySelector("td[colspan]")) return;

    let linhaAtual = [];
    let colunas = linha.querySelectorAll("td");

    for (let j = 0; j < colunas.length - 1; j++) {
      let texto = colunas[j].innerText.replace(/(\r\n|\n|\r)/gm, " ");
      linhaAtual.push(`"${texto}"`);
    }
    csv.push(linhaAtual.join(";"));
  });

  iniciarDownload(BOM + csv.join("\n"), "relatorio_licencas.csv");
}

// Cria um link "fantasma" no navegador para forçar o download do arquivo CSV recém gerado
function iniciarDownload(conteudoCSV, nomeArquivo) {
  const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Filtra a tabela de computadores completa (escondendo os que não batem com o status selecionado)
function filtrarAtivosPorStatus(status) {
  const tbody = document.getElementById("corpo-tabela-ativos-completa");
  const linhas = tbody.querySelectorAll("tr:not(.linha-vazia)");
  let temVisivel = false;
  let isTabelaVaziaDeVerdade = false;

  linhas.forEach((linha) => {
    if (linha.querySelector("td[colspan]")) {
      if (linha.textContent.toLowerCase().includes("carregando")) {
        isTabelaVaziaDeVerdade = true;
        return;
      }
    }

    const textoStatus = linha.querySelectorAll("td")[4]
      ? linha.querySelectorAll("td")[4].textContent.trim()
      : "";

    if (status === "" || textoStatus === status) {
      linha.style.display = "";
      temVisivel = true;
    } else {
      linha.style.display = "none";
    }
  });

  let linhaVazia = tbody.querySelector(".linha-vazia");
  if (!temVisivel && !isTabelaVaziaDeVerdade) {
    if (!linhaVazia) {
      linhaVazia = document.createElement("tr");
      linhaVazia.className = "linha-vazia";
      const colunasCount = tbody.parentElement.querySelectorAll("th").length;
      linhaVazia.innerHTML = `<td colspan="${colunasCount}" style="text-align: center; padding: 40px; color: #a59caf; font-size: 16px;"></td>`;
      tbody.appendChild(linhaVazia);
    }
    linhaVazia.style.display = "";
    linhaVazia.querySelector("td").innerHTML =
      `🔍 Não há nenhum computador com o status <b>"${status}"</b>.`;
  } else if (linhaVazia) {
    linhaVazia.style.display = "none";
  }
}

// Filtra tabelas de licenças genéricas através do valor digitado no campo de texto de pesquisa
function filtrarTabela(idTbody, valor) {
  const input = valor.toLowerCase();
  const tbody = document.getElementById(idTbody);
  if (!tbody) return;

  const linhas = tbody.querySelectorAll("tr:not(.linha-vazia)");
  let temVisivel = false;
  let isTabelaVaziaDeVerdade = false;

  linhas.forEach((linha) => {
    if (linha.querySelector("td[colspan]")) {
      const txt = linha.textContent.toLowerCase();
      if (txt.includes("carregando") || txt.includes("nenhuma")) {
        isTabelaVaziaDeVerdade = true;
        return;
      }
    }

    const textoLinha = linha.textContent.toLowerCase();
    if (textoLinha.includes(input)) {
      linha.style.display = "";
      temVisivel = true;
    } else {
      linha.style.display = "none";
    }
  });

  if (isTabelaVaziaDeVerdade && input === "") {
    linhas.forEach((l) => (l.style.display = ""));
    let linhaVazia = tbody.querySelector(".linha-vazia");
    if (linhaVazia) linhaVazia.style.display = "none";
    return;
  }

  let linhaVazia = tbody.querySelector(".linha-vazia");
  if (!temVisivel && !isTabelaVaziaDeVerdade) {
    if (!linhaVazia) {
      linhaVazia = document.createElement("tr");
      linhaVazia.className = "linha-vazia";
      const colunasCount = tbody.parentElement.querySelectorAll("th").length;
      linhaVazia.innerHTML = `<td colspan="${colunasCount}" style="text-align: center; padding: 40px; color: #a59caf; font-size: 16px;"></td>`;
      tbody.appendChild(linhaVazia);
    }
    linhaVazia.style.display = "";

    if (valor.trim() !== "") {
      linhaVazia.querySelector("td").innerHTML =
        `🔍 Nenhum resultado encontrado para <b>"${valor}"</b>.`;
    } else {
      linhaVazia.querySelector("td").innerHTML = `Nenhum resultado encontrado.`;
    }
  } else if (linhaVazia) {
    linhaVazia.style.display = "none";
  }
}

// Alterna automaticamente os slides da seção "Segurança Integrada/Acesso Multiplataforma"
function iniciarCarrossel() {
  const slides = document.querySelectorAll(".slide");
  let slideAtual = 0;
  if (slides.length === 0) return;

  setInterval(() => {
    slides[slideAtual].classList.remove("ativo");
    slideAtual = (slideAtual + 1) % slides.length;
    slides[slideAtual].classList.add("ativo");
  }, 5000);
}

function abrirMenuAcoes(botao) {
  document.querySelectorAll(".menu-acoes-oculto.mostrar").forEach((menu) => {
    if (menu !== botao.nextElementSibling) menu.classList.remove("mostrar");
  });
  botao.nextElementSibling.classList.toggle("mostrar");
}

window.onclick = function (event) {
  if (!event.target.matches(".btn-opcoes")) {
    document
      .querySelectorAll(".menu-acoes-oculto.mostrar")
      .forEach((menu) => menu.classList.remove("mostrar"));
  }
  if (event.target.classList.contains("modal-overlay")) {
    fecharModalPC();
    fecharModalEditar();
    fecharModalLicenca();
    fecharModalRenovar();
    fecharModalCancelar();
    fecharModalInfo();
    fecharModalExcluir();
    fecharModalQR();
  }
};

// ==========================================
// MÓDULO: GERAÇÃO DE QR CODE
// ==========================================

function abrirModalQR(id, nome) {
  const modal = document.getElementById("modal-qrcode");
  const nomeTela = document.getElementById("qr-ativo-nome");
  const imagemQr = document.getElementById("qr-imagem");

  // Escreve o nome na tela
  nomeTela.innerText = nome;

  // Gera o QR Code instantâneo com a API
  const conteudo = `AssetPulse | ID: ${id} | Equipamento: ${nome}`;
  const urlQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(conteudo)}`;
  
  imagemQr.src = urlQr;
  imagemQr.alt = `QR Code de ${nome}`;

  // Salva os dados para a impressora ler
  window.ativoAtualQR = { id: id, nome: nome };

  // Usa a classe original do seu sistema para exibir a janela
  modal.classList.add("mostrar");
}

function fecharModalQR() {
  const modal = document.getElementById("modal-qrcode");
  modal.classList.remove("mostrar");
  window.ativoAtualQR = null;
}

function imprimirQR() {
  if (!window.ativoAtualQR) return;

  const nomeAtivo = window.ativoAtualQR.nome;
  const urlImagem = document.getElementById("qr-imagem").src;

  const janelaImpressao = window.open("", "", "width=500,height=600");
  janelaImpressao.document.write(`
    <html>
      <head>
        <title>Etiqueta - ${nomeAtivo}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 24px; }
          .etiqueta { display: inline-block; padding: 20px; border: 2px dashed #000; border-radius: 12px; }
          h2 { margin: 0 0 12px; color: #222; }
          img { width: 180px; height: 180px; margin: 12px 0; }
          p { margin: 0; font-size: 16px; font-weight: bold; color: #000; }
        </style>
      </head>
      <body>
        <div class="etiqueta">
          <h2>AssetPulse</h2>
          <img src="${urlImagem}" />
          <p>${nomeAtivo}</p>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  janelaImpressao.document.close();
}

// ========================================================
// CONTROLE DO CHATBOT (PULSEBOT)
// ========================================================

function toggleChat() {
  const chatWindow = document.getElementById("chat-window");
  if (!chatWindow) return;
  chatWindow.classList.toggle("active");
  
  // Ao abrir, foca automaticamente no input do chat
  if (chatWindow.classList.contains("active")) {
    const input = document.getElementById("chat-input");
    if (input) input.focus();
  }
}

async function enviarMensagemChat(event) {
  event.preventDefault();
  
  const input = document.getElementById("chat-input");
  const messagesContainer = document.getElementById("chat-messages");
  if (!input || !messagesContainer) return;
  
  const texto = input.value.trim();
  if (!texto) return;
  
  // 1. Injetar a mensagem do usuário
  const userMsgElement = document.createElement("div");
  userMsgElement.className = "msg-user";
  userMsgElement.innerText = texto;
  messagesContainer.appendChild(userMsgElement);
  
  // Limpa o input
  input.value = "";
  
  // Rola para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // 2. Injetar o indicador de digitação (typing indicator)
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.id = "chat-typing-indicator";
  typingIndicator.innerHTML = "<span></span><span></span><span></span>";
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    // 3. Enviar requisição POST para o backend
    const response = await fetch("https://assetpulse-lh3s.onrender.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mensagem: texto, usuario_id: usuarioId }),
    });
    
    // Remove o indicador de digitação
    const tempIndicator = document.getElementById("chat-typing-indicator");
    if (tempIndicator) tempIndicator.remove();
    
    if (!response.ok) {
      throw new Error("Erro na comunicação com o servidor.");
    }
    
    const dados = await response.json();
    
    // 4. Injetar a resposta da IA
    const botMsgElement = document.createElement("div");
    botMsgElement.className = "msg-bot";
    botMsgElement.innerText = dados.resposta || "Desculpe, não entendi.";
    messagesContainer.appendChild(botMsgElement);
    
  } catch (error) {
    // Remove o indicador de digitação se ele ainda estiver lá
    const tempIndicator = document.getElementById("chat-typing-indicator");
    if (tempIndicator) tempIndicator.remove();
    
    // Injeta mensagem de erro
    const errorMsgElement = document.createElement("div");
    errorMsgElement.className = "msg-bot";
    errorMsgElement.style.color = "#ff4757";
    errorMsgElement.innerText = "❌ Ops! Não consegui me conectar ao servidor. Verifique se o backend está ativo.";
    messagesContainer.appendChild(errorMsgElement);
    console.error("Erro no chat:", error);
  }
  
  // Rola para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}