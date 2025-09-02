// ==============================
// Dynamic Quote Generator with Sync
// ==============================

// Initial quotes (fallback if none in storage)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

// Elements
const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");
const categoryFilter = document.getElementById("categoryFilter");

// ==============================
// Local Storage Helpers
// ==============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

// ==============================
// Populate Categories
// ==============================
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  // Restore last selected category
  const saved = localStorage.getItem("selectedCategory");
  if (saved && categories.includes(saved)) {
    categoryFilter.value = saved;
  }
}

// ==============================
// Quote Display
// ==============================
function showRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
    return;
  }
  const random = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteText.textContent = random.text;
  quoteCategory.textContent = `Category: ${random.category}`;
}

// ==============================
// Filtering
// ==============================
function filterQuotes() {
  const selected = categoryFilter.value;
  saveSelectedCategory(selected);

  if (selected === "all") {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    showRandomQuote(filtered);
  }
}

// ==============================
// Add New Quote
// ==============================
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
});

// ==============================
// Export / Import
// ==============================
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes = imported;
        saveQuotes();
        populateCategories();
        filterQuotes();
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ==============================
// Server Sync Simulation
// ==============================
async function fetchFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await res.json();

    // Convert mock server data to quote format
    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Conflict resolution: server wins
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    filterQuotes();

    notifyUser("Quotes synced from server (server data takes precedence).");
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

// Notify user of sync
function notifyUser(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.background = "#e0ffe0";
  div.style.border = "1px solid #0a0";
  div.style.padding = "8px";
  div.style.marginTop = "10px";
  div.style.fontSize = "0.9rem";

  document.body.insertBefore(div, document.body.firstChild);

  setTimeout(() => div.remove(), 4000);
}

// Auto-sync every 20 seconds
setInterval(fetchFromServer, 20000);

// ==============================
// Event Listeners
// ==============================
document.getElementById("newQuote").addEventListener("click", filterQuotes);

// ==============================
// Init
// ==============================
populateCategories();
filterQuotes();
