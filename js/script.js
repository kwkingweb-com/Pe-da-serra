'use strict';
(() => {
  const config = window.SITE_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const dateISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const todayISO = () => dateISO(new Date());
  const nextDay = value => {
    const [y,m,d] = value.split('-').map(Number);
    return dateISO(new Date(y,m-1,d+1,12));
  };
  const dateBR = value => value.split('-').reverse().join('/');
  const whatsappURL = message => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  const syncLock = () => document.body.classList.toggle('locked',!!$('dialog[open]'));
  const menu = $('.menu-toggle'), nav = $('.nav');
  const closeMenu = () => {nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');};
  menu?.addEventListener('click',() => {const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  $$('.nav a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=> {if(event.key==='Escape')closeMenu();});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  $$('[data-instagram]').forEach(link => link.href=config.instagram);
  $$('[data-maps]').forEach(link => link.href=config.maps);
  $$('[data-contact]').forEach(link => link.href=whatsappURL(link.dataset.contact));
  $$('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));

  const booking=$('#booking'),form=$('#booking-form');
  const checkin=$('#checkin'),checkout=$('#checkout');
  if(checkin&&checkout){
    checkin.min=todayISO();checkout.min=nextDay(todayISO());
    checkin.addEventListener('input',()=>{
      checkin.setCustomValidity('');checkout.setCustomValidity('');
      if(checkin.value){checkout.min=nextDay(checkin.value);if(checkout.value&&checkout.value<checkout.min)checkout.value='';}
    });
    checkout.addEventListener('input',()=>checkout.setCustomValidity(''));
  }
  $$('.js-booking').forEach(button=>button.addEventListener('click',()=>{
    closeMenu();checkin.min=todayISO();booking.showModal();syncLock();
  }));
  $$('dialog').forEach(dialog=>{
    $$('[data-close]',dialog).forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('close',syncLock);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  });
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    const name=$('#guest-name').value.trim();
    $('#guest-name').setCustomValidity(name?'':'Informe seu nome.');
    checkin.setCustomValidity(checkin.value>=todayISO()?'':'Escolha hoje ou uma data futura.');
    checkout.setCustomValidity(checkout.value>checkin.value?'':'A saída deve ser depois da entrada.');
    if(!form.reportValidity())return;
    const adults=$('#adults').value,children=$('#children').value;
    const message=`Olá! Meu nome é ${name}. Gostaria de consultar hospedagem no Complexo Pé da Serra.\n\nEntrada: ${dateBR(checkin.value)}\nSaída: ${dateBR(checkout.value)}\nAdultos: ${adults}\nCrianças: ${children}\n\nTenho interesse nos chalés com cama de casal. Podem informar a disponibilidade, a distribuição do grupo entre os chalés e os valores para essas datas?`;
    // A abertura acontece somente após o clique do visitante. Nenhuma reserva é confirmada pelo site.
    const destination=whatsappURL(message);
    window.open(destination,'_blank','noopener,noreferrer');
    const fallback=$('#booking-fallback');fallback.href=destination;fallback.hidden=false;
  });
  $('#guest-name')?.addEventListener('input',event=>event.target.setCustomValidity(''));

  const filters=$$('[data-filter]'),photos=$$('[data-photo]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    photos.forEach(photo=>photo.hidden=button.dataset.filter!=='all'&&photo.dataset.category!==button.dataset.filter);
  }));
  const lightbox=$('#lightbox');let current=0,collection=[];
  const showPhoto=index=>{
    if(!collection.length)return;
    current=(index+collection.length)%collection.length;
    const source=collection[current];$('#lightbox-image').src=source.dataset.photo;$('#lightbox-image').alt=source.dataset.caption;
    $('#lightbox-caption').textContent=source.dataset.caption;$('#lightbox-count').textContent=`${current+1} / ${collection.length}`;
  };
  photos.forEach(photo=>photo.addEventListener('click',()=>{
    collection=photos.filter(item=>!item.hidden);showPhoto(collection.indexOf(photo));lightbox.showModal();syncLock();
  }));
  $('.prev',lightbox)?.addEventListener('click',()=>showPhoto(current-1));
  $('.next',lightbox)?.addEventListener('click',()=>showPhoto(current+1));
  lightbox?.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();showPhoto(current+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(current-1);}
  });
  const videoTarget=$('[data-video-slot]');
  if(videoTarget){
    const path=videoTarget.dataset.videoSlot==='chales'?config.chaletsVideo:config.restaurantVideo;
    if(path&&/^img\/[a-zA-Z0-9_./-]+\.(mp4|webm)$/i.test(path)&&!path.includes('..')){
      const video=document.createElement('video');video.src=path;video.controls=true;video.playsInline=true;video.preload='metadata';video.className='video-player';video.poster=videoTarget.dataset.poster;video.setAttribute('aria-label','Vídeo de apresentação do Complexo Pé da Serra');
      video.addEventListener('loadedmetadata',()=>{videoTarget.hidden=false;});video.addEventListener('error',()=>{videoTarget.hidden=true;});videoTarget.append(video);
    }
  }
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const items=$$('.reveal');document.documentElement.classList.add('motion');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});items.forEach(el=>observer.observe(el));
  }
})();
