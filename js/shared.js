/* ═══════════════════════════════════
   ImmigrationIQ — Shared JS
   ═══════════════════════════════════ */

'use strict';

const AUTH_STORAGE_KEY='immigrationiq-auth';
const USERS_STORAGE_KEY='immigrationiq-users';

function getAuthState(){
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function getInitials(name){
  return (name || 'Guest')
    .trim()
    .split(/\s+/)
    .slice(0,2)
    .map(part=>part[0] || '')
    .join('')
    .toUpperCase() || 'G';
}

function setAuthState(user){
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function clearAuthState(){
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function normalizeEmail(email){
  return (email || '').toString().trim().toLowerCase();
}

function getUsers(){
  try {
    const raw=localStorage.getItem(USERS_STORAGE_KEY);
    const parsed=raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setUsers(users){
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users || []));
}

function makeId(){
  try {
    if(typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return 'u_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
}

function makeStatusError(message, status){
  const error=new Error(message || 'Request failed');
  error.status=status || 0;
  return error;
}

async function demoSignup(name, email, password){
  const normalizedEmail=normalizeEmail(email);
  if(!name || !normalizedEmail || !password){
    throw makeStatusError('Missing required fields.', 400);
  }

  const users=getUsers();
  const existing=users.find(u=>u && normalizeEmail(u.email)===normalizedEmail);
  if(existing) throw makeStatusError('User already exists.', 409);

  const user={
    id: makeId(),
    name: (name || '').toString().trim() || 'ImmigrationIQ User',
    email: normalizedEmail,
    password: password.toString()
  };
  users.push(user);
  setUsers(users);

  return { user: { id: user.id, name: user.name, email: user.email } };
}

async function demoLogin(email, password){
  const normalizedEmail=normalizeEmail(email);
  const users=getUsers();
  const user=users.find(u=>u && normalizeEmail(u.email)===normalizedEmail);
  if(!user || user.password !== password.toString()){
    throw makeStatusError('Invalid email or password.', 401);
  }
  return { user: { id: user.id, name: user.name, email: user.email } };
}

function clearSessions(){
  clearAuthState();
}

/* ── CURSOR ─────────────────────────────────── */
(function(){
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if(!dot||!ring) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
  });
  (function loop(){
    rx+=(mx-rx)*.13; ry+=(my-ry)*.13;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.card,.module-card,.country-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-active'));
  });
})();

/* ── NAVBAR ─────────────────────────────────── */
(function(){
  const nav = document.querySelector('.navbar');
  if(!nav) return;
  // shrink on scroll
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
  // active link
  const links = nav.querySelectorAll('.navbar-links a');
  const cur = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(a=>{
    const href = a.getAttribute('href').split('/').pop();
    if(href===cur) a.classList.add('active');
  });
  // hamburger
  const ham = document.querySelector('.hamburger');
  const nl  = document.querySelector('.navbar-links');
  if(ham&&nl){
    ham.addEventListener('click',()=>{
      nl.classList.toggle('open');
      const [s1,s2,s3]=ham.querySelectorAll('span');
      if(nl.classList.contains('open')){
        s1.style.transform='rotate(45deg) translateY(7px)';
        s2.style.opacity='0';
        s3.style.transform='rotate(-45deg) translateY(-7px)';
      } else {
        s1.style.transform=''; s2.style.opacity=''; s3.style.transform='';
      }
    });
  }
})();

/* ── SCROLL REVEAL ──────────────────────────── */
(function(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        const delay = e.target.dataset.delay || (e.target.dataset.stagger ? i*80 : 0);
        setTimeout(()=> e.target.classList.add('visible'), +delay);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  // stagger groups
  document.querySelectorAll('[data-stagger]').forEach(group=>{
    group.querySelectorAll('.reveal').forEach((el,i)=>{ el.dataset.delay=i*90; });
  });
})();

/* ── COUNTER ANIMATION ──────────────────────── */
(function(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target, target=+el.dataset.count, dur=1800;
      let start=null;
      (function step(ts){
        if(!start) start=ts;
        const prog=Math.min((ts-start)/dur,1);
        const ease=1-Math.pow(1-prog,4);
        el.textContent=Math.floor(ease*target)+(el.dataset.suffix||'');
        if(prog<1) requestAnimationFrame(step);
        else el.textContent=target+(el.dataset.suffix||'');
      })(performance.now());
      obs.unobserve(el);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>obs.observe(el));
})();

/* ── PARTICLES ──────────────────────────────── */
function spawnParticles(container){
  if(!container) return;
  function make(){
    const p=document.createElement('div');
    const isGold=Math.random()>.5;
    const sz=Math.random()*3.5+1;
    Object.assign(p.style,{
      position:'absolute', width:sz+'px', height:sz+'px', borderRadius:'50%',
      left:Math.random()*100+'%',
      background:isGold?`rgba(212,168,67,${Math.random()*.5+.15})`:`rgba(9,184,181,${Math.random()*.4+.1})`,
      pointerEvents:'none',
      animation:`particleRise ${Math.random()*14+10}s linear ${Math.random()*-20}s infinite`
    });
    container.appendChild(p);
  }
  for(let i=0;i<22;i++) make();
}

/* ── 3D CARD TILT ────────────────────────────── */
document.querySelectorAll('.card-tilt').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`translateY(-6px) rotateX(${-y*10}deg) rotateY(${x*10}deg)`;
  });
  card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
});

