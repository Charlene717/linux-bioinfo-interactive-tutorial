(function(){
  const SK='linuxbio_lang';
  let lang=localStorage.getItem(SK)||'zh';

  function apply(l){
    lang=l; localStorage.setItem(SK,l);
    document.documentElement.lang=l==='zh'?'zh-Hant':'en';
    // Show/hide lang-specific blocks
    document.querySelectorAll('[data-lang]').forEach(el=>{
      el.style.display=el.dataset.lang===l?'':'none';
    });
    // Update simple text swaps (text content only)
    document.querySelectorAll('[data-zh][data-en]').forEach(el=>{
      // skip if has child elements inside (avoid clobbering markup)
      if(el.children.length===0){
        el.textContent=el.dataset[l];
      }
    });
    // Toggle button label
    const btn=document.getElementById('langToggle');
    if(btn) btn.textContent=l==='zh'?'EN':'中文';
    // Fire event for charts/sims
    document.dispatchEvent(new CustomEvent('langchange',{detail:{lang:l}}));
  }

  function toggle(){ apply(lang==='zh'?'en':'zh'); }
  function get(){ return lang; }

  document.addEventListener('DOMContentLoaded',()=>{
    const nav=document.querySelector('.top-nav-inner');
    if(nav && !document.getElementById('langToggle')){
      const btn=document.createElement('button');
      btn.id='langToggle'; btn.className='lang-toggle';
      btn.textContent=lang==='zh'?'EN':'中文';
      btn.onclick=toggle; nav.appendChild(btn);
    }
    apply(lang);
  });

  window.I18n={apply,toggle,get};
})();
