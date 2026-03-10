(() => {
  const buttons = Array.from(document.querySelectorAll('.filter__btn'));
  const cards = Array.from(document.querySelectorAll('.card[data-category]'));
  const sections = Array.from(document.querySelectorAll('.section--cards'));
  const selectedAttraction = document.getElementById('selectedAttraction');
  const form = document.getElementById('inquiryForm');

  function setActive(btn) {
    buttons.forEach(b => b.classList.toggle('is-active', b === btn));
  }

  function applyFilter(filter) {
    if (filter === 'all') {
      cards.forEach(c => c.classList.remove('is-hidden'));
      sections.forEach(s => s.classList.remove('is-hidden'));
      return;
    }
    sections.forEach(s => {
      const sec = s.getAttribute('data-section');
      s.classList.toggle('is-hidden', sec !== filter);
    });
    cards.forEach(c => {
      c.classList.toggle('is-hidden', c.getAttribute('data-category') !== filter);
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setActive(btn);
      applyFilter(filter);
      const first = document.querySelector('.section--cards:not(.is-hidden)');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.classList.contains('js-vyplnit')) {
      const name = t.getAttribute('data-attraction') || '';
      if (selectedAttraction) {
        selectedAttraction.value = name;
        selectedAttraction.focus();
        const formBlock = document.getElementById('poptavka-form');
        if (formBlock) formBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    if (t.classList.contains('js-poptat')) {
      const name = t.getAttribute('data-attraction') || '';
      if (selectedAttraction && name) selectedAttraction.value = name;
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const date = (fd.get('date') || '').toString().trim();
      const place = (fd.get('place') || '').toString().trim();
      const attraction = (fd.get('attraction') || '').toString().trim();
      const note = (fd.get('note') || '').toString().trim();

      if (!name || !phone || !email || !attraction) {
        alert('Prosím vyplňte jméno, telefon, e‑mail a vybranou atrakci.');
        return;
      }

      const subject = 'Poptávka – ' + attraction;
      const lines = [
        'Dobrý den,',
        '',
        'Prosím o cenovou nabídku a dostupnost pro atrakci: ' + attraction,
        '',
        'Jméno: ' + name,
        'Telefon: ' + phone,
        'E‑mail: ' + email,
        (date ? ('Datum akce: ' + date) : 'Datum akce:'),
        (place ? ('Místo akce: ' + place) : 'Místo akce:'),
        '',
        (note ? ('Poznámka: ' + note) : 'Poznámka:'),
        '',
        'Děkuji.'
      ];
      const body = lines.join('\n');
      const url = 'mailto:vinelanpraha@seznam.cz?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      window.location.href = url;
    });
  }
})();

// Modal poptávka
(() => {
  const modal = document.getElementById('poptavkaModal');
  const modalInput = document.getElementById('modalSelectedAttraction');
  const modalForm = document.getElementById('modalInquiryForm');

  function openModal(attraction) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (modalInput) {
      modalInput.value = attraction || '';
      modalInput.focus();
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.classList.contains('js-open-poptavka')) {
      const attraction = t.getAttribute('data-attraction') || '';
      openModal(attraction);
      return;
    }

    if (t.getAttribute('data-close') === 'true') {
      closeModal();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(modalForm);
      const name = (fd.get('name') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const date = (fd.get('date') || '').toString().trim();
      const place = (fd.get('place') || '').toString().trim();
      const attraction = (fd.get('attraction') || '').toString().trim();
      const note = (fd.get('note') || '').toString().trim();

      if (!name || !phone || !email || !attraction) {
        alert('Prosím vyplňte jméno, telefon, e‑mail a vybranou atrakci.');
        return;
      }

      const subject = 'Poptávka – ' + attraction;
      const lines = [
        'Dobrý den,',
        '',
        'Prosím o cenovou nabídku a dostupnost pro atrakci: ' + attraction,
        '',
        'Jméno: ' + name,
        'Telefon: ' + phone,
        'E‑mail: ' + email,
        (date ? ('Datum akce: ' + date) : 'Datum akce:'),
        (place ? ('Místo akce: ' + place) : 'Místo akce:'),
        '',
        (note ? ('Poznámka: ' + note) : 'Poznámka:'),
        '',
        'Děkuji.'
      ];
      const body = lines.join('\n');
      const url = 'mailto:vinelanpraha@seznam.cz?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      window.location.href = url;
    });
  }
})();