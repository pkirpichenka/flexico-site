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


// Team controls are independent from the rest of the homepage.
(() => {
  const section = document.querySelector('.team-section');
  if (!section) return;
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const galleryControllers = new WeakMap();

  function setupGallery(gallery, initial = 0) {
    const track = gallery.querySelector('.team-track');
    const slides = [...gallery.querySelectorAll('.team-slide')];
    const dots = [...gallery.querySelectorAll('.team-dot')];
    const counter = gallery.querySelector('.team-frame-number');
    const listeners = [];
    let active = initial;
    let frame = 0;
    let width = 0;
    const listen = (element, type, fn, options) => {
      element.addEventListener(type, fn, options);
      listeners.push(() => element.removeEventListener(type, fn, options));
    };
    function mark(index) {
      active = Math.max(0, Math.min(slides.length - 1, index));
      dots.forEach((dot, i) => {
        if (i === active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      gallery.style.setProperty('--gallery-studio', slides[active].style.getPropertyValue('--studio'));
      gallery.closest('.team-dialog-media')?.style.setProperty('--gallery-studio', slides[active].style.getPropertyValue('--studio'));
      counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
    function go(index, animate = true) {
      mark(index);
      track.scrollTo({left: active * track.clientWidth, behavior: animate && !reducedMotion() ? 'smooth' : 'instant'});
    }
    dots.forEach((dot, i) => listen(dot, 'click', event => {
      event.preventDefault();
      go(i);
    }));
    listen(track, 'keydown', event => {
      const targets = {ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1};
      if (event.key in targets) {
        event.preventDefault();
        go(targets[event.key]);
      }
    });
    listen(track, 'scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (track.clientWidth) mark(Math.round(track.scrollLeft / track.clientWidth));
      });
    }, {passive: true});
    function resize() {
      const nextWidth = track.clientWidth;
      if (nextWidth && nextWidth !== width) {
        width = nextWidth;
        go(active, false);
      }
    }
    let resizeObserver;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(track);
    } else listen(window, 'resize', resize);
    go(initial, false);
    const controller = {
      index: () => active,
      refresh: resize,
      destroy: () => {
        cancelAnimationFrame(frame);
        resizeObserver?.disconnect();
        listeners.forEach(remove => remove());
      }
    };
    galleryControllers.set(gallery, controller);
    return controller;
  }
  section.querySelectorAll('.team-gallery').forEach(gallery => setupGallery(gallery));

  const cards = [...section.querySelectorAll('.team-card')];
  const filters = [...section.querySelectorAll('[data-team-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.teamFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = filter !== 'all' && !card.dataset.moods.split(' ').includes(filter);
      if (!card.hidden) {
        count++;
        card.querySelectorAll('.team-gallery').forEach(gallery => galleryControllers.get(gallery)?.refresh());
      }
    });
    const word = count === 1 ? 'тренер' : count > 1 && count < 5 ? 'тренера' : 'тренеров';
    section.querySelector('.team-count').textContent = `${count} ${word}`;
  }));

  const dialog = section.querySelector('.team-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const body = dialog.querySelector('.team-dialog-body');
  const closeButton = dialog.querySelector('.team-close');
  let opener;
  let modalGallery;
  let outsideStart = false;

  cards.forEach(card => {
    const summary = card.querySelector('.team-summary');
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.addEventListener('click', event => {
      event.preventDefault();
      opener = summary;
      const originalGallery = card.querySelector('.team-gallery');
      const media = (originalGallery || card.querySelector('.team-art')).cloneNode(true);
      media.querySelectorAll('[id]').forEach(element => { element.id = `dialog-${element.id}`; });
      media.querySelectorAll('.team-dot').forEach(dot => dot.setAttribute('href', `#dialog-${dot.getAttribute('href').slice(1)}`));
      const mediaPanel = document.createElement('div');
      mediaPanel.className = 'team-dialog-media';
      mediaPanel.append(media);
      const copy = document.createElement('div');
      copy.className = 'team-dialog-copy';
      copy.append(card.querySelector('.team-vibe').cloneNode(true));
      const title = document.createElement('h2');
      title.id = 'team-dialog-name';
      title.className = 'team-dialog-name';
      title.innerHTML = card.querySelector('.team-name').innerHTML;
      copy.append(title, card.querySelector('.team-bio').cloneNode(true));
      body.replaceChildren(mediaPanel, copy);
      try {
        dialog.showModal();
      } catch {
        card.querySelector('.team-profile').open = true;
        return;
      }
      document.body.classList.add('team-modal-open');
      body.scrollTop = 0;
      if (originalGallery) modalGallery = setupGallery(media, galleryControllers.get(originalGallery).index());
      closeButton.focus({preventScroll: true});
    });
  });
  closeButton.addEventListener('click', () => dialog.close());
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { outsideStart = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (outsideStart && event.target === dialog && outside(event)) dialog.close();
    outsideStart = false;
  });
  dialog.addEventListener('close', () => {
    modalGallery?.destroy();
    modalGallery = undefined;
    document.body.classList.remove('team-modal-open');
    body.replaceChildren();
    opener?.focus({preventScroll: true});
  });
})();
