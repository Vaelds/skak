const btn=document.querySelector('[data-menu-toggle]');
const nav=document.querySelector('[data-nav]');
if(btn&&nav){
  btn.addEventListener('click',()=>{
    const open=nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
}