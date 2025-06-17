let perfis = JSON.parse(localStorage.getItem('perfisFilhos')) || [];
let atividades = JSON.parse(localStorage.getItem('atividadesFilhos')) || [];
let perfilSelecionado = null;

// Botão logout - listener
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('mamãe_login');
    window.location.href = '../login/index.html';
  });
}

const listaPerfisEl = document.getElementById('listaPerfis');
const perfilDetalhadoEl = document.getElementById('perfilDetalhado');
const nomeFilhoDetalhadoEl = document.getElementById('nomeFilhoDetalhado');
const nascimentoFilhoEl = document.getElementById('nascimentoFilho');
const pesoFilhoEl = document.getElementById('pesoFilho');
const alturaFilhoEl = document.getElementById('alturaFilho');
const alergiasFilhoEl = document.getElementById('alergiasFilho');
const vacinasFilhoEl = document.getElementById('vacinasFilho');
const anotacoesFilhoEl = document.getElementById('anotacoesFilho');
const fotosFilhoEl = document.getElementById('fotosFilho');
const listaAtividadesEl = document.getElementById('listaAtividades');
const filtroDataAtividadeEl = document.getElementById('filtroDataAtividade');
const calendarioAtividadesEl = document.getElementById('calendarioAtividades');

const perfilModal = new bootstrap.Modal(document.getElementById('perfilModal'));
const atividadeModal = new bootstrap.Modal(document.getElementById('atividadeModal'));
const confirmExcluirModal = new bootstrap.Modal(document.getElementById('confirmExcluirModal'));

// Form elementos perfil
const formPerfil = document.getElementById('formPerfil');
const modalTituloPerfil = document.getElementById('modalTituloPerfil');
const perfilIdInput = document.getElementById('perfilId');
const nomeFilhoInput = document.getElementById('nomeFilho');
const nascimentoFilhoInput = document.getElementById('nascimentoFilhoInput');
const pesoFilhoInput = document.getElementById('pesoFilhoInput');
const alturaFilhoInput = document.getElementById('alturaFilhoInput');
const alergiasFilhoInput = document.getElementById('alergiasFilhoInput');
const vacinasFilhoInput = document.getElementById('vacinasFilhoInput');
const anotacoesFilhoInput = document.getElementById('anotacoesFilhoInput');
const fotosFilhoInput = document.getElementById('fotosFilhoInput');
const previewFotos = document.getElementById('previewFotos');

// Form atividade
const formAtividade = document.getElementById('formAtividade');
const atividadePerfilId = document.getElementById('atividadePerfilId');
const dataAtividade = document.getElementById('dataAtividade');
const tipoAtividade = document.getElementById('tipoAtividade');
const descricaoAtividade = document.getElementById('descricaoAtividade');

const btnConfirmarExcluir = document.getElementById('btnConfirmarExcluir');

let grafico = null;

// --- Funções --- //

function salvarPerfis() {
  localStorage.setItem('perfisFilhos', JSON.stringify(perfis));
}

function salvarAtividades() {
  localStorage.setItem('atividadesFilhos', JSON.stringify(atividades));
}

function renderizarPerfis() {
  listaPerfisEl.innerHTML = '';

  if (perfis.length === 0) {
    listaPerfisEl.innerHTML = '<p>Nenhum filho cadastrado.</p>';
    perfilDetalhadoEl.style.display = 'none';
    return;
  }

  perfis.forEach((perfil, idx) => {
    const div = document.createElement('div');
    div.className = 'col-md-3 cursor-pointer';

    let fotosHtml = '';
    if (perfil.fotos && perfil.fotos.length) {
      fotosHtml = `<img src="${perfil.fotos[0]}" class="profile-photo" alt="Foto de ${perfil.nome}" />`;
    } else {
      fotosHtml = `<div class="profile-photo d-flex justify-content-center align-items-center bg-secondary text-white" style="height:100px;">Sem foto</div>`;
    }

    div.innerHTML = `
      <div class="card" onclick="mostrarPerfil(${idx})" role="button" tabindex="0" aria-pressed="false">
        ${fotosHtml}
        <div class="card-body p-2">
          <h5 class="card-title">${perfil.nome}</h5>
          <p class="card-text small">Nascimento: ${perfil.nascimento}</p>
        </div>
      </div>
    `;
    listaPerfisEl.appendChild(div);
  });
}

