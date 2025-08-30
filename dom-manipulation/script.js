let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "All" ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) return;

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteText").textContent = random.text;
  document.getElementById("quoteCategory").textContent = `— ${random.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please enter both quote and category.");

  quotes.push({ text, category });
  saveQuotes();
  updateCategoryFilter();
  alert("Quote added successfully!");
}

function updateCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = `<option value="All">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

// ✅ Export Quotes as JSON
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

// ✅ Import Quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategoryFilter();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Init
updateCategoryFilter();
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  document.getElementById("quoteText").textContent = q.text;
  document.getElementById("quoteCategory").textContent = `— ${q.category}`;
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
    filterQuotes(); // Show filtered quotes on reload
  }
}

// --- Filter quotes based on category ---
function filterQuotes() {
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

// --- Update categories when adding a new quote ---
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
    populateCategories(); // ✅ Refresh categories dynamically
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
  }
}
