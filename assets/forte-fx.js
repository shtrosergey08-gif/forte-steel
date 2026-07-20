/* FORTE STEEL · FX — лёгкая версия (без постоянного rAF/WebGL, чтобы скролл не лагал) */
(function(){
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- WORD-BY-WORD REVEAL заголовков (дёшево: только CSS-transition, без rAF-цикла) ---- */
  function wordReveal(el, base, stagger, dur, dy){
    if(el.dataset.wr) return; el.dataset.wr='1';
    var words = el.textContent.trim().split(/\s+/);
    el.textContent='';
    words.forEach(function(w,i){
      var sp=document.createElement('span');
      sp.textContent=w;
      sp.style.cssText='display:inline-block;opacity:0;transform:translateY('+dy+'px);'
        +'transition:opacity '+dur+'ms cubic-bezier(.16,1,.3,1),transform '+dur+'ms cubic-bezier(.16,1,.3,1);'
        +'transition-delay:'+(base+i*stagger)+'ms';
      el.appendChild(sp);
      el.appendChild(document.createTextNode(' '));
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        sp.style.opacity='1'; sp.style.transform='none';
      });});
    });
  }
  function runReveals(){
    document.querySelectorAll('.dp-hero h1').forEach(function(el){ wordReveal(el,120,80,720,26); });
    document.querySelectorAll('.dp-hero .dp-sub').forEach(function(el){ wordReveal(el,760,20,600,14); });
  }
  if (!RM){
    if (document.getElementById('ft-pre')) document.addEventListener('ft:ready', runReveals, {once:true});
    else runReveals();
    setTimeout(runReveals, 4200); // страховка
  }

  /* ---- МАГНИТНЫЕ КНОПКИ (дёшево: срабатывает только при наведении на конкретную кнопку) ---- */
  if (!RM && matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.btn-accent, .ft-btn.p, [data-magnetic]').forEach(function(el){
      el.style.transition='transform .25s cubic-bezier(.16,1,.3,1)';
      el.addEventListener('mousemove', function(e){
        var r=el.getBoundingClientRect();
        el.style.transform='translate('+(e.clientX-r.left-r.width/2)*0.22+'px,'+(e.clientY-r.top-r.height/2)*0.32+'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform=''; });
    });
  }

  /* год в футере */
  var y=document.getElementById('ft-year'); if(y) y.textContent=new Date().getFullYear();
})();