/* ── TABS ────────────────────────────────────── */
function initTabs(scope){
  (scope||document).querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const group=btn.closest('[data-tabs]');
      if(!group) return;
      group.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      group.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      const panel=group.querySelector(`[data-panel="${btn.dataset.tab}"]`);
      if(panel) panel.classList.add('active');
    });
  });
}
initTabs();

/* ── AUTH UI ────────────────────────────────── */
(function(){
  const user=getAuthState();
  document.querySelectorAll('[data-auth="guest"]').forEach(el=>{ el.hidden=!!user; });
  document.querySelectorAll('[data-auth="user"]').forEach(el=>{ el.hidden=!user; });

  if(user){
    document.querySelectorAll('[data-auth-name]').forEach(el=>{ el.textContent=user.name; });
    document.querySelectorAll('[data-auth-avatar]').forEach(el=>{ el.textContent=getInitials(user.name); });
    const dashboardName=document.querySelector('.profile-name');
    const dashboardAvatar=document.querySelector('.profile-avatar');
    if(dashboardName) dashboardName.textContent=user.name;
    if(dashboardAvatar) dashboardAvatar.textContent=getInitials(user.name);
  }

  document.querySelectorAll('[data-auth-logout]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      clearSessions();
      window.location.href=btn.dataset.authRedirect || '../index.html';
    });
  });
})();

window.ImmigrationIQAuth={
  getAuthState,
  setAuthState,
  clearAuthState,
  getInitials
};

window.ImmigrationIQApi={
  demoSignup,
  demoLogin,
  clearSessions
};

/* ── PROGRESS BARS ──────────────────────────── */
(function(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const fill=e.target.querySelector('.progress-fill');
        if(fill) fill.style.width=fill.dataset.value+'%';
        obs.unobserve(e.target);
      }
    });
  },{threshold:.3});
  document.querySelectorAll('.progress-track').forEach(t=>obs.observe(t));
})();

/* ── PAGE TRANSITION ────────────────────────── */
document.querySelectorAll('a[href]').forEach(a=>{
  const href=a.getAttribute('href');
  if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto')) return;
  a.addEventListener('click',e=>{
    e.preventDefault();
    document.body.style.transition='opacity .25s';
    document.body.style.opacity='0';
    setTimeout(()=>{ window.location.href=href; },260);
  });
});
window.addEventListener('pageshow',()=>{
  document.body.style.opacity='0';
  requestAnimationFrame(()=>{ document.body.style.transition='opacity .4s'; document.body.style.opacity='1'; });
});

