// Array to store quotes - will be loaded from localStorage
let quotes = [];
let currentCategory = "all";

// Server sync configuration
let autoSyncEnabled = false;
let syncInterval = null;
const SYNC_INTERVAL_MS = 30000; // 30 seconds
const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Conflict resolution state
let serverData = null;
let conflictDetected = false;

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

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    console.log('Quotes loaded from localStorage:', quotes.length);
  } else {
    quotes = [...defaultQuotes];
    saveQuotes();
    console.log('Default quotes loaded');
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  localStorage.setItem('lastModified', new Date().toISOString());
  console.log('Quotes saved to localStorage:', quotes.length);
}

function saveLastSelectedCategory(category) {
  localStorage.setItem('lastSelectedCategory', category);
}

function loadLastSelectedCategory() {
  return localStorage.getItem('lastSelectedCategory') || 'all';
}

function getLastModified() {
  return localStorage.getItem('lastModified') || new Date().toISOString();
}

// ==================== SESSION STORAGE FUNCTIONS ====================

function saveLastViewedQuote(quote) {
  const quoteData = {
    text: quote.text,
    category: quote.category,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quoteData));
}

function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem('lastViewedQuote');
  return lastQuote ? JSON.parse(lastQuote) : null;
}

function saveCurrentCategory(category) {
  sessionStorage.setItem('currentCategory', category);
}

function loadCurrentCategory() {
  return sessionStorage.getItem('currentCategory') || 'all';
}

// ==================== SERVER SYNC FUNCTIONS ====================

// Update sync status UI
function updateSyncStatus(status, message, time = null) {
  const statusElement = document.getElementById('syncStatus');
  const statusText = document.getElementById('syncStatusText');
  const timeText = document.getElementById('lastSyncTime');
  
  // Remove all status classes
  statusElement.classList.remove('syncing', 'synced', 'error');
  
  // Add appropriate class
  if (status === 'syncing') {
    statusElement.classList.add('syncing');
  } else if (status === 'synced') {
    statusElement.classList.add('synced');
  } else if (status === 'error') {
    statusElement.classList.add('error');
  }
  
  statusText.textContent = message;
  
  if (time) {
    timeText.textContent = `Last sync: ${new Date(time).toLocaleTimeString()}`;
  }
}

// Fetch quotes from server (simulated)
async function fetchQuotesFromServer() {
  try {
    updateSyncStatus('syncing', 'Syncing with server...');
    
    // Simulate fetching from JSONPlaceholder API
    const response = await fetch(SERVER_API_URL);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const posts = await response.json();
    
    // Transform posts into quote format (simulation)
    // In real app, you'd have a dedicated quotes endpoint
    const serverQuotes = posts.slice(0, 5).map(post => ({
      text: post.title,
      category: post.userId % 2 === 0 ? 'Inspiration' : 'Wisdom',
      serverId: post.id,
      serverTimestamp: new Date().toISOString()
    }));
    
    console.log('Fetched quotes from server:', serverQuotes.length);
    return serverQuotes;
    
  } catch (error) {
    console.error('Error fetching from server:', error);
    updateSyncStatus('error', 'Sync failed: ' + error.message);
    return null;
  }
}

// Post quotes to server (simulated)
async function postQuotesToServer(quotesToSync) {
  try {
    // Simulate posting to server
    const response = await fetch(SERVER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quotes: quotesToSync,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to post to server');
    }
    
    const result = await response.json();
    console.log('Posted quotes to server:', result);
    return true;
    
  } catch (error) {
    console.error('Error posting to server:', error);
    return false;
  }
}

// Detect conflicts between local and server data
function detectConflicts(localQuotes, serverQuotes) {
  // Simple conflict detection: check if server has different data
  const localModified = getLastModified();
  
  // Check if server has quotes we don't have
  const newServerQuotes = serverQuotes.filter(sq => 
    !localQuotes.some(lq => lq.text === sq.text)
  );
  
  // Conflict exists if:
  // 1. Server has new quotes AND
  // 2. Local data was recently modified
  const recentlyModified = (new Date() - new Date(localModified)) < 60000; // Within last minute
  
  if (newServerQuotes.length > 0 && recentlyModified) {
    return {
      hasConflict: true,
      newServerQuotes: newServerQuotes,
      message: `Server has ${newServerQuotes.length} new quote(s). Local data was recently modified.`
    };
  }
  
  return {
    hasConflict: false,
    newServerQuotes: newServerQuotes,
    message: null
  };
}

