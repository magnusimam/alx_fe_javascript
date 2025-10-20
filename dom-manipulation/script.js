// Array to store quotes
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Wisdom" },
  { text: "You miss 100% of the shots you don't take.", category: "Motivation" },
  { text: "Whether you think you can or you think you can't, you're right.", category: "Mindset" }
];

let currentCategory = "all";

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
  
  select.addEventListener('change', (e) => {
    currentCategory = e.target.value;
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
  
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  createCategoryFilter();
  
  const select = document.getElementById('categoryFilter');
  select.value = quoteCategory;
  currentCategory = quoteCategory;
  
  showRandomQuote();
  
  alert('Quote added successfully!');
}

// Function to update statistics
function updateStats() {
  const statsDisplay = document.getElementById('statsDisplay');
  const totalQuotes = quotes.length;
  const totalCategories = getCategories().length;
  statsDisplay.textContent = `Total Quotes: ${totalQuotes} | Categories: ${totalCategories}`;
}

// Initialize the application
function init() {
  createCategoryFilter();
  createAddQuoteForm();
  showRandomQuote();
  
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
}

// Run initialization when DOM is loaded
init();
