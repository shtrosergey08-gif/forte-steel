/* FORTE STEEL · FX 2026 — living brushed-steel shader + smooth scroll + magnetic buttons
   Вдохновлено cinematic-подходом Textura, но собственная реализация под метал/навесы. */
(function(){
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ============ 0. WORD-BY-WORD REVEAL заголовков (приём Textura/getlayers) ============ */
  function wordReveal(el, base, stagger, dur, dy){
    if(el.dataset.wr) return; el.dataset.wr='1';
    var words = el.textContent.trim().split(/\s+/);
    el.textContent='';
    words.forEach(function(w,i){
      var sp=document.createElement('span');
      sp.textContent=w;
      sp.style.cssText='display:inline-block;will-change:transform,opacity;opacity:0;'
        +'transform:translateY('+dy+'px);'
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

  /* ============ 1. LENIS SMOOTH SCROLL (инерционный, «дорогой») ============ */
  if (!RM){
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/lenis@1.1.14/dist/lenis.min.js';
    s.onload = function(){
      try{
        var lenis = new Lenis({ duration:1.1, easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));}, smoothWheel:true });
        function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        // якорные ссылки — плавно
        document.querySelectorAll('a[href^="#"]').forEach(function(a){
          a.addEventListener('click', function(e){
            var id=a.getAttribute('href'); if(id.length>1){ var el=document.querySelector(id);
              if(el){ e.preventDefault(); lenis.scrollTo(el, {offset:-70}); } }
          });
        });
        window.__lenis = lenis;
      }catch(e){}
    };
    document.head.appendChild(s);
  }

  /* ============ 2. МАГНИТНЫЕ КНОПКИ ============ */
  if (!RM && matchMedia('(pointer:fine)').matches){
    var mags = document.querySelectorAll('.btn-accent, .ft-btn.p, [data-magnetic]');
    mags.forEach(function(el){
      el.style.transition='transform .25s cubic-bezier(.16,1,.3,1)';
      el.addEventListener('mousemove', function(e){
        var r=el.getBoundingClientRect();
        var x=(e.clientX-r.left-r.width/2), y=(e.clientY-r.top-r.height/2);
        el.style.transform='translate('+x*0.28+'px,'+y*0.4+'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform=''; });
    });
  }

  /* ============ 3. ЖИВОЙ ШЕЙДЕР «ЖИДКИЙ ГРАФИТ + БРОНЗА» ============ */
  if (RM) return;
  var targets = [];
  var homeHero = document.querySelector('.hero');
  if (homeHero) targets.push(homeHero);
  document.querySelectorAll('.dp-hero').forEach(function(h){ targets.push(h); });
  targets.forEach(initMetal);

  function initMetal(host){
    var cv = document.createElement('canvas');
    cv.className='fx-metal';
    host.insertBefore(cv, host.firstChild);
    var gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
    if(!gl){ cv.remove(); return; }

    var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs=[
    'precision highp float;',
    'uniform vec2 R;uniform float T;uniform vec2 M;',
    'float h(vec2 n){return fract(sin(dot(n,vec2(12.9898,78.233)))*43758.5453);}',
    'float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' float a=h(i),b=h(i+vec2(1,0)),c=h(i+vec2(0,1)),d=h(i+vec2(1,1));',
    ' return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*nz(p);p*=2.03;a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/R.xy;',
    ' vec2 asp=vec2(R.x/R.y,1.);',
    ' float t=T*.05;',
    // текстура шлифованного металла: вытянутый по X fbm + течение
    ' vec2 q=vec2(uv.x*3.0, uv.y*7.0);',
    ' float flow=fbm(q+vec2(t*1.4,t*.3));',
    ' float brush=fbm(vec2(uv.x*2.0+flow*.6, uv.y*40.0));', // горизонтальные штрихи
    ' float metal=mix(flow,brush,.35);',
    // мышь — мягкий блик
    ' float md=distance(uv*asp,M*asp);',
    ' float glow=smoothstep(.45,.0,md)*.6;',
    ' metal+=glow*.5;',
    // палитра: графит -> светлый металл -> бронза на гребнях
    ' vec3 graphite=vec3(.075,.082,.094);',
    ' vec3 steel=vec3(.22,.24,.27);',
    ' vec3 bronze=vec3(.76,.56,.42);',
    ' vec3 col=mix(graphite,steel,smoothstep(.35,.75,metal));',
    ' col=mix(col,bronze,smoothstep(.72,.95,metal)*.7);',
    ' col+=bronze*glow*.35;',
    // виньетка
    ' float vig=smoothstep(1.15,.35,distance(uv,vec2(.5)));',
    ' col*=mix(.7,1.05,vig);',
    ' gl_FragColor=vec4(col,1.);',
    '}'].join('\n');

    function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
    var prog=gl.createProgram();
    gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
    gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ cv.remove(); return; }
    gl.useProgram(prog);
    var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    var pl=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
    var uR=gl.getUniformLocation(prog,'R'),uT=gl.getUniformLocation(prog,'T'),uM=gl.getUniformLocation(prog,'M');
    var mx=.5,my=.55,tmx=.5,tmy=.55, dpr=Math.min(devicePixelRatio||1,1.5), t0=null, raf;
    function size(){var r=host.getBoundingClientRect();cv.width=Math.max(2,r.width*dpr*.7);cv.height=Math.max(2,r.height*dpr*.7);gl.viewport(0,0,cv.width,cv.height);}
    size(); addEventListener('resize',size);
    host.addEventListener('mousemove',function(e){var r=host.getBoundingClientRect();tmx=(e.clientX-r.left)/r.width;tmy=1.-(e.clientY-r.top)/r.height;});
    var vis=true;
    if('IntersectionObserver'in window){ new IntersectionObserver(function(en){vis=en[0].isIntersecting;}).observe(host); }
    function frame(ts){ raf=requestAnimationFrame(frame);
      if(!vis) return;
      if(t0===null)t0=ts; var t=(ts-t0)/1000;
      mx+=(tmx-mx)*.06; my+=(tmy-my)*.06;
      gl.uniform2f(uR,cv.width,cv.height); gl.uniform1f(uT,t); gl.uniform2f(uM,mx,my);
      gl.drawArrays(gl.TRIANGLES,0,6);
    }
    raf=requestAnimationFrame(frame);
  }
})();