// Merge server data with local data (server takes precedence)
function mergeWithServerData(localQuotes, serverQuotes) {
  // Create a Set of local quote texts for quick lookup
  const localTexts = new Set(localQuotes.map(q => q.text));
  
  // Add server quotes that don't exist locally
  const newQuotes = serverQuotes.filter(sq => !localTexts.has(sq.text));
  
  if (newQuotes.length > 0) {
    console.log('Merging new quotes from server:', newQuotes.length);
    return [...localQuotes, ...newQuotes];
  }
  
  return localQuotes;
}

// Show conflict notification to user
function showConflictNotification(conflictInfo) {
  const notification = document.getElementById('conflictNotification');
  const message = document.getElementById('conflictMessage');
  
  message.textContent = conflictInfo.message + ' How would you like to resolve this?';
  notification.style.display = 'block';
  
  serverData = conflictInfo.newServerQuotes;
  conflictDetected = true;
}

// Hide conflict notification
function hideConflictNotification() {
  document.getElementById('conflictNotification').style.display = 'none';
  conflictDetected = false;
  serverData = null;
}

// Accept server data resolution
function acceptServerData() {
  if (serverData) {
    quotes = mergeWithServerData(quotes, serverData);
    saveQuotes();
    
    // Update UI
    populateCategories();
    displayFilteredQuotes();
    
    updateSyncStatus('synced', 'Synced successfully (server data accepted)', new Date().toISOString());
    
    alert(`Accepted ${serverData.length} new quote(s) from server!`);
  }
  
  hideConflictNotification();
}

// Keep local data resolution
function keepLocalData() {
  // Post local data to server to maintain it
  postQuotesToServer(quotes);
  
  updateSyncStatus('synced', 'Synced successfully (local data kept)', new Date().toISOString());
  
  alert('Kept local data. Your changes have been uploaded to the server.');
  
  hideConflictNotification();
}

// Main sync function
async function syncWithServer() {
  if (conflictDetected) {
    alert('Please resolve the existing conflict before syncing again.');
    return;
  }
  
  updateSyncStatus('syncing', 'Syncing with server...');
  
  try {
    // Fetch data from server
    const serverQuotes = await fetchQuotesFromServer();
    
    if (!serverQuotes) {
      return; // Error already handled
    }
    
    // Detect conflicts
    const conflictInfo = detectConflicts(quotes, serverQuotes);
    
    if (conflictInfo.hasConflict) {
      // Show conflict resolution UI
      showConflictNotification(conflictInfo);
      updateSyncStatus('error', 'Conflict detected - user action required');
    } else {
      // No conflict - merge automatically (server takes precedence)
      const mergedQuotes = mergeWithServerData(quotes, serverQuotes);
      
      const addedCount = mergedQuotes.length - quotes.length;
      
      if (addedCount > 0) {
        quotes = mergedQuotes;
        saveQuotes();
        
        // Update UI
        populateCategories();
        displayFilteredQuotes();
        
        updateSyncStatus('synced', `Synced successfully (+${addedCount} new quote(s))`, new Date().toISOString());
        
        // Show notification
        showNotification(`Added ${addedCount} new quote(s) from server!`, 'success');
      } else {
        updateSyncStatus('synced', 'Synced successfully (up to date)', new Date().toISOString());
      }
      
      // Post local changes to server
      await postQuotesToServer(quotes);
    }
    
  } catch (error) {
    console.error('Sync error:', error);
    updateSyncStatus('error', 'Sync failed: ' + error.message);
  }
}

// Toggle auto-sync
function toggleAutoSync() {
  const button = document.getElementById('toggleAutoSync');
  
  if (autoSyncEnabled) {
    // Disable auto-sync
    autoSyncEnabled = false;
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    button.textContent = 'Enable Auto-Sync';
    showNotification('Auto-sync disabled', 'info');
    console.log('Auto-sync disabled');
  } else {
    // Enable auto-sync
    autoSyncEnabled = true;
    button.textContent = 'Disable Auto-Sync';
    
    // Sync immediately
    syncWithServer();
    
    // Set up periodic sync
    syncInterval = setInterval(() => {
      console.log('Auto-sync triggered');
      syncWithServer();
    }, SYNC_INTERVAL_MS);
    
    showNotification(`Auto-sync enabled (every ${SYNC_INTERVAL_MS / 1000} seconds)`, 'success');
    console.log('Auto-sync enabled');
  }
}

// Show notification banner
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==================== CATEGORY MANAGEMENT FUNCTIONS ====================

function getCategories() {
  const categories = quotes.map(q => q.category);
  return [...new Set(categories)].sort();
}

