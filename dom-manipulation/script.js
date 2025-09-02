// ==============================
// Dynamic Quote Generator Script
// ==============================

// Default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
];

const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");
const categoryFilter = document.getElementById("categoryFilter");

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote
function displayRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteText.textContent = quote.text;
  quoteCategory.textContent = `Category: ${quote.category}`;
}

// Populate categories dynamically
function populateCategories() {
  const uniqueCategories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastSelected = localStorage.getItem("selectedCategory") || "All";
  categoryFilter.value = lastSelected;
}

// Filter quotes based on category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  let filtered = quotes;
  if (selected !== "All") {
    filtered = quotes.filter(q => q.category === selected);
  }

  displayRandomQuote(filtered);
}

// Add a new quote
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

// Show new quote button
document.getElementById("newQuote").addEventListener("click", filterQuotes);

// Export quotes to JSON file
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

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = [...quotes, ...importedQuotes];
        saveQuotes();
        populateCategories();
        filterQuotes();
      }
    } catch (err) {
      console.error("Invalid JSON file:", err);
    }
  };
  reader.readAsText(file);
}

// ==============================
// Server Sync Simulation
// ==============================
async function fetchQuotesFromServer() {
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
setInterval(fetchQuotesFromServer, 20000);

// ==============================
// Initialize
// ==============================
window.onload = () => {
  populateCategories();
  filterQuotes();
};
