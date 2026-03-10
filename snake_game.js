const CELL=20, COLS=20, ROWS=20;
const canvas=document.getElementById('snake-canvas');
const ctx=canvas.getContext('2d');
canvas.width=CELL*COLS; canvas.height=CELL*ROWS;
document.getElementById('canvas-wrap').style.width=canvas.width+'px';

let snake,dir,nextDir,food,bonus,score,best=0,interval,speed=150;
let running=false,paused=false;

function setSpeed(s,el){
  speed=s;
  document.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  if(running&&!paused){clearInterval(interval);interval=setInterval(tick,speed);}
}

function startGame(){
  clearInterval(interval);
  snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir={x:1,y:0};nextDir={x:1,y:0};
  score=0;bonus=null;running=true;paused=false;
  placeFood();
  document.getElementById('canvas-overlay').classList.add('hidden');
  updateHUD(); draw();
  interval=setInterval(tick,speed);
}

function pauseGame(){
  if(!running)return;
  paused=!paused;
  if(paused)clearInterval(interval);
  else interval=setInterval(tick,speed);
}

function placeFood(){
  do{food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}
  while(snake.some(s=>s.x===food.x&&s.y===food.y));
  if(Math.random()<0.3&&!bonus){
    do{bonus={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS),life:50};}
    while(snake.some(s=>s.x===bonus.x&&s.y===bonus.y)||(bonus.x===food.x&&bonus.y===food.y));
  }
}

function tick(){
  dir=nextDir;
  const head={x:(snake[0].x+dir.x+COLS)%COLS, y:(snake[0].y+dir.y+ROWS)%ROWS};
  if(snake.some(s=>s.x===head.x&&s.y===head.y)){gameOver();return;}
  snake.unshift(head);
  let ate=false;
  if(head.x===food.x&&head.y===food.y){score+=10;ate=true;placeFood();}
  else if(bonus&&head.x===bonus.x&&head.y===bonus.y){score+=30;ate=true;bonus=null;}
  else snake.pop();
  if(bonus){bonus.life--;if(bonus.life<=0)bonus=null;}
  if(score>best)best=score;
  updateHUD(); draw();
}

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('length').textContent=snake.length;
  document.getElementById('best').textContent=best;
}

function draw(){
  // background
  ctx.fillStyle='#fafafa';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // subtle grid
  ctx.strokeStyle='#f0f0f0';
  ctx.lineWidth=0.5;
  for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,canvas.height);ctx.stroke();}
  for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(canvas.width,y*CELL);ctx.stroke();}

  // food
  ctx.fillStyle='#e74c3c';
  ctx.beginPath();
  ctx.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL/2-3,0,Math.PI*2);
  ctx.fill();

  // bonus
  if(bonus){
    ctx.fillStyle='#f39c12';
    ctx.beginPath();
    ctx.arc(bonus.x*CELL+CELL/2,bonus.y*CELL+CELL/2,CELL/2-3,0,Math.PI*2);
    ctx.fill();
    // bonus label
    ctx.fillStyle='#fff';
    ctx.font='bold 8px DM Sans, sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('+30',bonus.x*CELL+CELL/2,bonus.y*CELL+CELL/2);
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  }

  // snake
  snake.forEach((seg,i)=>{
    const isHead=i===0;
    if(isHead){
      ctx.fillStyle='#2d7a2d';
    } else {
      const t=1-(i/snake.length)*0.5;
      const g=Math.floor(90+90*t);
      ctx.fillStyle=`rgb(0,${g},0)`;
    }
    const pad=isHead?1:2;
    ctx.beginPath();
    ctx.roundRect(seg.x*CELL+pad,seg.y*CELL+pad,CELL-pad*2,CELL-pad*2,isHead?5:3);
    ctx.fill();
  });

  // head eyes
  ctx.fillStyle='#fff';
  const hx=snake[0].x*CELL,hy=snake[0].y*CELL;
  const eyeOff=dir.y!==0?[{x:4,y:5+dir.y*2},{x:CELL-6,y:5+dir.y*2}]:[{x:5+dir.x*2,y:4},{x:5+dir.x*2,y:CELL-6}];
  eyeOff.forEach(e=>{ctx.beginPath();ctx.arc(hx+e.x,hy+e.y,2.5,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#1a1a1a';
  eyeOff.forEach(e=>{ctx.beginPath();ctx.arc(hx+e.x,hy+e.y,1,0,Math.PI*2);ctx.fill();});
}

function gameOver(){
  clearInterval(interval);running=false;
  if(score>best)best=score;
  updateHUD();
  // flash red briefly
  ctx.fillStyle='rgba(231,76,60,0.18)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  setTimeout(()=>{
    const overlay=document.getElementById('canvas-overlay');
    document.getElementById('overlay-title').textContent='Game Over';
    document.getElementById('overlay-sub').textContent='Better luck next time!';
    document.getElementById('overlay-score').textContent=`Score: ${score}  ·  Best: ${best}`;
    overlay.classList.remove('hidden');
  },300);
}

function changeDir(dx,dy){
  if(!running||paused){startGame();return;}
  if(dx===1&&dir.x===-1)return;if(dx===-1&&dir.x===1)return;
  if(dy===1&&dir.y===-1)return;if(dy===-1&&dir.y===1)return;
  nextDir={x:dx,y:dy};
}

document.addEventListener('keydown',e=>{
  const map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
  const m=map[e.key];
  if(m){e.preventDefault();changeDir(...m);}
  if(e.key===' '){e.preventDefault();running?pauseGame():startGame();}
});

// touch swipe
let tx0,ty0;
canvas.addEventListener('touchstart',e=>{tx0=e.touches[0].clientX;ty0=e.touches[0].clientY;},{passive:true});
canvas.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx0,dy=e.changedTouches[0].clientY-ty0;
  if(Math.abs(dx)>Math.abs(dy))changeDir(dx>0?1:-1,0);else changeDir(0,dy>0?1:-1);
},{passive:true});

// initial draw
ctx.fillStyle='#fafafa';ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.strokeStyle='#f0f0f0';ctx.lineWidth=0.5;
for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,canvas.height);ctx.stroke();}
for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(canvas.width,y*CELL);ctx.stroke();}