function populateCategories() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  
  const currentSelection = select.value || currentCategory;
  select.innerHTML = '';
  
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
  
  const categoryExists = categories.includes(currentSelection) || currentSelection === 'all';
  select.value = categoryExists ? currentSelection : 'all';
}

function filterQuotes() {
  const select = document.getElementById('categoryFilter');
  const selectedCategory = select.value;
  
  currentCategory = selectedCategory;
  saveLastSelectedCategory(selectedCategory);
  saveCurrentCategory(selectedCategory);
  
  displayFilteredQuotes();
}

function displayFilteredQuotes() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';
  
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
  
  saveLastViewedQuote(randomQuote);
  updateStats();
}

function createCategoryFilter() {
  const container = document.getElementById('categoryFilterContainer');
  container.innerHTML = '';
  
  const select = document.createElement('select');
  select.id = 'categoryFilter';
  select.onchange = filterQuotes;
  
  container.appendChild(select);
  populateCategories();
  
  const lastCategory = loadLastSelectedCategory();
  currentCategory = lastCategory;
  select.value = lastCategory;
}

function showRandomQuote() {
  displayFilteredQuotes();
}

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

function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  if (quoteText === '' || quoteCategory === '') {
    alert('Please enter both a quote and a category!');
    return;
  }
  
  const existingCategories = getCategories();
  const isNewCategory = !existingCategories.includes(quoteCategory);
  
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };
  
  quotes.push(newQuote);
  saveQuotes();
  
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  if (isNewCategory) {
    populateCategories();
  }
  
  const select = document.getElementById('categoryFilter');
  if (select) {
    select.value = quoteCategory;
    currentCategory = quoteCategory;
    saveLastSelectedCategory(quoteCategory);
  }
  
  displayFilteredQuotes();
  
  const message = isNewCategory 
    ? `Quote added successfully! New category "${quoteCategory}" has been created.`
    : 'Quote added successfully and saved to local storage!';
  
  alert(message);
  
  // Post to server if auto-sync is enabled
  if (autoSyncEnabled) {
    postQuotesToServer(quotes);
  }
}

function updateStats() {
  const statsDisplay = document.getElementById('statsDisplay');
  const totalQuotes = quotes.length;
  const totalCategories = getCategories().length;
  
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
  
  URL.revokeObjectURL(url);
  alert('Quotes exported successfully!');
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      const validQuotes = importedQuotes.filter(quote => {
        return quote.text && quote.category && 
               typeof quote.text === 'string' && 
               typeof quote.category === 'string';
      });
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file');
      }
      
      const existingCategories = getCategories();
      const newCategories = [];
      
      validQuotes.forEach(quote => {
        if (!existingCategories.includes(quote.category) && !newCategories.includes(quote.category)) {
          newCategories.push(quote.category);
        }
      });
      
      quotes.push(...validQuotes);
      saveQuotes();
      
      populateCategories();
      displayFilteredQuotes();
      
      let message = `Successfully imported ${validQuotes.length} quote(s)!`;
      if (newCategories.length > 0) {
        message += `\nNew categories added: ${newCategories.join(', ')}`;
      }
      
      alert(message);
      
      // Post to server if auto-sync is enabled
      if (autoSyncEnabled) {
        postQuotesToServer(quotes);
      }
      
    } catch (error) {
      alert(`Error importing quotes: ${error.message}`);
      console.error('Import error:', error);
    }
    
    event.target.value = '';
  };
  
  fileReader.onerror = function() {
    alert('Error reading file. Please try again.');
  };
  
  fileReader.readAsText(file);
}

// ==================== INITIALIZATION ====================

function init() {
  console.log('Initializing Dynamic Quote Generator with Server Sync...');
  
  loadQuotes();
  currentCategory = loadLastSelectedCategory();
  
  createCategoryFilter();
  createAddQuoteForm();
  displayFilteredQuotes();
  
  // Event listeners
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('exportQuotes').addEventListener('click', exportToJson);
  document.getElementById('importQuotes').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  
  // Server sync event listeners
  document.getElementById('syncNow').addEventListener('click', syncWithServer);
  document.getElementById('toggleAutoSync').addEventListener('click', toggleAutoSync);
  document.getElementById('acceptServerData').addEventListener('click', acceptServerData);
  document.getElementById('keepLocalData').addEventListener('click', keepLocalData);
  
  // Initialize sync status
  updateSyncStatus('ready', 'Ready to sync');
  
  console.log('Application initialized successfully');
  console.log('Total quotes:', quotes.length);
  console.log('Total categories:', getCategories().length);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
