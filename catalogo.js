let models = [];

const group = document.querySelector('#modelGroup');
const side = document.querySelector('#side');
const type = document.querySelector('#type');
const fence = document.querySelector('#fence');
const sideField = document.querySelector('#sideField');
const typeField = document.querySelector('#typeField');
const fenceField = document.querySelector('#fenceField');
const catalog = document.querySelector('#catalog');
const title = document.querySelector('#resultTitle');
const count = document.querySelector('#resultCount');
const clear = document.querySelector('#clearFilters');

let previewObserver;

function hideAllDependentFields() {
  sideField.hidden = true;
  typeField.hidden = true;
  fenceField.hidden = true;
}

function resetDependentValues() {
  side.value = '';
  type.value = '';
  fence.value = '';
}

function updateVisibleFields() {
  hideAllDependentFields();

  if (group.value === 'esteira-90') {
    sideField.hidden = false;
    if (side.value) typeField.hidden = false;
    if (side.value && type.value) fenceField.hidden = false;
  }

  if (group.value === 'esteira-reta') {
    typeField.hidden = false;
    if (type.value) fenceField.hidden = false;
  }

  render();
}

function modelMatches(model) {
  if (group.value === 'todos') return true;
  if (model.group !== group.value) return false;
  if (group.value === 'sem-esteiras') return true;

  if (group.value === 'esteira-90') {
    return model.side === side.value &&
           model.type === type.value &&
           model.fence === fence.value;
  }

  if (group.value === 'esteira-reta') {
    return model.type === type.value &&
           model.fence === fence.value;
  }

  return false;
}

function groupLabel(value) {
  return {
    'sem-esteiras': 'Sem esteiras',
    'esteira-90': 'Esteira 90º',
    'esteira-reta': 'Esteira reta'
  }[value] || value;
}

function previewMarkup(model) {
  if (!model.available) {
    return '<div class="preview-placeholder"><span>3D</span></div>';
  }

  return `<div class="lazy-model"
      data-src="modelos/${model.file}"
      data-label="${model.name.replaceAll('"', '&quot;')}">
      <div class="preview-loading">
        <span class="preview-spinner"></span>
        <small>Carregando prévia</small>
      </div>
    </div>`;
}

function modelCard(model) {
  return `<article class="card ${model.available ? '' : 'unavailable'}">
    <div class="visual">
      <span class="number">${model.number}</span>
      ${previewMarkup(model)}
      ${model.available ? '' : '<span class="coming-soon">Em breve</span>'}
    </div>
    <div class="body">
      <span class="pill">${groupLabel(model.group)}</span>
      <h3>${model.name}</h3>
      ${model.available
        ? `<a class="primary" href="visualizador.html?modelo=${encodeURIComponent(model.id)}">Visualizar modelo</a>`
        : '<button class="disabled-button" disabled>Modelo ainda não disponível</button>'}
    </div>
  </article>`;
}

function setupLazyPreviews() {
  if (previewObserver) previewObserver.disconnect();

  previewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const holder = entry.target;
      const src = holder.dataset.src;
      const label = holder.dataset.label;

      const viewer = document.createElement('model-viewer');
      viewer.className = 'card-model';
      viewer.setAttribute('src', src);
      viewer.setAttribute('alt', label);
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('auto-rotate', '');
      viewer.setAttribute('rotation-per-second', '8deg');
      viewer.setAttribute('interaction-prompt', 'none');
      viewer.setAttribute('shadow-intensity', '.8');
      viewer.setAttribute('loading', 'lazy');
      viewer.setAttribute('disable-zoom', '');
      viewer.addEventListener('load', () => holder.classList.add('loaded'));

      holder.appendChild(viewer);
      previewObserver.unobserve(holder);
    });
  }, {
    rootMargin: '180px 0px',
    threshold: 0.01
  });

  document.querySelectorAll('.lazy-model').forEach(element => {
    previewObserver.observe(element);
  });
}

function render() {
  if (!group.value) {
    title.textContent = 'Selecione uma categoria';
    count.textContent = '';
    catalog.innerHTML = '<div class="empty-state">Escolha o modelo de visualização para começar.</div>';
    return;
  }

  const incomplete90 =
    group.value === 'esteira-90' &&
    (!side.value || !type.value || !fence.value);

  const incompleteStraight =
    group.value === 'esteira-reta' &&
    (!type.value || !fence.value);

  if (incomplete90 || incompleteStraight) {
    title.textContent = 'Complete as opções';
    count.textContent = '';
    catalog.innerHTML = '<div class="empty-state">Preencha o próximo campo para continuar.</div>';
    return;
  }

  const filteredModels = models.filter(modelMatches);

  if (group.value === 'todos') title.textContent = 'Todos os modelos';
  else if (group.value === 'sem-esteiras') title.textContent = 'Modelos sem esteira';
  else title.textContent = filteredModels.length === 1 ? 'Modelo encontrado' : 'Modelos encontrados';

  count.textContent =
    `${filteredModels.length} ${filteredModels.length === 1 ? 'modelo' : 'modelos'}`;

  catalog.innerHTML = filteredModels.map(modelCard).join('');
  setupLazyPreviews();
}

group.addEventListener('change', () => {
  resetDependentValues();
  updateVisibleFields();
});

side.addEventListener('change', () => {
  type.value = '';
  fence.value = '';
  updateVisibleFields();
});

type.addEventListener('change', () => {
  fence.value = '';
  updateVisibleFields();
});

fence.addEventListener('change', render);

clear.addEventListener('click', () => {
  group.value = '';
  resetDependentValues();
  updateVisibleFields();
});

fetch('modelos.json')
  .then(response => response.json())
  .then(data => {
    models = data;
    updateVisibleFields();
  })
  .catch(() => {
    catalog.innerHTML = '<div class="empty-state">Não foi possível carregar o catálogo.</div>';
  });