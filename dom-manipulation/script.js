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

// Save last selected category filter to localStorage
function saveLastSelectedCategory(category) {
  localStorage.setItem('lastSelectedCategory', category);
  console.log('Last selected category saved:', category);
}

// Load last selected category filter from localStorage
function loadLastSelectedCategory() {
  const savedCategory = localStorage.getItem('lastSelectedCategory');
  return savedCategory || 'all';
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

// ==================== CATEGORY MANAGEMENT FUNCTIONS ====================

// Function to get unique categories from quotes array
function getCategories() {
  const categories = quotes.map(q => q.category);
  return [...new Set(categories)].sort(); // Sort alphabetically
}

// Populate categories dynamically in the dropdown
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  
  if (!select) {
    console.error('Category filter element not found');
    return;
  }
  
  // Store current selection
  const currentSelection = select.value || currentCategory;
  
  // Clear existing options
  select.innerHTML = '';
  
  // Add "All Categories" option
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  select.appendChild(allOption);
  
  // Get and add category options
  const categories = getCategories();
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  const categoryExists = categories.includes(currentSelection) || currentSelection === 'all';
  select.value = categoryExists ? currentSelection : 'all';
  
  console.log('Categories populated:', categories.length);
}

// Filter quotes based on selected category
function filterQuotes() {
  const select = document.getElementById('categoryFilter');
  const selectedCategory = select.value;
  
  // Update current category
  currentCategory = selectedCategory;
  
  // Save to localStorage for persistence across sessions
  saveLastSelectedCategory(selectedCategory);
  
  // Save to sessionStorage for current session
  saveCurrentCategory(selectedCategory);
  
  console.log('Filtering by category:', selectedCategory);
  
  // Display filtered quotes
  displayFilteredQuotes();
}

// Display quotes based on current filter
function displayFilteredQuotes() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';
  
  // Get filtered quotes
  let filteredQuotes = currentCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === currentCategory);
  
  if (filteredQuotes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-state';
    emptyMsg.textContent = `No quotes available in the "${currentCategory}" category.`;
    quoteDisplay.appendChild(emptyMsg);
    updateStats();
    return;
  }
  
  // Display random quote from filtered results
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

// ==================== QUOTE DISPLAY FUNCTIONS ====================

// Function to create category filter dropdown
function createCategoryFilter() {
  const container = document.getElementById('categoryFilterContainer');
  container.innerHTML = '';
  
  const select = document.createElement('select');
  select.id = 'categoryFilter';
  select.onchange = filterQuotes;
  
  container.appendChild(select);
  
  // Populate categories
  populateCategories();
  
  // Restore last selected category from localStorage
  const lastCategory = loadLastSelectedCategory();
  currentCategory = lastCategory;
  select.value = lastCategory;
  
  console.log('Category filter created with selection:', lastCategory);
}

// Function to display a random quote (legacy support)
function showRandomQuote() {
  displayFilteredQuotes();
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
  
  // Check if this is a new category
  const existingCategories = getCategories();
  const isNewCategory = !existingCategories.includes(quoteCategory);
  
  // Add quote to array
  quotes.push(newQuote);
  
  // Save to localStorage
  saveQuotes();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Update categories dropdown if new category was added
  if (isNewCategory) {
    console.log('New category detected:', quoteCategory);
    populateCategories();
  }
  
  // Set filter to the new quote's category
  const select = document.getElementById('categoryFilter');
  if (select) {
    select.value = quoteCategory;
    currentCategory = quoteCategory;
    saveLastSelectedCategory(quoteCategory);
  }
  
  // Display the new quote
  displayFilteredQuotes();
  
  const message = isNewCategory 
    ? `Quote added successfully! New category "${quoteCategory}" has been created.`
    : 'Quote added successfully and saved to local storage!';
  
  alert(message);
}

// Function to update statistics
function updateStats() {
  const statsDisplay = document.getElementById('statsDisplay');
  const totalQuotes = quotes.length;
  const totalCategories = getCategories().length;
  
  // Get filtered count
  const filteredCount = currentCategory === 'all' 
    ? totalQuotes 
    : quotes.filter(q => q.category === currentCategory).length;
  
  const lastQuote = loadLastViewedQuote();
  let lastViewedText = '';
  if (lastQuote) {
    const timeAgo = new Date(lastQuote.timestamp).toLocaleTimeString();
    lastViewedText = ` | Last viewed: ${timeAgo}`;
  }
  
  const filterText = currentCategory === 'all' 
    ? '' 
    : ` | Showing: ${filteredCount} in "${currentCategory}"`;
  
  statsDisplay.textContent = `Total: ${totalQuotes} quotes | Categories: ${totalCategories}${filterText}${lastViewedText}`;
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
      
      // Check for new categories
      const existingCategories = getCategories();
      const newCategories = [];
      
      validQuotes.forEach(quote => {
        if (!existingCategories.includes(quote.category) && !newCategories.includes(quote.category)) {
          newCategories.push(quote.category);
        }
      });
      
      // Add imported quotes to existing quotes
      quotes.push(...validQuotes);
      
      // Save to localStorage
      saveQuotes();
      
      // Refresh categories dropdown
      populateCategories();
      
      // Refresh the display
      displayFilteredQuotes();
      
      let message = `Successfully imported ${validQuotes.length} quote(s)!`;
      if (newCategories.length > 0) {
        message += `\nNew categories added: ${newCategories.join(', ')}`;
      }
      
      alert(message);
      
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
  console.log('Initializing Dynamic Quote Generator...');
  
  // Load quotes from localStorage
  loadQuotes();
  
  // Load saved category from localStorage (persists across sessions)
  currentCategory = loadLastSelectedCategory();
  console.log('Restored category filter from localStorage:', currentCategory);
  
  // Create UI elements
  createCategoryFilter();
  createAddQuoteForm();
  
  // Display filtered quotes based on saved category
  displayFilteredQuotes();
  
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
  console.log('Total quotes:', quotes.length);
  console.log('Total categories:', getCategories().length);
  console.log('Current filter:', currentCategory);
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
