(function(){
  const SEARCH_PAGE = 'search.html';

  function normalize(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function tokenize(query){
    return normalize(query).split(/\s+/).filter(Boolean);
  }

  function getIndex(){
    return Array.isArray(window.VINELAN_SEARCH_INDEX) ? window.VINELAN_SEARCH_INDEX : [];
  }

  function createSnippet(text, tokens){
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    const normalized = normalize(raw);
    let bestIndex = -1;
    let matchedToken = '';
    tokens.forEach(token => {
      const idx = normalized.indexOf(token);
      if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
        bestIndex = idx;
        matchedToken = token;
      }
    });
    if (bestIndex === -1) return raw.slice(0, 180) + (raw.length > 180 ? '…' : '');
    const start = Math.max(0, bestIndex - 70);
    const end = Math.min(raw.length, bestIndex + Math.max(matchedToken.length, 30) + 90);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < raw.length ? '…' : '';
    return prefix + raw.slice(start, end).trim() + suffix;
  }

  function scoreEntry(entry, tokens){
    const title = normalize(entry.title);
    const text = normalize(entry.text);
    const keywords = normalize((entry.keywords || []).join(' '));
    let score = 0;
    let matched = true;
    for (const token of tokens) {
      const inTitle = title.includes(token);
      const inKeywords = keywords.includes(token);
      const inText = text.includes(token);
      if (!inTitle && !inKeywords && !inText) {
        matched = false;
        break;
      }
      if (inTitle) score += 80;
      else if (inKeywords) score += 40;
      else if (inText) score += 20;
      if (title === token) score += 50;
    }
    if (!matched) return -1;
    if (entry.type === 'attraction') score += 10;
    if (entry.type === 'section') score += 5;
    return score;
  }

  function searchSite(query){
    const tokens = tokenize(query);
    if (!tokens.length) return [];
    return getIndex()
      .map(entry => {
        const score = scoreEntry(entry, tokens);
        return score < 0 ? null : Object.assign({}, entry, {
          score,
          snippet: createSnippet(entry.text, tokens)
        });
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'cs'))
      .slice(0, 60);
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function highlightHtml(text, query){
    const safe = escapeHtml(text);
    const tokens = tokenize(query).sort((a,b)=>b.length-a.length);
    if (!tokens.length) return safe;
    let html = safe;
    tokens.forEach(token => {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('(' + escapedToken + ')', 'ig');
      html = html.replace(regex, '<mark>$1</mark>');
    });
    return html;
  }

  function goToResults(query){
    const normalized = String(query || '').trim();
    if (!normalized) return;
    window.location.href = SEARCH_PAGE + '?q=' + encodeURIComponent(normalized);
  }

  function bindSearchForms(){
    document.querySelectorAll('[data-site-search-form]').forEach(form => {
      form.addEventListener('submit', function(event){
        event.preventDefault();
        const input = form.querySelector('[data-site-search-input]');
        goToResults(input ? input.value : '');
      });
    });
  }

  function renderSearchResults(){
    const root = document.querySelector('[data-search-results]');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const input = document.querySelector('[data-search-page-input]');
    const title = document.querySelector('[data-search-title]');
    const meta = document.querySelector('[data-search-meta]');

    if (input) input.value = query;

    const results = searchSite(query);

    if (title) {
      title.textContent = query.trim() ? 'Výsledky hledání pro „' + query.trim() + '“' : 'Vyhledávání na webu';
    }

    if (meta) {
      meta.textContent = query.trim()
        ? (results.length ? 'Nalezeno ' + results.length + ' relevantních výsledků.' : 'Nic jsme nenašli. Zkuste jiné slovo nebo obecnější výraz.')
        : 'Prohledejte celý web Vinelan včetně atrakcí, stránek a hlavních sekcí.';
    }

    if (!query.trim()) {
      root.innerHTML = '<div class="search-empty">Zadejte hledaný výraz, například <strong>skákací hrad</strong>, <strong>Praha</strong> nebo <strong>poptávka</strong>.</div>';
      return;
    }

    if (!results.length) {
      root.innerHTML = '<div class="search-empty">Pro tento dotaz jsme nenašli žádnou shodu.</div>';
      return;
    }

    root.innerHTML = results.map(result => {
      const typeLabel = {
        attraction: 'Atrakce',
        section: 'Sekce',
        page: 'Stránka'
      }[result.type] || 'Výsledek';
      return '<article class="search-result">'
        + '<div class="search-result__type">' + typeLabel + '</div>'
        + '<h2 class="search-result__title"><a href="' + escapeHtml(result.url) + '">' + highlightHtml(result.title, query) + '</a></h2>'
        + '<p class="search-result__snippet">' + highlightHtml(result.snippet, query) + '</p>'
        + '<a class="search-result__link" href="' + escapeHtml(result.url) + '">Otevřít výsledek</a>'
        + '</article>';
    }).join('');
  }

  function slugify(value){
    return normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function applyAttractionFind(){
    const params = new URLSearchParams(window.location.search);
    const targetSlug = params.get('find');
    if (!targetSlug) return;

    const cards = Array.from(document.querySelectorAll('[data-attraction]'));
    if (!cards.length) return;

    let firstMatch = null;
    const used = {};
    cards.forEach((card, index) => {
      const name = card.getAttribute('data-attraction') || card.querySelector('h2,h3')?.textContent || ('atrakce-' + (index + 1));
      let slug = slugify(name);
      used[slug] = (used[slug] || 0) + 1;
      if (used[slug] > 1) slug = slug + '-' + used[slug];
      card.id = slug;
      card.classList.remove('search-match');
      if (slug === targetSlug) {
        card.classList.add('search-match');
        if (!firstMatch) firstMatch = card;
      }
    });

    if (firstMatch) {
      setTimeout(() => {
        firstMatch.scrollIntoView({behavior:'smooth', block:'center'});
      }, 120);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    bindSearchForms();
    renderSearchResults();
    applyAttractionFind();
  });

  window.VinelanSearch = {
    searchSite,
    goToResults
  };
})();
