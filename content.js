// Create and inject the button in the bottom right corner
function createMPButton() {
  // Check if button already exists
  if (document.getElementById('mp-formatter-button')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'mp-formatter-button';
  button.textContent = 'Format MP Data';
  button.className = 'mp-formatter-btn';

  button.addEventListener('click', handleButtonClick);

  document.body.appendChild(button);
}

// Handle button click - get active cell data
async function handleButtonClick() {
  try {
    // Try to get the selected cell's value
    const cellData = getActiveCellData();

    if (!cellData) {
      showNotification('Please select a cell with MP data');
      return;
    }

    // Open popup with the data
    openPopup(cellData);
  } catch (error) {
    console.error('Error getting cell data:', error);
    showNotification('Error reading cell data');
  }
}

// Get the active cell data from Google Sheets
function getActiveCellData() {
  try {
    // Google Sheets stores the formula bar content which shows the selected cell value
    const formulaBar = document.querySelector('.cell-input');
    if (formulaBar) {
      return formulaBar.textContent || formulaBar.innerText;
    }

    // Alternative: try to get from the active cell directly
    const activeCell = document.querySelector('.active-cell-border');
    if (activeCell) {
      const cellElement = document.elementFromPoint(
        activeCell.offsetLeft + 5,
        activeCell.offsetTop + 5
      );
      if (cellElement) {
        return cellElement.textContent || cellElement.innerText;
      }
    }

    // Try another approach - get the input field value
    const inputField = document.querySelector('input.cell-input');
    if (inputField && inputField.value) {
      return inputField.value;
    }

    // Last resort: try to find any selected text
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      return selection.toString();
    }

    return null;
  } catch (error) {
    console.error('Error extracting cell data:', error);
    return null;
  }
}

// Open the popup window
function openPopup(data) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'mp-formatter-overlay';
  overlay.className = 'mp-formatter-overlay';

  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'mp-formatter-popup';
  popup.className = 'mp-formatter-popup';

  // Create iframe to load popup content
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  iframe.className = 'mp-formatter-iframe';

  // Wait for iframe to load then send data
  iframe.onload = function() {
    iframe.contentWindow.postMessage({ type: 'MP_DATA', data: data }, '*');
  };

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'mp-formatter-close';
  closeBtn.onclick = () => {
    overlay.remove();
  };

  popup.appendChild(closeBtn);
  popup.appendChild(iframe);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// Show notification message
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'mp-formatter-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize when DOM is ready
function init() {
  // Wait for Google Sheets to load
  const checkInterval = setInterval(() => {
    // Check if we're on a Google Sheets page
    if (window.location.href.includes('docs.google.com/spreadsheets')) {
      createMPButton();
      clearInterval(checkInterval);
    }
  }, 1000);

  // Stop checking after 30 seconds
  setTimeout(() => clearInterval(checkInterval), 30000);
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
