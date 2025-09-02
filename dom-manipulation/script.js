// Quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a quote in the quoteDisplay section
function showQuote(quote) {
  document.getElementById("quoteText").textContent = quote.text;
  document.getElementById("quoteCategory").textContent = `— ${quote.category}`;
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore last selected category if saved
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && uniqueCategories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  }
}

// Filter quotes based on dropdown
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save to localStorage
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    showQuote(filteredQuotes[randomIndex]);
  } else {
    document.getElementById("quoteText").textContent = "No quotes available for this category.";
    document.getElementById("quoteCategory").textContent = "";
  }
}

// Add a new quote
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both text and category!");
  }
});

// Export quotes to JSON
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

// Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Init
document.getElementById("newQuote").addEventListener("click", filterQuotes);
window.onload = () => {
  populateCategories();
  filterQuotes();
};
