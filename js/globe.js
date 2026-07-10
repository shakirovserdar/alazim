/* Al Azim — hero globe (Three.js) */
(function(){
  const cv=document.getElementById('globe'); if(!window.THREE||!cv) return;
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(45,1,.1,100); cam.position.set(0,0,9);
  const rnd=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  rnd.setPixelRatio(Math.min(devicePixelRatio,2));
  function size(){const w=cv.clientWidth,h=cv.clientHeight;rnd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();globe.position.x=w>900?1.5:0;}
  const R=2, globe=new THREE.Group(); scene.add(globe);
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R,48,48),new THREE.MeshBasicMaterial({color:0x110e16,transparent:true,opacity:.35})));
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.12,48,48),new THREE.MeshBasicMaterial({color:0xd4af6a,transparent:true,opacity:.05,side:THREE.BackSide})));
  const ll=(lat,lon,r=R)=>{const p=(90-lat)*Math.PI/180,t=(lon+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t));};
  const gA=new THREE.LineBasicMaterial({color:0xd4af6a,transparent:true,opacity:.30}),gB=new THREE.LineBasicMaterial({color:0xf3d68c,transparent:true,opacity:.13});
  for(let lat=-60;lat<=60;lat+=20){const p=[];for(let lo=0;lo<=360;lo+=4)p.push(ll(lat,lo,R*1.002));globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),lat===0?gA:gB));}
  for(let lo=0;lo<360;lo+=20){const p=[];for(let lat=-88;lat<=88;lat+=4)p.push(ll(lat,lo,R*1.002));globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),gB));}
  const NA=[[-168,66],[-150,71],[-120,72],[-90,72],[-65,68],[-55,50],[-67,45],[-75,35],[-81,25],[-90,19],[-97,16],[-105,22],[-114,28],[-123,38],[-125,48],[-140,59],[-168,66]],
  SA=[[-78,9],[-70,11],[-60,5],[-50,0],[-35,-6],[-40,-22],[-48,-25],[-58,-35],[-65,-42],[-73,-52],[-75,-45],[-71,-30],[-70,-18],[-78,-5],[-80,2],[-78,9]],
  AF=[[-16,15],[-10,20],[0,32],[10,37],[22,33],[33,31],[43,12],[51,11],[48,0],[42,-12],[35,-22],[27,-34],[18,-35],[12,-20],[9,-2],[5,5],[-8,5],[-16,12],[-16,15]],
  EU=[[-10,37],[-9,44],[-2,49],[2,51],[8,54],[12,58],[25,60],[40,60],[40,48],[28,45],[22,40],[15,40],[5,43],[-10,37]],
  AS=[[40,48],[45,55],[55,62],[70,70],[95,72],[120,72],[140,70],[160,68],[175,65],[165,60],[150,58],[145,48],[140,40],[128,35],[122,30],[120,22],[108,15],[100,8],[95,6],[88,20],[80,12],[77,8],[72,18],[60,24],[52,28],[45,38],[40,48]],
  AR=[[35,30],[40,28],[48,30],[57,22],[52,15],[43,12],[35,18],[35,30]],
  AU=[[114,-22],[122,-18],[131,-12],[142,-11],[147,-20],[151,-28],[146,-38],[140,-38],[129,-32],[118,-34],[114,-30],[114,-22]],
  GL=[[-45,60],[-30,70],[-20,76],[-30,82],[-50,80],[-58,72],[-50,62],[-45,60]];
  const lands=[NA,SA,AF,EU,AS,AR,AU,GL];
  const pip=(x,y,p)=>{let i_=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))i_=!i_;}return i_;};
  const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,236,186,1)');g.addColorStop(.45,'rgba(233,196,119,1)');g.addColorStop(1,'rgba(233,196,119,0)');x.fillStyle=g;x.beginPath();x.arc(16,16,16,0,7);x.fill();return new THREE.CanvasTexture(c);})();
  const pos=[];for(let lat=-58;lat<=82;lat+=1.9){for(let lo=-180;lo<180;lo+=1.9){if(lands.some(p=>pip(lo,lat,p))){const v=ll(lat,lo,R*1.012);pos.push(v.x,v.y,v.z);}}}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  globe.add(new THREE.Points(dg,new THREE.PointsMaterial({size:.065,map:tex,transparent:true,depthWrite:false,sizeAttenuation:true,color:0xe9c477})));
  const TR=ll(39.9,32.8,R*1.02),mk=(p,r,c)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,14,14),new THREE.MeshBasicMaterial({color:c}));m.position.copy(p);globe.add(m);};
  mk(TR,.055,0xfff2cf);
  const origins=[[37.9,58.4],[41.3,69.2],[51.1,71.4],[42.9,74.6],[40.4,49.9],[55.7,37.6]],aM=new THREE.LineBasicMaterial({color:0xf6dd97,transparent:true,opacity:.32}),trav=[];
  origins.forEach(o=>{const a=ll(o[0],o[1],R*1.02);mk(a,.032,0xe9c477);const mid=a.clone().add(TR).multiplyScalar(.5);mid.normalize().multiplyScalar(R*(1+a.distanceTo(TR)*.32));const cu=new THREE.QuadraticBezierCurve3(a,mid,TR);globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cu.getPoints(50)),aM));const d=new THREE.Mesh(new THREE.SphereGeometry(.03,10,10),new THREE.MeshBasicMaterial({color:0xffe9b0}));globe.add(d);trav.push({cu,d,t:Math.random()});});
  let vel=0,down=false,lx=0,mx=0,my=0,tx=0,ty=0,vis=true;
  cv.addEventListener('pointerdown',e=>{down=true;lx=e.clientX;});
  addEventListener('pointerup',()=>down=false);
  addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(down){vel=(e.clientX-lx)*.004;lx=e.clientX;}});
  new IntersectionObserver(es=>es.forEach(e=>vis=e.isIntersecting)).observe(document.querySelector('.hero'));
  size(); addEventListener('resize',size);
  (function loop(){requestAnimationFrame(loop);if(!vis)return;globe.rotation.y+=.0014+vel;vel*=.93;tx+=(mx-tx)*.05;ty+=(my-ty)*.05;cam.position.x=tx;cam.position.y=-ty*.8;cam.lookAt(globe.position.x*.55,0,0);trav.forEach(o=>{o.t+=.0035;if(o.t>1)o.t=0;o.d.position.copy(o.cu.getPoint(o.t));});rnd.render(scene,cam);})();
})();
