let quotes = [];

// --- Save quotes to localStorage ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- Load quotes from localStorage ---
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// --- Display a quote ---
function displayQuote(quote) {
  document.getElementById("quoteText").textContent = quote.text;
  document.getElementById("quoteCategory").textContent = quote.category;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// --- Show a random quote ---
function showNewQuote() {
  if (quotes.length === 0) return;

  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  let filteredQuotes =
    selectedCategory === "All"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomQuote =
      filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    displayQuote(randomQuote);
  } else {
    document.getElementById("quoteText").textContent =
      "No quotes available for this category.";
    document.getElementById("quoteCategory").textContent = "";
  }
}

// --- Add a new quote ---
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim() || "Uncategorized"
  };

  if (newQuote.text) {
    quotes.push(newQuote);
    saveQuotes();
    populateCategories(); // update categories dynamically
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
  }
}

// --- Export quotes to JSON file ---
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// --- Import quotes from JSON file ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Populate categories dynamically ---
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = ["All", ...new Set(quotes.map(q => q.category))];

  // Clear old options
  categoryFilter.innerHTML = "";

  // Add new options
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter && uniqueCategories.includes(lastFilter)) {
    categoryFilter.value = lastFilter;
    filterQuote();
  }
}

// --- Filter quotes based on category ---
function filterQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  // Save selected filter to localStorage
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes =
    selectedCategory === "All"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomQuote =
      filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    displayQuote(randomQuote);
  } else {
    document.getElementById("quoteText").textContent =
      "No quotes available for this category.";
    document.getElementById("quoteCategory").textContent = "";
  }
}

// --- Initialize app ---
window.onload = function () {
  loadQuotes();
  populateCategories();

  // Restore last viewed quote from sessionStorage
  const lastViewed = sessionStorage.getItem("lastViewedQuote");
  if (lastViewed) {
    displayQuote(JSON.parse(lastViewed));
  } else {
    filterQuote(); // show something at start
  }

  // Event listeners
  document.getElementById("newQuote").addEventListener("click", showNewQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("categoryFilter").addEventListener("change", filterQuote);
};
