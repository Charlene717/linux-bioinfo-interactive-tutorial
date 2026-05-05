// Common helpers: progress bar, code tabs, accordion, quiz, terminal sim
(function(){
  // Progress bar
  document.addEventListener('DOMContentLoaded',()=>{
    const bar=document.getElementById('progressBar');
    if(bar){
      window.addEventListener('scroll',()=>{
        const h=document.documentElement;
        bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100+'%';
      });
    }
  });

  // Code tab switcher (global)
  window.switchTab=function(b,id){
    const p=b.closest('.code-tabs');
    p.querySelectorAll('.code-tab-btn').forEach(x=>x.classList.remove('active'));
    p.querySelectorAll('.code-tab-content').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const t=document.getElementById(id);
    if(t) t.classList.add('active');
  };

  // Accordion toggle
  window.toggleAcc=function(b){
    b.classList.toggle('open');
    const body=b.nextElementSibling;
    if(body) body.classList.toggle('open');
  };

  // Quiz initialization (auto-runs on DOMContentLoaded)
  function initQuizzes(){
    document.querySelectorAll('.quiz-q').forEach((q,qi)=>{
      const ans=+q.dataset.answer;
      q.querySelectorAll('.quiz-opt').forEach(o=>{
        o.addEventListener('click',()=>{
          if(q.classList.contains('answered')) return;
          q.classList.add('answered');
          const fb=q.querySelector('.quiz-feedback');
          const ok=+o.dataset.idx===ans;
          o.classList.add(ok?'correct':'wrong');
          if(!ok) q.querySelectorAll('.quiz-opt')[ans].classList.add('correct');
          if(fb){
            const L=window.I18n? I18n.get():'zh';
            const txt=q.dataset['explain'+(L==='zh'?'Zh':'En')]||'';
            fb.className='quiz-feedback show '+(ok?'correct-fb':'wrong-fb');
            fb.textContent=(ok?'✅ ':'❌ ')+txt;
          }
        });
      });
    });
  }
  document.addEventListener('DOMContentLoaded',initQuizzes);

  // Terminal simulator
  // Usage: <div class="terminal" data-term-id="t1"></div>  with optional data-prompt, data-task-id
  // Then call TermSim.create('t1', {prompt, validate(cmd){return {ok, out}}, hint, solve})
  const sims={};
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function appendLine(body,html){
    const div=document.createElement('div');
    div.innerHTML=html;
    body.appendChild(div);
    body.scrollTop=body.scrollHeight;
  }
  function buildTerminal(host,opts){
    host.classList.add('terminal');
    const prompt=opts.prompt||'user@bio:~$';
    host.innerHTML='';
    const head=document.createElement('div');
    head.className='terminal-header';
    head.innerHTML='<span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">bash — '+escapeHtml(opts.title||'interactive terminal')+'</span>';
    const body=document.createElement('div');
    body.className='terminal-body';
    if(opts.banner){ appendLine(body,'<span class="dim">'+escapeHtml(opts.banner)+'</span>'); }
    const inputRow=document.createElement('div');
    inputRow.className='terminal-input-row';
    inputRow.innerHTML='<span class="prompt">'+escapeHtml(prompt)+'</span>';
    const input=document.createElement('input');
    input.type='text';
    input.spellcheck=false;
    input.autocomplete='off';
    input.placeholder=opts.placeholder||'type a command and press Enter';
    inputRow.appendChild(input);
    host.appendChild(head);
    host.appendChild(body);
    host.appendChild(inputRow);
    const history=[]; let hIdx=-1;
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        const cmd=input.value.trim();
        if(!cmd) return;
        history.push(cmd); hIdx=history.length;
        appendLine(body,'<span class="prompt">'+escapeHtml(prompt)+'</span> <span class="cmd">'+escapeHtml(cmd)+'</span>');
        const res=opts.validate? opts.validate(cmd) : {ok:false,out:'(no validator)'};
        if(res.out){
          const cls=res.ok?'out':(res.err?'err':'out');
          appendLine(body,'<span class="'+cls+'">'+res.out+'</span>');
        }
        if(res.ok && res.success){
          appendLine(body,'<span class="out" style="color:#86efac;font-weight:700;">'+res.success+'</span>');
        }
        input.value='';
      } else if(e.key==='ArrowUp'){
        if(hIdx>0){ hIdx--; input.value=history[hIdx]; e.preventDefault(); }
      } else if(e.key==='ArrowDown'){
        if(hIdx<history.length-1){ hIdx++; input.value=history[hIdx]; }
        else { hIdx=history.length; input.value=''; }
        e.preventDefault();
      }
    });
    return {body,input,clear:()=>{body.innerHTML=opts.banner?'<div class="dim">'+escapeHtml(opts.banner)+'</div>':'';},runCmd:(cmd)=>{input.value=cmd;input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));}};
  }
  window.TermSim={
    create:function(id,opts){
      const host=document.querySelector('[data-term-id="'+id+'"]');
      if(!host) return null;
      const inst=buildTerminal(host,opts);
      sims[id]={inst,opts};
      // optional toolbar
      if(opts.toolbar){
        const tb=document.createElement('div');
        tb.className='term-toolbar';
        opts.toolbar.forEach(b=>{
          const btn=document.createElement('button');
          btn.className='term-btn'+(b.solve?' solve':'');
          btn.textContent=b.label;
          btn.onclick=()=>{
            if(b.cmd){ inst.input.value=b.cmd; inst.input.focus(); }
            if(b.run){ inst.input.value=b.run; inst.input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'})); }
            if(b.clear){ inst.clear(); }
            if(b.action) b.action(inst);
          };
          tb.appendChild(btn);
        });
        host.parentNode.insertBefore(tb,host.nextSibling);
      }
      return inst;
    },
    get:function(id){return sims[id];}
  };
})();
