let models=[];
const groupSelect=document.querySelector('#modelGroup');
const sideField=document.querySelector('#sideField');
const sideSelect=document.querySelector('#side');
const typeField=document.querySelector('#typeField');
const typeSelect=document.querySelector('#type');
const fenceField=document.querySelector('#fenceField');
const fenceSelect=document.querySelector('#fence');
const catalog=document.querySelector('#catalog');
const resultTitle=document.querySelector('#resultTitle');
const resultCount=document.querySelector('#resultCount');
const clearButton=document.querySelector('#clearFilters');

function updateSteps(){
  sideField.hidden=true;
  typeField.hidden=true;
  fenceField.hidden=true;

  if(!groupSelect.value || groupSelect.value==='sem-esteiras'){
    render();
    return;
  }

  sideField.hidden=false;
  if(sideSelect.value) typeField.hidden=false;
  if(sideSelect.value && typeSelect.value) fenceField.hidden=false;
  render();
}

function filteredModels(){
  const group=groupSelect.value;
  const side=sideSelect.value;
  const type=typeSelect.value;
  const fence=fenceSelect.value;

  if(!group) return [];

  return models.filter(model=>{
    if(model.group!==group) return false;
    if(group==='sem-esteiras') return true;
    if(!side || !type || !fence) return false;
    if(model.type!==type || model.fence!==fence) return false;

    // Para esteira reta padrão e viradora, o mesmo modelo atende os dois lados.
    if(group==='esteira-reta' && type!=='convertedora') return true;
    return model.side===side;
  });
}

function groupLabel(group){
  return {
    'sem-esteiras':'Sem esteiras',
    'esteira-90':'Esteira 90º',
    'esteira-reta':'Esteira reta'
  }[group] || group;
}

function card(model){
  const preview=model.available
    ? `<model-viewer class="card-model" src="modelos/${model.file}" camera-controls auto-rotate rotation-per-second="10deg" interaction-prompt="none" shadow-intensity=".8" loading="lazy" disable-zoom></model-viewer>`
    : `<div class="preview-placeholder"><span>3D</span></div>`;

  return `<article class="card ${model.available?'':'unavailable'}">
    <div class="visual">
      <span class="number">${model.number}</span>
      ${preview}
      ${model.available?'':'<span class="coming-soon">Em breve</span>'}
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

function render(){
  if(!groupSelect.value){
    resultTitle.textContent='Selecione uma categoria';
    resultCount.textContent='';
    catalog.innerHTML='<div class="empty-state">Escolha o modelo de visualização para começar.</div>';
    return;
  }

  const incomplete=groupSelect.value!=='sem-esteiras' &&
    (!sideSelect.value || !typeSelect.value || !fenceSelect.value);

  if(incomplete){
    resultTitle.textContent='Complete as opções';
    resultCount.textContent='';
    catalog.innerHTML='<div class="empty-state">Preencha a próxima opção para continuar.</div>';
    return;
  }

  const items=filteredModels();
  resultTitle.textContent=groupSelect.value==='sem-esteiras'
    ? 'Modelos sem esteira'
    : 'Modelo encontrado';
  resultCount.textContent=`${items.length} ${items.length===1?'modelo':'modelos'}`;
  catalog.innerHTML=items.map(card).join('');
}

groupSelect.addEventListener('change',()=>{
  sideSelect.value='';
  typeSelect.value='';
  fenceSelect.value='';
  updateSteps();
});

sideSelect.addEventListener('change',()=>{
  typeSelect.value='';
  fenceSelect.value='';
  updateSteps();
});

typeSelect.addEventListener('change',()=>{
  fenceSelect.value='';
  updateSteps();
});

fenceSelect.addEventListener('change',render);

clearButton.addEventListener('click',()=>{
  groupSelect.value='';
  sideSelect.value='';
  typeSelect.value='';
  fenceSelect.value='';
  updateSteps();
});

fetch('modelos.json')
  .then(response=>response.json())
  .then(data=>{models=data;render()});
