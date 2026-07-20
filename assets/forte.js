/* FORTE STEEL · core.js — прелоадер, reveal, защита, курсор */
(function(){
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- ПРЕЛОАДЕР ---------- */
  var pre = document.getElementById('ft-pre');
  if (pre){
    document.documentElement.classList.add('ft-loading');
    var START = Date.now(), MIN = 1600; // минимум времени показа прелоадера
    var p = 0, target = 0, done = false, raf;
    function set(v){ p=v; pre.style.setProperty('--p', v.toFixed(1)); var n=pre.querySelector('.ft-num'); if(n) n.textContent = Math.round(v)+'%'; }
    // плавный подъём к target
    function tick(){
      var ease = (target - p) * 0.08 + 0.25;
      if (p < target) set(Math.min(target, p + ease));
      if (!done || p < 100) raf = requestAnimationFrame(tick);
    }
    // «дыхание» цели до полной загрузки
    var creep = setInterval(function(){ if(target<92) target = Math.min(92, target + Math.random()*9+3); }, 170);
    if (!RM) raf = requestAnimationFrame(tick); else set(100);

    function finish(){
      if (done) return;
      var wait = MIN - (Date.now() - START);
      if (wait > 0){ setTimeout(finish, wait); return; }
      done = true;
      clearInterval(creep); target = 100;
      var t0 = Date.now();
      (function fill(){
        var v = Math.min(100, (Date.now()-t0)/380*100);
        if (RM) v = 100;
        set(Math.max(p, v));
        if (v < 100) requestAnimationFrame(fill); else open();
      })();
    }
    function open(){
      set(100);
      setTimeout(function(){
        pre.classList.add('ft-open');
        document.documentElement.classList.remove('ft-loading');
        setTimeout(function(){ pre.setAttribute('hidden',''); }, RM?200:1150);
      }, 220);
    }
    if (document.readyState === 'complete') setTimeout(finish, 500);
    else window.addEventListener('load', function(){ setTimeout(finish, 350); });
    // страховка
    setTimeout(finish, 6000);

    /* искры сварки на прелоадере */
    var cv = pre.querySelector('canvas.ft-spark');
    if (cv && !RM){
      var cx = cv.getContext('2d'), W, H, dpr=Math.min(devicePixelRatio||1,2), sp=[];
      function rs(){ W=cv.width=innerWidth*dpr; H=cv.height=innerHeight*dpr; }
      rs(); addEventListener('resize', rs);
      function emit(){ var x=W*(.5+(Math.random()-.5)*.12), y=H*.5;
        for(var i=0;i<3;i++) sp.push({x:x,y:y,vx:(Math.random()-.5)*3*dpr,vy:(Math.random()*-2-.5)*dpr,l:1,r:(Math.random()*1.4+.5)*dpr}); }
      var em=setInterval(emit, 120);
      (function l(){ if(pre.hasAttribute('hidden')){clearInterval(em);return;}
        cx.clearRect(0,0,W,H);
        for(var i=sp.length-1;i>=0;i--){var s=sp[i]; s.x+=s.vx; s.y+=s.vy; s.vy+=.06*dpr; s.l-=.03;
          if(s.l<=0){sp.splice(i,1);continue;}
          cx.globalAlpha=s.l; cx.fillStyle='rgba(224,196,140,'+s.l+')';
          cx.beginPath(); cx.arc(s.x,s.y,s.r*s.l,0,6.28); cx.fill(); }
        cx.globalAlpha=1; requestAnimationFrame(l);
      })();
    }
  }

  /* ---------- REVEAL ---------- */
  function initReveal(){
    var els = document.querySelectorAll('.ft-rv');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || RM){ els.forEach(function(e){e.classList.add('in');}); return; }
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -12% 0px', threshold:.12});
    els.forEach(function(e){ io.observe(e); });
    // страховка: показать всё, что осталось скрытым, через 4.5с
    setTimeout(function(){ document.querySelectorAll('.ft-rv:not(.in)').forEach(function(e){ e.classList.add('in'); }); }, 4500);
  }
  if (document.readyState !== 'loading') initReveal();
  else document.addEventListener('DOMContentLoaded', initReveal);

  /* ---------- ЗАЩИТА ИЗОБРАЖЕНИЙ ---------- */
  document.addEventListener('contextmenu', function(e){
    var t = e.target;
    if (t && (t.tagName==='IMG' || t.closest('.vis,.type-card,.config-vis,.dp-bg,.dp-gal,figure'))) e.preventDefault();
  });
  document.addEventListener('dragstart', function(e){
    if (e.target && (e.target.tagName==='IMG' || e.target.closest('.vis,.dp-bg,figure'))) e.preventDefault();
  });

  /* ---------- КУРСОР для внутренних страниц (если нет инлайнового #spark) ---------- */
  if (!document.getElementById('spark') && matchMedia('(pointer:fine)').matches && !RM){
    document.documentElement.classList.add('hascur');
    var dot=document.createElement('div'); dot.className='curdot'; document.body.appendChild(dot);
    // мгновенное следование за курсором (без сглаживания-догона)
    addEventListener('mousemove',function(e){
      dot.style.transform='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)';
    }, {passive:true});
    document.querySelectorAll('a,button,.dp-cross a,.dp-gal figure,summary,input').forEach(function(el){
      el.addEventListener('mouseenter',function(){dot.classList.add('big');});
      el.addEventListener('mouseleave',function(){dot.classList.remove('big');});
    });
  }

  /* ---------- год в футере ---------- */
  var y=document.getElementById('ft-year'); if(y) y.textContent=new Date().getFullYear();
})();
