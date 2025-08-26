// script.js

document.addEventListener('DOMContentLoaded', () => {
  // ===== Data =====
  // Start with a few quotes
  const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not in what you have, but who you are.", category: "Success" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" }
  ];

  // ===== DOM references =====
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn   = document.getElementById('newQuote');
  const toolbar       = document.querySelector('.toolbar');

  // Will be created dynamically:
  let categorySelect = null;

  // ===== Helpers =====
  const renderQuote = (q) => {
    if (!q) {
      quoteDisplay.textContent = "No quotes available for this category.";
      return;
    }
    quoteDisplay.innerHTML = `"${q.text}"<br><small>— ${q.category}</small>`;
  };

  const getUniqueCategories = () => {
    const set = new Set(quotes.map(q => q.category.trim()).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  };

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ===== Required by task: showRandomQuote =====
  function showRandomQuote() {
    const selected = categorySelect ? categorySelect.value : "All";
    const pool = (selected === "All")
      ? quotes
      : quotes.filter(q => q.category.toLowerCase() === selected.toLowerCase());

    if (pool.length === 0) {
      renderQuote(null);
      return;
    }
    renderQuote(pickRandom(pool));
  }

  // ===== Build category filter (advanced DOM manipulation) =====
  function createCategoryFilter() {
    const select = document.createElement('select');
    select.id = 'categoryFilter';

    // fill options
    const categories = getUniqueCategories();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });

    // When user changes category, show a quote from that category
    select.addEventListener('change', showRandomQuote);

    // Place it at the beginning of toolbar
    toolbar.prepend(select);
    categorySelect = select;
  }

  // ===== Required by task: createAddQuoteForm =====
  function createAddQuoteForm() {
    const form = document.createElement('div');
    form.className = 'form';

    // Title (optional)
    const title = document.createElement('h3');
    title.textContent = 'Add a new quote';
    title.style.marginTop = '0';
    form.appendChild(title);

    // Inputs row
    const row1 = document.createElement('div');
    row1.className = 'row';

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';

    row1.appendChild(quoteInput);
    row1.appendChild(categoryInput);

    // Actions row
    const row2 = document.createElement('div');
    row2.className = 'row';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Quote';

    row2.appendChild(addBtn);

    // Note
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = 'Tip: categories update automatically (and appear in the filter).';

    form.appendChild(row1);
    form.appendChild(row2);
    form.appendChild(note);

    // Add behavior (no inline onclick — we use addEventListener)
    addBtn.addEventListener('click', () => {
      const text = quoteInput.value.trim();
      const category = categoryInput.value.trim();

      if (!text || !category) {
        alert('Please enter both a quote and a category.');
        return;
      }

      // Update data
      quotes.push({ text, category });

      // Clear inputs
      quoteInput.value = '';
      categoryInput.value = '';

      // Rebuild category options if a new category was introduced
      const current = categorySelect.value;
      const newCats = getUniqueCategories();

      // Diff: if options changed, rebuild the select
      const prevOptions = Array.from(categorySelect.options).map(o => o.value);
      const changed = newCats.length !== prevOptions.length || newCats.some((c, i) => c !== prevOptions[i]);

      if (changed) {
        categorySelect.innerHTML = '';
        newCats.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          categorySelect.appendChild(opt);
        });
        // try to keep previous selection if still valid
        if (newCats.includes(current)) categorySelect.value = current;
      }

      // Give immediate feedback
      renderQuote({ text, category });
    });

    // Insert after the quote display
    quoteDisplay.after(form);
  }

  // ===== Wire up “Show New Quote” button =====
  newQuoteBtn.addEventListener('click', showRandomQuote);

  // ===== Boot =====
  createCategoryFilter();
  createAddQuoteForm();
  // Optionally show a first quote automatically:
  // showRandomQuote();
});