/* ── THREE.JS EARTH (called from pages that need it) ── */
function initEarth(canvasId){
  const script=document.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload=()=>_buildEarth(canvasId);
  document.head.appendChild(script);
}

function _buildEarth(canvasId){
  const canvas=document.getElementById(canvasId);
  if(!canvas) return;
  const container=canvas.parentElement;
  const W=container.offsetWidth, H=container.offsetHeight;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(W,H);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,W/H,.1,1000);
  camera.position.z=3.9;
  const R=1;

  /* procedural earth texture */
  const ec=document.createElement('canvas'); ec.width=2048; ec.height=1024;
  const ex=ec.getContext('2d');
  const og=ex.createLinearGradient(0,0,0,1024);
  og.addColorStop(0,'#0d2a4a'); og.addColorStop(.45,'#1a5276'); og.addColorStop(.55,'#1a5276'); og.addColorStop(1,'#0d2a4a');
  ex.fillStyle=og; ex.fillRect(0,0,2048,1024);
  // continents
  ex.fillStyle='#1e6b35';
  [[430,310,195,240,-.15],[390,520,90,120,.3],[455,720,95,175,.1],[1000,280,90,75,0],[1015,575,130,215,0],[1310,330,310,205,-.08],[1560,710,115,85,0]].forEach(([cx,cy,rx,ry,rot])=>{
    ex.save(); ex.translate(cx,cy); ex.rotate(rot); ex.beginPath(); ex.ellipse(0,0,rx,ry,0,0,Math.PI*2); ex.fill(); ex.restore();
  });
  // polar
  ex.fillStyle='#c8dff0';
  ex.beginPath(); ex.ellipse(1024,30,380,52,0,0,Math.PI*2); ex.fill();
  ex.beginPath(); ex.ellipse(1024,990,420,55,0,0,Math.PI*2); ex.fill();
  // clouds
  ex.fillStyle='rgba(255,255,255,.14)';
  for(let i=0;i<40;i++){
    ex.beginPath();
    ex.ellipse(Math.random()*2048,Math.random()*1024,Math.random()*180+50,Math.random()*40+10,Math.random()*Math.PI,0,Math.PI*2);
    ex.fill();
  }
  const earthTex=new THREE.CanvasTexture(ec);

  /* load real texture if available */
  new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',t=>{
    earthMat.map=t; earthMat.needsUpdate=true;
  },undefined,()=>{});

  const earthMat=new THREE.MeshPhongMaterial({map:earthTex,specular:new THREE.Color(0x223344),shininess:12,emissive:new THREE.Color(0x001020),emissiveIntensity:.12});
  const earth=new THREE.Mesh(new THREE.SphereGeometry(R,72,72),earthMat);
  scene.add(earth);

  /* atmosphere */
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.025,64,64),new THREE.MeshPhongMaterial({color:0x0077cc,transparent:true,opacity:.07,side:THREE.FrontSide})));
  const glowMesh=new THREE.Mesh(new THREE.SphereGeometry(R*1.09,64,64),new THREE.MeshBasicMaterial({color:0x09b8b5,transparent:true,opacity:.045,side:THREE.BackSide}));
  scene.add(glowMesh);

  /* clouds */
  const cc2=document.createElement('canvas'); cc2.width=2048; cc2.height=1024;
  const cx2=cc2.getContext('2d'); cx2.fillStyle='rgba(0,0,0,0)'; cx2.fillRect(0,0,2048,1024);
  cx2.fillStyle='rgba(255,255,255,.65)';
  for(let i=0;i<90;i++){ cx2.beginPath(); cx2.ellipse(Math.random()*2048,Math.random()*1024,Math.random()*130+30,Math.random()*38+8,Math.random()*Math.PI,0,Math.PI*2); cx2.fill(); }
  const clouds=new THREE.Mesh(new THREE.SphereGeometry(R*1.013,64,64),new THREE.MeshPhongMaterial({map:new THREE.CanvasTexture(cc2),transparent:true,opacity:.5,depthWrite:false}));
  scene.add(clouds);

  /* city dots */
  const cities=[{la:40.7,lo:-74},{la:51.5,lo:-.1},{la:48.8,lo:2.35},{la:35.7,lo:139.7},{la:1.35,lo:103.8},{la:28.6,lo:77.2},{la:-33.9,lo:151.2},{la:25.2,lo:55.3},{la:43.7,lo:-79.4},{la:34,lo:-118.2},{la:52.5,lo:13.4},{la:-23.5,lo:-46.6}];
  const pulseMeshes=[];
  function ll2v(la,lo,r){ const p=(90-la)*(Math.PI/180),t=(lo+180)*(Math.PI/180); return new THREE.Vector3(-r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t)); }
  cities.forEach(c=>{
    const pos=ll2v(c.la,c.lo,R*1.018);
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.013,8,8),new THREE.MeshBasicMaterial({color:0xD4A843}));
    dot.position.copy(pos); scene.add(dot);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.018,.026,16),new THREE.MeshBasicMaterial({color:0xD4A843,transparent:true,opacity:.8,side:THREE.DoubleSide}));
    ring.position.copy(pos); ring.lookAt(0,0,0); ring.userData.phase=Math.random()*Math.PI*2; scene.add(ring); pulseMeshes.push(ring);
  });

  /* orbit ring + satellite */
  const orbitRing=new THREE.Mesh(new THREE.TorusGeometry(R*1.38,.0025,8,128),new THREE.MeshBasicMaterial({color:0xD4A843,transparent:true,opacity:.35}));
  orbitRing.rotation.x=Math.PI*.28; orbitRing.rotation.z=Math.PI*.08; scene.add(orbitRing);
  const sat=new THREE.Mesh(new THREE.SphereGeometry(.022,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));
  scene.add(sat);

  /* lights */
  const sun=new THREE.DirectionalLight(0xffffff,1.5); sun.position.set(-3,2,5); scene.add(sun);
  scene.add(new THREE.AmbientLight(0x1a2244,.9));
  const rim=new THREE.PointLight(0x09b8b5,.9,12); rim.position.set(3,0,-2); scene.add(rim);
  scene.add(new THREE.PointLight(0xD4A843,.4,9).position.set(0,-3,2));

  /* drag */
  let drag=false,px=0,py=0,vx=.0015,vy=0;
  canvas.style.pointerEvents='auto';
  canvas.addEventListener('mousedown',e=>{drag=true;px=e.clientX;py=e.clientY;});
  window.addEventListener('mouseup',()=>drag=false);
  window.addEventListener('mousemove',e=>{
    if(!drag) return;
    vx=(e.clientX-px)*.005; vy=(e.clientY-py)*.004;
    px=e.clientX; py=e.clientY;
  });

  let t=0;
  (function loop(){
    requestAnimationFrame(loop); t+=.01;
    if(!drag){ vx=vx*.97+.00045; vy*=.97; }
    earth.rotation.y+=vx; earth.rotation.x+=vy;
    clouds.rotation.y+=vx*.88+.0002;
    pulseMeshes.forEach(r=>{ const s=1+Math.sin(r.userData.phase+t)*.9; r.scale.setScalar(s); r.material.opacity=(1-Math.sin(r.userData.phase+t)*.5)*.85; });
    const sa=t*.45, sr=R*1.38;
    sat.position.set(Math.cos(sa)*sr*Math.cos(Math.PI*.28),Math.sin(sa)*sr,Math.cos(sa)*sr*Math.sin(Math.PI*.08));
    rim.intensity=.7+Math.sin(t*.6)*.25;
    renderer.render(scene,camera);
  })();

  window.addEventListener('resize',()=>{
    const nw=container.offsetWidth,nh=container.offsetHeight;
    camera.aspect=nw/nh; camera.updateProjectionMatrix(); renderer.setSize(nw,nh);
  });
}
