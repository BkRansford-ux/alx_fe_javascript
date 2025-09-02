// ==============================
// Dynamic Quote Generator Script
// ==============================

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
];

const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");
const categoryFilter = document.getElementById("categoryFilter");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

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

function populateCategories() {
  const uniqueCategories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastSelected = localStorage.getItem("selectedCategory") || "All";
  categoryFilter.value = lastSelected;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  let filtered = quotes;
  if (selected !== "All") {
    filtered = quotes.filter(q => q.category === selected);
  }

  displayRandomQuote(filtered);
}

// ==============================
// Add new quote + POST to server
// ==============================
document.getElementById("addQuoteBtn").addEventListener("click", async () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // POST new quote to mock server
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newQuote)
      });
      const result = await response.json();
      console.log("Posted to server:", result);
      notifyUser("New quote synced with server.");
    } catch (err) {
      console.error("Failed to post to server:", err);
      notifyUser("Failed to sync with server.");
    }
  }
});

// ==============================
// Export / Import
// ==============================
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

    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    filterQuotes();

    notifyUser("Quotes synced from server (server data takes precedence).");
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

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

// Auto-sync every 20s
setInterval(fetchQuotesFromServer, 20000);

// Init
window.onload = () => {
  populateCategories();
  filterQuotes();
};