function mostrarPerfil(idx) {
  perfilSelecionado = perfis[idx];
  perfilDetalhadoEl.style.display = 'block';

  nomeFilhoDetalhadoEl.textContent = perfilSelecionado.nome;
  nascimentoFilhoEl.textContent = perfilSelecionado.nascimento;
  pesoFilhoEl.textContent = perfilSelecionado.peso;
  alturaFilhoEl.textContent = perfilSelecionado.altura;
  alergiasFilhoEl.textContent = perfilSelecionado.alergias || 'Nenhuma';
  vacinasFilhoEl.textContent = perfilSelecionado.vacinas || 'Nenhuma';
  anotacoesFilhoEl.textContent = perfilSelecionado.anotacoes || 'Nenhuma';

  fotosFilhoEl.innerHTML = '';
  if (perfilSelecionado.fotos && perfilSelecionado.fotos.length) {
    perfilSelecionado.fotos.forEach(foto => {
      const img = document.createElement('img');
      img.src = foto;
      img.className = 'profile-photo';
      img.alt = `Foto de ${perfilSelecionado.nome}`;
      fotosFilhoEl.appendChild(img);
    });
  }

  renderizarAtividades();
  montarCalendario();
  gerarGraficoCrescimento(); // <-- Aqui o gráfico é gerado
}


function abrirModalAtividade() {
  if (!perfilSelecionado) {
    alert("Selecione um perfil primeiro.");
    return;
  }
  atividadePerfilId.value = perfilSelecionado.id;
  formAtividade.reset();
  dataAtividade.value = new Date().toISOString().slice(0, 10); // Data atual
  atividadeModal.show();
}

// Função para abrir modal de confirmação de exclusão
function abrirModalExcluir() {
  if (!perfilSelecionado) {
    alert('Selecione um perfil antes de tentar excluir.');
    return;
  }
  confirmExcluirModal.show();
}

// Listener do botão confirmar exclusão
btnConfirmarExcluir.addEventListener('click', () => {
  excluirPerfil();
  confirmExcluirModal.hide();
});

// Função de exclusão do perfil
function excluirPerfil() {
  if (!perfilSelecionado) return;

  // Remove o perfil do array
  perfis = perfis.filter(p => p.id !== perfilSelecionado.id);

  // Remove atividades relacionadas a esse perfil
  atividades = atividades.filter(a => a.perfilId !== perfilSelecionado.id);

  salvarPerfis();
  salvarAtividades();

  perfilSelecionado = null;
  perfilDetalhadoEl.style.display = 'none';

  renderizarPerfis();
  listaAtividadesEl.innerHTML = '';
  calendarioAtividadesEl.innerHTML = '';
}

function abrirModalCriar() {
  modalTituloPerfil.textContent = 'Novo Filho';
  formPerfil.reset();
  perfilIdInput.value = '';
  previewFotos.innerHTML = '';
  perfilModal.show();
}

function abrirModalEditar() {
  if (!perfilSelecionado) {
    alert('Selecione um perfil para editar.');
    return;
  }

  modalTituloPerfil.textContent = 'Editar Filho';
  perfilIdInput.value = perfilSelecionado.id;
  nomeFilhoInput.value = perfilSelecionado.nome;
  nascimentoFilhoInput.value = perfilSelecionado.nascimento;
  pesoFilhoInput.value = perfilSelecionado.peso;
  alturaFilhoInput.value = perfilSelecionado.altura;
  alergiasFilhoInput.value = perfilSelecionado.alergias || '';
  vacinasFilhoInput.value = perfilSelecionado.vacinas || '';
  anotacoesFilhoInput.value = perfilSelecionado.anotacoes || '';
  previewFotos.innerHTML = '';

  if (perfilSelecionado.fotos && perfilSelecionado.fotos.length) {
    perfilSelecionado.fotos.forEach(foto => {
      const img = document.createElement('img');
      img.src = foto;
      img.className = 'profile-photo';
      previewFotos.appendChild(img);
    });
  }
  perfilModal.show();
}

