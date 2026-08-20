(() => {
  const LOGO_URL='hubgeo-logo.png';
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
  const TOP_REMOVE=new Set(['SUCS PREDOMINANTE','AASHTO PREDOMINANTE','CBR MEDIO','CBR MIN./MAX.','AMOSTRAS','OBRA(S)','FONTE(S)']);

  function addBranding(){
    const loginMark=document.querySelector('.brand .logo');
    if(loginMark){const img=document.createElement('img');img.src=LOGO_URL;img.alt='HUBGEO Estudos e Projectos';img.className='company-logo login-company-logo';loginMark.replaceWith(img)}
    const topMark=document.querySelector('.topb .tlogo');
    if(topMark){const img=document.createElement('img');img.src=LOGO_URL;img.alt='HUBGEO Estudos e Projectos';img.className='company-logo top-company-logo';topMark.replaceWith(img)}
    const modalCard=document.querySelector('.modalcard');
    if(modalCard&&!modalCard.querySelector('.print-brand')){
      const printBrand=document.createElement('div');printBrand.className='print-brand';
      printBrand.innerHTML=`<img src="${LOGO_URL}" alt="HUBGEO Estudos e Projectos"><div><strong>HUBGEO · Mapa Geotécnico de Angola</strong><span>Relatório de consulta de dados geotécnicos</span></div>`;
      modalCard.prepend(printBrand);
    }
  }

  function cleanDetails(){
    const body=document.getElementById('mbody');if(!body)return;
    const topGrid=body.querySelector('.grid');
    if(topGrid){topGrid.classList.add('hubgeo-clean-grid');[...topGrid.children].forEach(card=>{const label=norm(card.querySelector('span')?.textContent);if(TOP_REMOVE.has(label))card.classList.add('hubgeo-remove');else if(label==='IDENTIFICACAO')card.classList.add('hubgeo-screen-remove')})}
    body.querySelectorAll('.sample .sgrid .kv').forEach(card=>{const label=norm(card.querySelector('span')?.textContent);if(label==='FONTE'||label==='OBRA')card.classList.add('hubgeo-remove')});
  }

  function addStyles(){
    const style=document.createElement('style');style.id='hubgeo-branding-static-style';
    style.textContent=`.company-logo{object-fit:contain;display:block;background:#fff}.login-company-logo{width:150px;height:84px;flex:0 0 150px}.top-company-logo{width:118px;height:52px;flex:0 0 118px}.print-brand{display:none}.results .list{display:none!important}.hubgeo-remove{display:none!important}.hubgeo-screen-remove{display:none!important}.hubgeo-clean-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.hubgeo-province-badge{display:none!important}@media(max-width:820px){.top-company-logo{width:88px;height:42px;flex-basis:88px}.top strong{font-size:12px}.top small{font-size:10px}}@media(max-width:620px){.hubgeo-clean-grid{grid-template-columns:1fr!important}}@media print{.hubgeo-screen-remove{display:block!important}.hubgeo-clean-grid,.sgrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.print-brand{display:flex;align-items:center;gap:18px;padding:0 0 14px;margin:0 18px 14px;border-bottom:2px solid #0b2d4a}.print-brand img{width:180px;height:100px;object-fit:contain}.print-brand strong{display:block;color:#0b2d4a;font-size:16px}.print-brand span{display:block;margin-top:4px;color:#6d7f8c;font-size:11px}.mhead{position:static}}`;
    document.head.appendChild(style);
  }

  function install(){
    addStyles();addBranding();
    const body=document.getElementById('mbody');
    if(body){new MutationObserver(cleanDetails).observe(body,{childList:true,subtree:true});cleanDetails()}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();