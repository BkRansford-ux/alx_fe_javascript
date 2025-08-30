// dom-manipulation/script.js

document.addEventListener('DOMContentLoaded', () => {
  // --------- State ---------
  /** @type {{text:string, category:string}[]} */
  let quotes = [];

  // --------- Elements ---------
  const quoteTextEl = document.getElementById('quoteText');
  const quoteCategoryEl = document.getElementById('quoteCategory');
  const newQuoteBtn = document.getElementById('newQuote');
  const categoryFilter = document.getElementById('categoryFilter');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const exportBtn = document.getElementById('exportJson');
  const importFileInput = document.getElementById('importFile');

  // --------- Storage Keys ---------
  const LS_QUOTES_KEY = 'quotes';
  const SS_LAST_QUOTE_KEY = 'lastQuote';
  const SS_CATEGORY_KEY = 'lastCategory';

  // --------- Defaults (used if no localStorage yet) ---------
  const DEFAULT_QUOTES = [
    { text: 'Simplicity is the soul of efficiency.', category: 'Productivity' },
    { text: 'Programs must be written for people to read.', category: 'Programming' },
    { text: 'The only way to learn a new programming language is by writing programs in it.', category: 'Programming' },
    { text: 'The secret of getting ahead is getting started.', category: 'Motivation' },
    { text: 'First, solve the problem. Then, write the code.', category: 'Programming' }
  ];

  // --------- Helpers: Local / Session Storage ---------
  function saveQuotes() {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  }

  function loadQuotes() {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // sanitize a bit
          quotes = parsed
            .filter(q => q && typeof q.text === 'string' && typeof q.category === 'string')
            .map(q => ({ text: q.text.trim(), category: q.category.trim() }))
            .filter(q => q.text.length > 0 && q.category.length > 0);
          if (quotes.length === 0) {
            quotes = [...DEFAULT_QUOTES];
            saveQuotes();
          }
        } else {
          quotes = [...DEFAULT_QUOTES];
          saveQuotes();
        }
      } catch {
        quotes = [...DEFAULT_QUOTES];
        saveQuotes();
      }
    }
  }

  function saveLastQuoteToSession(quote) {
    try {
      sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
    } catch {}
  }

  function loadLastQuoteFromSession() {
    try {
      const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
      if (!raw) return null;
      const q = JSON.parse(raw);
      if (q && typeof q.text === 'string' && typeof q.category === 'string') {
        return q;
      }
    } catch {}
    return null;
  }

  function saveCategoryToSession(value) {
    try {
      sessionStorage.setItem(SS_CATEGORY_KEY, value);
    } catch {}
  }

  function loadCategoryFromSession() {
    try {
      return sessionStorage.getItem(SS_CATEGORY_KEY) || 'All';
    } catch {
      return 'All';
    }
  }

  // --------- UI: Populate category select ---------
  function uniqueCategories() {
    return Array.from(new Set(quotes.map(q => q.category))).sort((a, b) => a.localeCompare(b));
  }

  function refreshCategoryOptions() {
    const current = categoryFilter.value || 'All';
    // Reset to All, then add unique categories
    categoryFilter.innerHTML = '<option value="All">All</option>';
    uniqueCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
    // Restore previous selection if still present
    const remembered = loadCategoryFromSession();
    if ([...categoryFilter.options].some(o => o.value === remembered)) {
      categoryFilter.value = remembered;
    } else {
      categoryFilter.value = 'All';
    }
  }

  // --------- Rendering ---------
  function renderQuote(quote) {
    quoteTextEl.textContent = quote.text;
    quoteCategoryEl.textContent = `— ${quote.category}`;
    saveLastQuoteToSession(quote);
  }

  function showRandomQuote() {
    const cat = categoryFilter.value;
    const pool = cat === 'All' ? quotes : quotes.filter(q => q.category === cat);
    if (pool.length === 0) {
      quoteTextEl.textContent = 'No quotes match this category yet.';
      quoteCategoryEl.textContent = '';
      return;
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    renderQuote(chosen);
  }

  // --------- Add Quote ---------
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (!text || !category) {
      alert('Please provide both quote text and category.');
      return;
    }
    quotes.push({ text, category });
    saveQuotes();

    // Refresh categories and optionally select the newly added category
    refreshCategoryOptions();
    categoryFilter.value = category;
    saveCategoryToSession(category);

    // Clear inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Show it immediately
    renderQuote({ text, category });
  }

  // --------- Export / Import JSON ---------
  function exportToJson() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'quotes.json';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error('JSON must be an array');
        const cleaned = imported
          .filter(q => q && typeof q.text === 'string' && typeof q.category === 'string')
          .map(q => ({ text: q.text.trim(), category: q.category.trim() }))
          .filter(q => q.text && q.category);

        if (cleaned.length === 0) {
          alert('No valid quotes found in the file.');
          return;
        }

        // Merge (simple append). If you want de-duplication, you can add a Set here.
        quotes.push(...cleaned);
        saveQuotes();
        refreshCategoryOptions();
        showRandomQuote();
        alert('Quotes imported successfully!');
      } catch (err) {
        alert('Invalid JSON file.');
      } finally {
        // allow re-importing same file by resetting input
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  // --------- Wire up events ---------
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportToJson);
  importFileInput.addEventListener('change', importFromJsonFile);
  categoryFilter.addEventListener('change', () => {
    saveCategoryToSession(categoryFilter.value);
    showRandomQuote();
  });

  // --------- Init ---------
  loadQuotes();
  refreshCategoryOptions();

  // Restore last category, if possible (already done in refreshCategoryOptions)
  const last = loadLastQuoteFromSession();
  if (last) {
    renderQuote(last);
  } else {
    showRandomQuote();
  }
});
