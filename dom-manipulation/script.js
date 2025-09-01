// Quotes array (load from localStorage if available)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote (filtered by category if applied)
function displayQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length > 0) {
    const random = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[random];
    document.getElementById("quoteText").textContent = quote.text;
    document.getElementById("quoteCategory").textContent = quote.category;
  } else {
    document.getElementById("quoteText").textContent = "No quotes available for this category.";
    document.getElementById("quoteCategory").textContent = "";
  }
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = ""; // Clear old options

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category if exists
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
    filterQuote();
  }
}

// Filter quotes by category
function filterQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  // Save filter choice
  localStorage.setItem("selectedCategory", selectedCategory);

  // Filter
  let filteredQuotes;
  if (selectedCategory === "All") {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  displayQuote(filteredQuotes);
}

// Add a new quote
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // update categories dropdown
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both text and category!");
  }
});

// Show new quote button
document.getElementById("newQuote").addEventListener("click", () => {
  filterQuote(); // applies filter + shows random
});

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
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// On page load
window.onload = function () {
  populateCategories();
  filterQuote();
};

// Quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

// Display a random quote
function showRandomQuote() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  let filteredQuotes =
    categoryFilter === "All"
      ? quotes
      : quotes.filter(q => q.category === categoryFilter);

  if (filteredQuotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  document.getElementById("quoteText").textContent = quote.text;
  document.getElementById("quoteCategory").textContent = `— ${quote.category}`;
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Add a new quote
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added!");
  }
});

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat + " Categories";
    categoryFilter.appendChild(option);
  });

  // Restore last selected category if saved
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && uniqueCategories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  }
}

// Filter quotes based on dropdown
function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save to localStorage
  localStorage.setItem("selectedCategory", selectedCategory);

  // Update the displayed quote(s)
  showRandomQuote();
}

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
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
window.onload = () => {
  populateCategories();
  filterQuote(); // restore and show based on last saved category
};
