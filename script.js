const goals={
 soft:{number:'Ваш вариант — 01',title:'Здоровая спина',text:'Мягко снимаем напряжение в шее и пояснице, укрепляем мышцы и возвращаем телу свободу движения.',items:['Подходит без подготовки','Спокойный темп','60 минут заботы о себе']},
 strong:{number:'Ваш вариант — 02',title:'Пилатес Power',text:'Осознанно укрепляем всё тело, улучшаем осанку и создаём красивый мышечный тонус.',items:['Сила без изнурения','Работа с глубокими мышцами','Заметный прогресс']},
 air:{number:'Ваш вариант — 03',title:'Аэро Light',text:'Знакомимся с гамаком, учимся базовым положениям и получаем совершенно новые ощущения от движения.',items:['Без сложных трюков','Страховка тренера','Можно без подготовки']},
 start:{number:'Ваш вариант — 04',title:'Пилатес Start',text:'Понятное знакомство с техникой и своим телом. Тренер всё покажет и поможет почувствовать движения.',items:['Комфортный старт','Пошаговые объяснения','Нагрузка под вас']}
};
const recommendation=document.querySelector('#recommendation');
document.querySelectorAll('.goal').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.goal').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
 const key=btn.dataset.goal,d=goals[key],photo=recommendation.querySelector('.recommendation-photo');
 photo.className=`recommendation-photo ${key}`;recommendation.querySelector('.number').textContent=d.number;recommendation.querySelector('h3').textContent=d.title;recommendation.querySelector('p').textContent=d.text;recommendation.querySelector('ul').innerHTML=d.items.map(x=>`<li>${x}</li>`).join('');
}));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('.trainer-filter-button').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('.trainer-filter-button').forEach(item=>item.classList.remove('active'));
 button.classList.add('active');
 const filter=button.dataset.trainerFilter;
 document.querySelectorAll('.trainer-card').forEach(card=>{
  const show=filter==='all'||card.dataset.moods.split(' ').includes(filter);
  card.classList.toggle('filtered-out',!show);
 });
}));

// Independent photo strips: dots, keyboard and native touch scrolling.
document.querySelectorAll('.trainer-carousel').forEach(carousel=>{
 const track=carousel.querySelector('.trainer-track');
 const dots=[...carousel.querySelectorAll('.trainer-dot')];
 let active=0,frame=0;
 const mark=index=>{
  active=Math.max(0,Math.min(dots.length-1,index));
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));
 };
 const go=index=>{
  const next=(index+dots.length)%dots.length;
  mark(next);
  track.scrollTo({left:next*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
 carousel.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>go(active+Number(button.dataset.step))));
 track.addEventListener('keydown',event=>{
  const keys={ArrowLeft:active-1,ArrowRight:active+1,Home:0,End:dots.length-1};
  if(event.key in keys){event.preventDefault();go(keys[event.key]);}
 });
 track.addEventListener('scroll',()=>{
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{if(track.clientWidth)mark(Math.round(track.scrollLeft/track.clientWidth));});
 },{passive:true});
 let width=track.clientWidth;
 new ResizeObserver(()=>{
  if(track.clientWidth&&track.clientWidth!==width){width=track.clientWidth;track.scrollTo({left:active*width,behavior:'instant'});}
 }).observe(track);
 carousel.querySelector('.trainer-controls').hidden=false;
});
