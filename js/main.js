/* Al Azim — shared behavior */
(function(){
  // language init
  let l='en'; try{l=localStorage.getItem('alazim_lang')||'en'}catch(e){}
  applyLang(l);
  document.querySelectorAll('button[data-l]').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.l)));

  // language dropdown
  document.querySelectorAll('.langdd').forEach(dd=>{
    const cur=dd.querySelector('.langcur');
    cur.addEventListener('click',e=>{e.stopPropagation();dd.classList.toggle('open')});
    dd.querySelectorAll('button[data-l]').forEach(b=>b.addEventListener('click',()=>dd.classList.remove('open')));
  });
  document.addEventListener('click',e=>{
    document.querySelectorAll('.langdd.open').forEach(dd=>{if(!dd.contains(e.target))dd.classList.remove('open')});
  });

  // header scroll
  const hdr=document.querySelector('header');
  addEventListener('scroll',()=>hdr&&hdr.classList.toggle('scrolled',scrollY>30));

  // mobile menu
  const mob=document.getElementById('mob'),ov=document.getElementById('ov'),burger=document.getElementById('burger');
  if(burger){burger.onclick=()=>{mob.classList.add('open');ov.classList.add('show')};
    ov.onclick=()=>{mob.classList.remove('open');ov.classList.remove('show')};
    mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mob.classList.remove('open');ov.classList.remove('show')}));}

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* native scrolling — smooth-scroll library intentionally removed */

  // GSAP reveals
  if(window.gsap && window.ScrollTrigger && !reduced){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.rv').forEach((el,i)=>{
      gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 86%'},delay:(el.dataset.d||0)*.12});
    });
    // counters
    document.querySelectorAll('[data-count]').forEach(el=>{
      const t=+el.dataset.count,suf=el.dataset.suf||'';
      ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>{
        gsap.fromTo(el,{innerText:0},{innerText:t,duration:1.6,ease:'power2.out',snap:{innerText:1},
          onUpdate:function(){el.textContent=Math.floor(+el.textContent).toLocaleString()+suf;}});
      }});
    });
  } else {
    document.querySelectorAll('.rv').forEach(el=>{el.style.opacity=1;el.style.transform='none'});
    document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=(+el.dataset.count).toLocaleString()+(el.dataset.suf||'')});
  }

  // marquee build (if present)
  const mq=document.getElementById('mq');
  if(mq && !mq.children.length){
    const unis=["Bahçeşehir","Istanbul Aydın","Üsküdar","Medipol","Biruni","Istanbul Bilgi","Altınbaş","Istinye","Özyeğin","Yeditepe","Bilkent","Koç","Sabancı","Kadir Has","Acıbadem","Gedik"];
    [...unis,...unis].forEach(u=>{const d=document.createElement('div');d.className='u';d.innerHTML='<span class="dot"></span>'+u+' Üniversitesi';mq.appendChild(d);});
  }

  // page fade transitions (morph-like feel between pages)
  document.body.style.opacity=0;
  requestAnimationFrame(()=>{document.body.style.transition='opacity .45s ease';document.body.style.opacity=1;});
  document.querySelectorAll('a[href$=".html"]').forEach(a=>{
    if(a.hostname===location.hostname){
      a.addEventListener('click',e=>{
        if(e.metaKey||e.ctrlKey)return;
        e.preventDefault();const href=a.getAttribute('href');
        document.body.style.opacity=0;
        setTimeout(()=>location.href=href,320);
      });
    }
  });
})();


// service photo bands — dramatic reveal
document.addEventListener('DOMContentLoaded',()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(window.gsap && window.ScrollTrigger && !reduced){
    document.querySelectorAll('.svcband').forEach(b=>{
      const img=b.querySelector('img');
      gsap.fromTo(b,{clipPath:'inset(9% 6% 9% 6% round 28px)',opacity:.35},
        {clipPath:'inset(0% 0% 0% 0% round 0px)',opacity:1,duration:1.15,ease:'power3.inOut',
         scrollTrigger:{trigger:b,start:'top 82%'}});
      gsap.fromTo(img,{scale:1.28},{scale:1,duration:1.9,ease:'power3.out',
         scrollTrigger:{trigger:b,start:'top 82%'}});
      gsap.fromTo(b.querySelectorAll('.sb-in > *'),{opacity:0,y:34},
        {opacity:1,y:0,duration:.85,stagger:.1,ease:'power3.out',
         scrollTrigger:{trigger:b,start:'top 72%'}});
      gsap.to(img,{yPercent:8,ease:'none',scrollTrigger:{trigger:b,start:'top bottom',end:'bottom top',scrub:true}});
    });
  }
});
