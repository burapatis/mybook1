import Fuse from '{{ "fuse.min.mjs" | relURL }}'

{{ $searchDataFile := printf "%s.search-data.json" .Language.Name }}
{{ $searchData := resources.Get "search-data.json" | resources.ExecuteAsTemplate $searchDataFile . | resources.Minify | resources.Fingerprint }}
{{ $searchConfig := i18n "bookSearchConfig" | default "{}" }}

(function () {
  const searchDataURL = '{{ partial "docs/links/resource-precache" $searchData }}';
  const fuseConfig = Object.assign({{ $searchConfig }}, {
    includeScore: true,
    useExtendedSearch: true,
    fieldNormWeight: 1.2,
    threshold: 0.25,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.85 },
      { name: 'content', weight: 0.15 }
    ]
  });

  const input = document.querySelector('#book-search-input');
  const results = document.querySelector('#book-search-results');
  const MAX_RESULTS = 10;
  const FUSE_SCORE_CUTOFF = 0.35;

  if (!input) {
    return;
  }

  input.addEventListener('focus', init);
  input.addEventListener('keyup', search);
  document.addEventListener('keydown', focusOnKeyDown);

  function focusOnKeyDown(event) {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      input.focus();
      return;
    }

    if (input === document.activeElement) {
      return;
    }

    if (event.target.value !== undefined) {
      return;
    }

    if (event.key === '/') {
      event.preventDefault();
      input.focus();
    }
  }

  function init() {
    input.removeEventListener('focus', init);
    input.required = true;

    fetch(searchDataURL)
      .then(response => response.json())
      .then(pages => {
        window.bookSearchPages = pages;
        window.bookSearchIndex = new Fuse(pages, fuseConfig);
      })
      .then(() => { input.required = false; })
      .then(search);
  }

  function chapterNumber(title) {
    const match = title.match(/บทที่\s*(\d+)/);
    return match ? match[1] : null;
  }

  function performSearch(query) {
    const q = query.trim();
    if (!q || !window.bookSearchPages) {
      return [];
    }

    const pages = window.bookSearchPages;
    const ranked = [];
    const seen = new Set();

    function add(page, priority) {
      if (!page || seen.has(page.href)) {
        return;
      }
      seen.add(page.href);
      ranked.push({ page, priority });
    }

    const requestedChapter = q.match(/บทที่\s*(\d+)/);
    if (requestedChapter) {
      const number = requestedChapter[1];
      pages
        .filter(page => chapterNumber(page.title) === number)
        .forEach(page => add(page, 0));
    }

    pages
      .filter(page => page.title.includes(q))
      .forEach(page => add(page, 1));

    if (window.bookSearchIndex) {
      window.bookSearchIndex.search(q)
        .filter(hit => hit.score < FUSE_SCORE_CUTOFF)
        .forEach(hit => add(hit.item, pageKindPriority(hit.item) + 2));
    }

    pages
      .filter(page => shouldSearchContent(q, requestedChapter) && page.content.includes(q))
      .slice(0, 5)
      .forEach(page => add(page, pageKindPriority(page) + 4));

    ranked.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.page.title.localeCompare(b.page.title, 'th');
    });

    return ranked.slice(0, MAX_RESULTS).map(item => item.page);
  }

  function pageKindPriority(page) {
    if (page.searchKind === 'reference') {
      return 2;
    }
    if (page.searchKind === 'meta') {
      return 1;
    }
    return 0;
  }

  function shouldSearchContent(query, requestedChapter) {
    if (requestedChapter) {
      return false;
    }
    return query.length >= 3 || /[A-Za-z0-9]/.test(query);
  }

  function search() {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }

    if (!input.value) {
      return;
    }

    performSearch(input.value).forEach(function (page) {
      const li = element('<li><a href></a><small></small></li>');
      const a = li.querySelector('a');
      const small = li.querySelector('small');

      a.href = page.href;
      a.textContent = page.title;
      small.textContent = page.section;

      results.appendChild(li);
    });
  }

  function element(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.firstChild;
  }
})();