formPerfil.addEventListener('submit', (e) => {
  e.preventDefault();

  let id = perfilIdInput.value;
  if (!id) {
    id = Date.now().toString();
  }

  // Clona as fotos do perfil selecionado, se existir
  const fotosArray = perfilSelecionado && perfilSelecionado.fotos ? [...perfilSelecionado.fotos] : [];

  // Função que salva os perfis e atualiza a UI
  function salvarEAtualizarPerfis() {
    const index = perfis.findIndex(p => p.id === id);

    const perfilAtualizado = {
      id,
      nome: nomeFilhoInput.value.trim(),
      nascimento: nascimentoFilhoInput.value,
      peso: parseFloat(pesoFilhoInput.value),
      altura: parseFloat(alturaFilhoInput.value),
      alergias: alergiasFilhoInput.value.trim(),
      vacinas: vacinasFilhoInput.value.trim(),
      anotacoes: anotacoesFilhoInput.value.trim(),
      fotos: fotosArray
    };

    if (index > -1) {
      perfis[index] = perfilAtualizado;
    } else {
      perfis.push(perfilAtualizado);
    }

    salvarPerfis();
    renderizarPerfis();
    mostrarPerfil(perfis.findIndex(p => p.id === id));
    perfilModal.hide();
  }

  // Verifica se há novas fotos no input e converte para base64
  const files = fotosFilhoInput.files;
  if (files.length > 0) {
    const readers = [];
    for (let i = 0; i < files.length; i++) {
      readers.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(files[i]);
      }));
    }
    Promise.all(readers).then(results => {
      fotosArray.length = 0;
      results.forEach(r => fotosArray.push(r));
      salvarEAtualizarPerfis();
    });
  } else {
    salvarEAtualizarPerfis();
  }
});

function renderizarAtividades() {
  listaAtividadesEl.innerHTML = '';
  if (!perfilSelecionado) return;

  let dataFiltro = filtroDataAtividadeEl.value;

  let atividadesFiltradas = atividades.filter(a => a.perfilId === perfilSelecionado.id);
  if (dataFiltro) {
    atividadesFiltradas = atividadesFiltradas.filter(a => a.data === dataFiltro);
  }

  // Adicione esta linha aqui
  atividadesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));

  if (atividadesFiltradas.length === 0) {
    listaAtividadesEl.innerHTML = '<p>Nenhuma atividade encontrada.</p>';
    return;
  }

  atividadesFiltradas.forEach(atividade => {
    const div = document.createElement('div');
    div.className = 'atividade-card mb-2 p-2 border rounded d-flex justify-content-between align-items-start';

    div.innerHTML = `
      <div>
        <div><strong>Data:</strong> ${atividade.data}</div>
        <div><strong>Tipo:</strong> ${atividade.tipo}</div>
        <div><strong>Descrição:</strong> ${atividade.descricao}</div>
      </div>
      <button class="btn btn-sm btn-danger btnExcluirAtividade" aria-label="Excluir atividade ${atividade.tipo} em ${atividade.data}" data-id="${atividade.id}">Excluir</button>
    `;

    listaAtividadesEl.appendChild(div);
  });

  // Adiciona evento nos botões Excluir depois de criar todos
  document.querySelectorAll('.btnExcluirAtividade').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      excluirAtividade(id);
    });
  });
}

function excluirAtividade(id) {
  // Remove do array
  atividades = atividades.filter(a => a.id !== id);

  // Salva no localStorage
  salvarAtividades();

  // Atualiza a lista e calendário
  renderizarAtividades();
  montarCalendario();
}


filtroDataAtividadeEl.addEventListener('change', () => {
  renderizarAtividades();
});

