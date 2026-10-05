'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const menuButton = $('.menu-toggle');
const menu = $('#navigation');
function closeMenu() { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open', open); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
$$('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); });

function openDialog(id) { const dialog = document.getElementById(id); if (!dialog || dialog.open) return; dialog.showModal(); document.body.classList.add('dialog-open'); }
$$('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (dialog.id === 'enquiry-dialog') { $('#enquiry-form').reset(); $('#enquiry-preview').textContent = ''; draftText = ''; } });
});

const levelCopy = {
  new: 'Start med en introduktion. Du får styr på brikkerne og prøver små spil med andre, som også er nye.',
  some: 'Et begynderforløb giver dig et sikkert fundament. Du kan reglerne lidt, og nu skal du have styr på, hvorfor et træk er godt.',
  online: 'Prøv en åben klubaften eller et hold for let øvede. Fortæl klubben om din erfaring online, så du kan møde passende modstand.'
};
$$('[data-level]').forEach(button => button.addEventListener('click', () => { $$('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); $('#level-recommendation').textContent = levelCopy[button.dataset.level]; }));

const packages = {
  intro: { name: 'Første fælles træk', duration: '90 minutter', price: 3500, description: 'Introduktion, fælles opgaver, hyggespil, instruktør og lån af udstyr.' },
  course: { name: 'Lær skak med kollegerne', duration: '6 × 60 minutter', price: 9500, description: 'Et sammenhængende begynderforløb med samme instruktør, fælles opgaver og hjælp til at fortsætte.' },
  club: { name: 'Jeres egen skakklub', duration: 'Løbende samarbejde', price: null, description: 'Faste skakmøder, undervisning efter aftale og hjælp til en intern tovholder.' }
};
const money = value => new Intl.NumberFormat('da-DK', {maximumFractionDigits: 0}).format(value) + ' kr.';
function quoteState() {
  const key = $('#package-select')?.value || 'course';
  const participants = Number($('#participant-select')?.value || 12);
  const pack = packages[key];
  return { ...pack, key, participants, price: participants > 16 ? null : pack.price };
}
function updateQuote() {
  const q = quoteState();
  $('#quote-name').textContent = q.name.toUpperCase();
  $('#quote-details').textContent = `${q.duration} · ${q.participants} deltagere`;
  $('#quote-price').textContent = q.price === null ? 'Efter aftale' : money(q.price);
  $('#quote-per-person').textContent = q.price === null ? (q.participants > 16 ? 'Større grupper får et tilbud med passende instruktørkapacitet.' : 'Et forløb, der tilpasses jeres arbejdsplads.') : `Ca. ${money(q.price / q.participants)} pr. deltager for hele forløbet`;
  $('#quote-enquiry').dataset.package = `${q.name} · ${q.duration} · ${q.participants} deltagere · ${q.price === null ? 'pris efter aftale' : 'priseksempel ' + money(q.price)}`;
}
if ($('#package-select')) {
  $('#package-select').addEventListener('change', updateQuote);
  $('#participant-select').addEventListener('change', updateQuote);
  $$('[data-choose-package]').forEach(button => button.addEventListener('click', () => { $('#package-select').value = button.dataset.choosePackage; updateQuote(); $('#jeres-forloeb').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); $('#package-select').focus({ preventScroll: true }); }));
  updateQuote();
  $('#print-quote').addEventListener('click', () => {
    const q = quoteState();
    $('.quote-print-only')?.remove();
    const sheet = document.createElement('section'); sheet.className = 'quote-print-only';
    const blocks = [['h1','DIT NÆSTE TRÆK'],['p','Skak på arbejdspladsen · Overblik til intern drøftelse'],['h2',q.name],['p',`${q.duration} · ${q.participants} deltagere`],['p',q.price === null ? 'Pris efter aftale' : `Priseksempel: ${money(q.price)}`],['p',q.description],['p','Forslag til næste skridt: Aftal tidspunkt, lokale, deltagernes niveau og jeres kontaktperson. Et endeligt tilbud skal afklare omfang, transport og samlet pris.'],['p','Dette er et websitekoncept af Anders Vælds til Dansk Skak Union. Pakker og priser er eksempler, og overblikket er ikke et bindende tilbud.']];
    blocks.forEach(([tag,text]) => { const e = document.createElement(tag); e.textContent = text; sheet.append(e); });
    const url = document.createElement('a'); url.href = window.location.href.split('#')[0]; url.textContent = 'Se konceptet og firmapakkerne'; sheet.append(url); document.body.append(sheet); window.print();
  });
}

let draftText = '';
$$('[data-enquiry]').forEach(button => button.addEventListener('click', () => {
  const beginner = button.dataset.enquiry === 'beginner';
  $('#enquiry-form').reset(); $('#enquiry-form').hidden = false; $('#enquiry-result').hidden = true;
  $('#enquiry-title').textContent = beginner ? 'Prøv en tilmelding' : 'Forbered en forespørgsel';
  $('#enquiry-type').value = beginner ? 'Interesse for begynderhold' : 'Forespørgsel om firmaskak';
  $('#enquiry-package').value = button.dataset.package;
  $('#company-label').hidden = beginner;
  $('input[name="company"]').disabled = beginner;
  $('input[name="company"]').required = !beginner;
  draftText = ''; openDialog('enquiry-dialog');
}));
$('#enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const d = Object.fromEntries(new FormData(event.target));
  draftText = `${d.type}\n\nNavn: ${d.name.trim()}\nE-mail: ${d.email.trim()}\n${d.company ? `Virksomhed: ${d.company.trim()}\n` : ''}By/område: ${d.city.trim()}\nØnske: ${d.package}\n\n${d.message.trim() || 'Jeg vil gerne høre mere om muligheder, tidspunkter og den samlede pris.'}\n\n---\nKladde fra websitekonceptet Dit næste træk af Anders Vælds. Ingen oplysninger er sendt. Eventuelle priser er konceptpriser.\n`;
  $('#enquiry-preview').textContent = draftText;
  $('#enquiry-form').hidden = true; $('#enquiry-result').hidden = false;
  $('#enquiry-dialog').scrollTop = 0; $('#download-enquiry').focus();
});
$('#download-enquiry').addEventListener('click', () => { if (!draftText) return; const blob = new Blob(['\uFEFF'+draftText], {type:'text/plain;charset=utf-8'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'min-skakhenvendelse.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); });

function normalize(text) { return text.toLocaleLowerCase('da-DK').replaceAll('å','aa').replaceAll('æ','ae').replaceAll('ø','oe').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function searchClubs() {
  const query = normalize($('#club-search').value.trim()); let count = 0;
  $$('.region-card').forEach(card => { const match = !query || normalize(card.dataset.search).includes(query); card.hidden = !match; if(match) count++; });
  $('#search-count').textContent = query ? `${count} ${count === 1 ? 'område matcher' : 'områder matcher'} din søgning` : '8 regionale indgange til de lokale klubber';
  $('#no-results').hidden = count > 0; $('#clear-search').hidden = !query;
}
if ($('#club-search')) { $('#club-search').addEventListener('input', searchClubs); $('#clear-search').addEventListener('click', () => { $('#club-search').value=''; searchClubs(); $('#club-search').focus(); }); }
if ($('#copy-intro')) $('#copy-intro').addEventListener('click', async () => {
  const text='Hej! Jeg er voksen og vil gerne lære skak. Har I et begynderhold eller en aften, hvor jeg kan komme forbi? Jeg vil også gerne høre om pris, tidspunkter, og hvem der tager imod mig. Venlig hilsen';
  try { await navigator.clipboard.writeText(text); $('#copy-status').textContent = 'Teksten er kopieret. Du kan nu sætte den ind i en mail til klubben.'; }
  catch { $('#copy-status').textContent = text; $('#copy-status').setAttribute('tabindex','-1'); $('#copy-status').focus(); }
});
