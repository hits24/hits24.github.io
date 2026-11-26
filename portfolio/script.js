(function(){
'use strict';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s){return document.querySelector(s)};
$('#yr').textContent=new Date().getFullYear();

/* nav, progress bar, mobile menu */
var nav=$('#nav'),bar=$('#bar'),burger=$('#burger'),links=$('#links');
function onScroll(){
  var h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(h>0?scrollY/h*100:0)+'%';
  nav.classList.toggle('solid',scrollY>20);
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
burger.addEventListener('click',function(){
  var o=links.classList.toggle('open');burger.setAttribute('aria-expanded',o);
});
links.addEventListener('click',function(e){
  if(e.target.tagName==='A'){links.classList.remove('open');burger.setAttribute('aria-expanded',false)}
});

/* hero: profile typed out as an API response */
var lines=[
'{',
'  "status": "200 OK",',
'  "name": "Hitashri Patil",',
'  "role": "Software Engineer",',
'  "company": "Deutsche Bank, Pune",',
'  "since": "July 2024",',
'  "stack": ["Java", "Spring Boot", "GraphQL", "Oracle SQL"],',
'  "also": ["Python", "Flask", "REST APIs", "JUnit"],',
'  "education": "B.Tech IT, CGPA 8.77/10"',
'}'
];
var full=lines.join('\n'),out=$('#json');
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function hl(s){
  return esc(s).replace(/("[^"]*")(:)?|\b(\d[\d.\/]*)\b/g,function(m,str,colon,num){
    if(str)return '<span class="'+(colon?'k':'s')+'">'+str+'</span>'+(colon||'');
    return '<span class="n">'+num+'</span>';
  });
}
if(reduce){out.innerHTML=hl(full)}
else{
  var i=0;
  (function type(){
    i+=2;out.innerHTML=hl(full.slice(0,i));
    if(i<full.length)setTimeout(type,i%7===0?45:16);
  })();
}

/* count-up stats */
var io2=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(!e.isIntersecting)return;
    io2.unobserve(e.target);
    var b=e.target,n=+b.dataset.n,s=b.dataset.s,t0=null;
    if(reduce){b.textContent=n+s;return}
    (function step(t){
      if(!t0)t0=t;
      var p=Math.min((t-t0)/1400,1),v=Math.round(n*(1-Math.pow(1-p,3)));
      b.textContent=v+s;
      if(p<1)requestAnimationFrame(step);
    })(performance.now());
  });
},{threshold:.6});
document.querySelectorAll('[data-n]').forEach(function(b){io2.observe(b)});

/* scroll reveal */
var io=new IntersectionObserver(function(es){
  es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

/* cursor glow + 3D tilt on project cards */
var glow=$('#glow'),mx=innerWidth/2,my=innerHeight*.3;
if(!reduce&&matchMedia('(hover:hover)').matches){
  addEventListener('pointermove',function(e){
    mx=e.clientX;my=e.clientY;
    glow.style.left=mx+'px';glow.style.top=my+'px';
  },{passive:true});
  document.querySelectorAll('.tilt').forEach(function(c){
    c.addEventListener('pointermove',function(e){
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform='perspective(800px) rotateX('+(-y*8)+'deg) rotateY('+(x*8)+'deg) translateY(-4px)';
    });
    c.addEventListener('pointerleave',function(){c.style.transform=''});
  });
}

/* background: connected nodes that react to the pointer */
var cv=$('#net'),cx=cv.getContext('2d'),pts=[],W,H,dpr=Math.min(devicePixelRatio||1,2);
function size(){
  W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  var n=Math.min(90,Math.floor(W*H/16000));pts=[];
  for(var k=0;k<n;k++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});
}
function draw(){
  cx.clearRect(0,0,W,H);
  for(var a=0;a<pts.length;a++){
    var p=pts[a];
    if(!reduce){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;
      if(p.y<0||p.y>H)p.vy*=-1;
      var dx=p.x-mx,dy=p.y-my,d=dx*dx+dy*dy;
      if(d<22500){var f=(1-d/22500)*.6;p.x+=dx*f*.02;p.y+=dy*f*.02}
    }
    cx.fillStyle='rgba(159,176,255,.7)';
    cx.beginPath();cx.arc(p.x,p.y,1.6,0,6.283);cx.fill();
    for(var b=a+1;b<pts.length;b++){
      var q=pts[b],ex=p.x-q.x,ey=p.y-q.y,dd=ex*ex+ey*ey;
      if(dd<14400){
        cx.strokeStyle='rgba(111,141,255,'+(.22*(1-dd/14400))+')';
        cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke();
      }
    }
  }
  if(!reduce)requestAnimationFrame(draw);
}
addEventListener('resize',function(){size();if(reduce)draw()});
size();draw();
})();