formAtividade.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!perfilSelecionado) {
    alert('Selecione um perfil para adicionar uma atividade.');
    return;
  }

  const novaAtividade = {
    id: Date.now().toString(),
    perfilId: atividadePerfilId.value,
    data: dataAtividade.value,
    tipo: tipoAtividade.value.trim(),
    descricao: descricaoAtividade.value.trim()
  };

  atividades.push(novaAtividade);
  salvarAtividades();
  renderizarAtividades();
  montarCalendario();
  atividadeModal.hide();
  formAtividade.reset();
});

// Função para montar calendário simples com marcação das atividades
function montarCalendario() {
  calendarioAtividadesEl.innerHTML = '';

  if (!perfilSelecionado) return;

  // Pegando só as datas das atividades do perfil
  const datasAtividades = atividades
    .filter(a => a.perfilId === perfilSelecionado.id)
    .map(a => a.data);

  // Lista as datas únicas
  const datasUnicas = [...new Set(datasAtividades)].sort();

  if (datasUnicas.length === 0) {
    calendarioAtividadesEl.innerHTML = '<p>Sem atividades cadastradas para este perfil.</p>';
    return;
  }

  datasUnicas.forEach(dataStr => {
    const div = document.createElement('div');
    div.className = 'calendar-day p-2 border mb-1 rounded';
    div.textContent = dataStr;
    calendarioAtividadesEl.appendChild(div);
  });
}


function gerarGraficoCrescimento() {
  const ctx = document.getElementById('graficoCrescimento').getContext('2d');

  if (grafico) {
    grafico.destroy();
  }

  const atividadesFiltradas = atividades
    .filter(a => a.perfilId === perfilSelecionado.id && (a.peso || a.altura))
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  const dataNascimento = new Date(perfilSelecionado.nascimento);

  const labels = [];
  const pesos = [];
  const alturas = [];

  // 1. Começa com o nascimento — peso e altura como null (ou um valor padrão de recém-nascido)
  labels.push(dataNascimento.toISOString().split('T')[0]);
  pesos.push(null);  // ou 3.5, se quiser aproximar o peso ao nascer
  alturas.push(null); // ou um valor aproximado, tipo 50cm

  // 2. Dados das atividades (peso e altura)
  atividadesFiltradas.forEach(a => {
    labels.push(new Date(a.data).toISOString().split('T')[0]);
    pesos.push(a.peso ? parseFloat(a.peso) : null);
    alturas.push(a.altura ? parseFloat(a.altura) : null);
  });

  // 3. Dia atual: mostrar peso e altura atuais do perfil para fechar gráfico
  const hoje = new Date().toISOString().split('T')[0];
  labels.push(hoje);
  pesos.push(perfilSelecionado.peso || null);
  alturas.push(perfilSelecionado.altura || null);

  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Peso (kg)',
          data: pesos,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'yPeso',
          spanGaps: true,
          tension: 0.2,
          fill: false,
          pointRadius: 3,
        },
        {
          label: 'Altura (cm)',
          data: alturas,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'yAltura',
          spanGaps: true,
          tension: 0.2,
          fill: false,
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
            tooltipFormat: 'dd/MM/yyyy',
            displayFormats: {
              month: 'MMM yyyy'
            }
          },
          title: {
            display: true,
            text: 'Data'
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        yPeso: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Peso (kg)'
          },
          beginAtZero: true,
          min: 0
        },
        yAltura: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Altura (cm)'
          },
          beginAtZero: false,
          grid: {
            drawOnChartArea: false,
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      }
    }
  });


  // Filtra as atividades do perfil e ordena por data
  const dados = atividades
    .filter(a => a.perfilId === perfilSelecionado.id && a.tipo === 'medicao')
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map(a => ({
      data: a.data,
      peso: parseFloat(a.descricao?.peso) || null,
      altura: parseFloat(a.descricao?.altura) || null
    }));

  if (dados.length === 0) return;

  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dados.map(d => d.data),
      datasets: [
        {
          label: 'Peso (kg)',
          data: dados.map(d => d.peso),
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Altura (cm)',
          data: dados.map(d => d.altura),
          borderColor: 'green',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


// Ao carregar a página
renderizarPerfis();

