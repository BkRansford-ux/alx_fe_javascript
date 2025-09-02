// ==============================
// Initial Data
// ==============================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Inspiration" }
];

// ==============================
// Save & Load Helpers
// ==============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==============================
// Quote Display
// ==============================
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    document.getElementById("quoteText").textContent = "No quotes available.";
    document.getElementById("quoteCategory").textContent = "";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteText").textContent = random.text;
  document.getElementById("quoteCategory").textContent = `— ${random.category}`;
}

// ==============================
// Category Handling
// ==============================
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  const savedCategory = localStorage.getItem("selectedCategory") || "All";
  categoryFilter.value = savedCategory;
}

function getFilteredQuotes() {
  const category = document.getElementById("categoryFilter").value;
  if (category === "All") return quotes;
  return quotes.filter(q => q.category === category);
}

function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);
  showRandomQuote();
}

// ==============================
// Add New Quote
// ==============================
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please enter both quote and category.");

  const newQuote = { text, category };

  // Save locally
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Post to server (mock API)
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });
    notifyUser("Quote added and synced to server.");
  } catch {
    notifyUser("Quote added locally, but failed to sync to server.");
  }

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ==============================
// Export & Import
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
        notifyUser("Quotes imported successfully.");
      }
    } catch {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

// ==============================
// Server Sync
// ==============================
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await res.json();

    return serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Failed to fetch quotes from server:", err);
    return [];
  }
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Conflict resolution: server data takes precedence
    const localTexts = new Set(serverQuotes.map(q => q.text));
    const mergedQuotes = [...serverQuotes, ...quotes.filter(q => !localTexts.has(q.text))];

    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    notifyUser("Quotes synced: server data updated local storage.");
  } catch (err) {
    console.error("Sync failed:", err);
    notifyUser("Failed to sync with server.");
  }
}

// Run sync periodically (every 20s)
setInterval(syncQuotes, 20000);

// ==============================
// Notifications
// ==============================
function notifyUser(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.background = "#e0f7fa";
  div.style.border = "1px solid #00796b";
  div.style.padding = "8px";
  div.style.marginTop = "10px";
  div.style.fontSize = "0.9rem";
  div.style.borderRadius = "4px";

  document.body.insertBefore(div, document.body.firstChild);
  setTimeout(() => div.remove(), 4000);
}

// ==============================
// Event Listeners
// ==============================
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Init
populateCategories();
filterQuotes();
