// Array to store quotes - will be loaded from localStorage
let quotes = [];

let currentCategory = "all";

// Default quotes to use if localStorage is empty
const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Wisdom" },
  { text: "You miss 100% of the shots you don't take.", category: "Motivation" },
  { text: "Whether you think you can or you think you can't, you're right.", category: "Mindset" }
];

// ==================== LOCAL STORAGE FUNCTIONS ====================

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    console.log('Quotes loaded from localStorage:', quotes.length);
  } else {
    // Use default quotes if nothing in localStorage
    quotes = [...defaultQuotes];
    saveQuotes();
    console.log('Default quotes loaded');
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  console.log('Quotes saved to localStorage:', quotes.length);
}

// ==================== SESSION STORAGE FUNCTIONS ====================

// Save last viewed quote to sessionStorage
function saveLastViewedQuote(quote) {
  const quoteData = {
    text: quote.text,
    category: quote.category,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quoteData));
}

// Load last viewed quote from sessionStorage
function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastQuote) {
    return JSON.parse(lastQuote);
  }
  return null;
}

// Save current category filter to sessionStorage
function saveCurrentCategory(category) {
  sessionStorage.setItem('currentCategory', category);
}

// Load current category filter from sessionStorage
function loadCurrentCategory() {
  const savedCategory = sessionStorage.getItem('currentCategory');
  return savedCategory || 'all';
}

// ==================== QUOTE MANAGEMENT FUNCTIONS ====================

// Function to get unique categories
function getCategories() {
  const categories = quotes.map(q => q.category);
  return [...new Set(categories)];
}

// Function to create category filter dropdown
function createCategoryFilter() {
  const container = document.getElementById('categoryFilterContainer');
  container.innerHTML = '';
  
  const select = document.createElement('select');
  select.id = 'categoryFilter';
  
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  select.appendChild(allOption);
  
  const categories = getCategories();
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  
  // Restore saved category from sessionStorage
  select.value = currentCategory;
  
  select.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    saveCurrentCategory(currentCategory);
    showRandomQuote();
  });
  
  container.appendChild(select);
}

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';
  
  let filteredQuotes = currentCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === currentCategory);
  
  if (filteredQuotes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-state';
    emptyMsg.textContent = 'No quotes available in this category.';
    quoteDisplay.appendChild(emptyMsg);
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  const quoteText = document.createElement('p');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  const quoteCategory = document.createElement('p');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `— ${randomQuote.category}`;
  
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  // Save to sessionStorage
  saveLastViewedQuote(randomQuote);
  
  updateStats();
}

// Function to create the add quote form
function createAddQuoteForm() {
  const container = document.getElementById('addQuoteFormContainer');
  container.innerHTML = '';
  
  const title = document.createElement('h2');
  title.className = 'form-title';
  title.textContent = 'Add Your Own Quote';
  
  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';
  
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';
  
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;
  
  container.appendChild(title);
  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// Function to add a new quote
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  if (quoteText === '' || quoteCategory === '') {
    alert('Please enter both a quote and a category!');
    return;
  }
  
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };
  
  quotes.push(newQuote);
  
  // Save to localStorage
  saveQuotes();
  
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  createCategoryFilter();
  
  const select = document.getElementById('categoryFilter');
  select.value = quoteCategory;
  currentCategory = quoteCategory;
  saveCurrentCategory(currentCategory);
  
  showRandomQuote();
  
  alert('Quote added successfully and saved to local storage!');
}

// Function to update statistics
function updateStats() {
  const statsDisplay = document.getElementById('statsDisplay');
  const totalQuotes = quotes.length;
  const totalCategories = getCategories().length;
  
  const lastQuote = loadLastViewedQuote();
  let lastViewedText = '';
  if (lastQuote) {
    const timeAgo = new Date(lastQuote.timestamp).toLocaleTimeString();
    lastViewedText = ` | Last viewed: ${timeAgo}`;
  }
  
  statsDisplay.textContent = `Total Quotes: ${totalQuotes} | Categories: ${totalCategories}${lastViewedText}`;
}

// ==================== JSON IMPORT/EXPORT FUNCTIONS ====================

// Export quotes to JSON file
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `quotes_export_${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
  
  alert('Quotes exported successfully!');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      // Validate the imported data
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      // Validate each quote has required properties
      const validQuotes = importedQuotes.filter(quote => {
        return quote.text && quote.category && 
               typeof quote.text === 'string' && 
               typeof quote.category === 'string';
      });
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file');
      }
      
      // Add imported quotes to existing quotes
      quotes.push(...validQuotes);
      
      // Save to localStorage
      saveQuotes();
      
      // Refresh the UI
      createCategoryFilter();
      showRandomQuote();
      
      alert(`Successfully imported ${validQuotes.length} quote(s)!`);
      
    } catch (error) {
      alert(`Error importing quotes: ${error.message}`);
      console.error('Import error:', error);
    }
    
    // Reset the file input
    event.target.value = '';
  };
  
  fileReader.onerror = function() {
    alert('Error reading file. Please try again.');
  };
  
  fileReader.readAsText(file);
}

// ==================== INITIALIZATION ====================

// Initialize the application
function init() {
  // Load quotes from localStorage
  loadQuotes();
  
  // Load saved category from sessionStorage
  currentCategory = loadCurrentCategory();
  
  // Create UI elements
  createCategoryFilter();
  createAddQuoteForm();
  
  // Display a quote
  const lastQuote = loadLastViewedQuote();
  if (lastQuote && currentCategory === 'all') {
    // Show the last viewed quote if available (session continuity)
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';
    
    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${lastQuote.text}"`;
    
    const quoteCategory = document.createElement('p');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `— ${lastQuote.category} (Last viewed)`;
    
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
  } else {
    showRandomQuote();
  }
  
  updateStats();
  
  // Add event listeners
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  
  // Export button
  document.getElementById('exportQuotes').addEventListener('click', exportToJson);
  
  // Import button (triggers hidden file input)
  document.getElementById('importQuotes').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  
  // File input change event
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  
  console.log('Application initialized successfully');
  console.log('Quotes in memory:', quotes.length);
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
