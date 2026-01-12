// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  console.log('[MP Formatter Settings] Popup opened');

  const toggle = document.getElementById('enableToggle');
  const statusText = document.getElementById('statusText');
  const reloadBtn = document.getElementById('reloadBtn');
  const openDocsBtn = document.getElementById('openDocsBtn');

  // Load current enabled state
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    const isEnabled = result.extensionEnabled !== false; // Default to true
    console.log('[MP Formatter Settings] Current enabled state:', isEnabled);

    toggle.checked = isEnabled;
    updateStatusText(isEnabled);
  });

  // Handle toggle change
  toggle.addEventListener('change', async (e) => {
    const isEnabled = e.target.checked;
    console.log('[MP Formatter Settings] Toggle changed to:', isEnabled);

    // Save to storage
    chrome.storage.sync.set({ extensionEnabled: isEnabled }, () => {
      console.log('[MP Formatter Settings] Saved enabled state:', isEnabled);
      updateStatusText(isEnabled);

      // Notify all tabs about the change
      notifyTabs(isEnabled);
    });
  });

  // Reload extension button
  reloadBtn.addEventListener('click', () => {
    console.log('[MP Formatter Settings] Reloading extension');
    chrome.runtime.reload();
  });

  // Open documentation button
  openDocsBtn.addEventListener('click', () => {
    console.log('[MP Formatter Settings] Opening documentation');
    chrome.tabs.create({
      url: 'https://github.com/sperciky/chrome-extension-payload'
    });
  });

  // Update status text
  function updateStatusText(isEnabled) {
    if (isEnabled) {
      statusText.textContent = 'Extension is enabled';
      statusText.className = 'enabled';
    } else {
      statusText.textContent = 'Extension is disabled';
      statusText.className = 'disabled';
    }
  }

  // Notify all tabs about the change
  function notifyTabs(isEnabled) {
    chrome.tabs.query({ url: 'https://docs.google.com/spreadsheets/*' }, (tabs) => {
      console.log('[MP Formatter Settings] Found', tabs.length, 'Google Sheets tabs');

      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXTENSION_TOGGLE',
          enabled: isEnabled
        }, (response) => {
          // Ignore errors if content script isn't loaded yet
          if (chrome.runtime.lastError) {
            console.log('[MP Formatter Settings] Could not send message to tab', tab.id, ':', chrome.runtime.lastError.message);
          } else {
            console.log('[MP Formatter Settings] Sent toggle message to tab', tab.id);
          }
        });
      });

      // Show confirmation
      showConfirmation(isEnabled);
    });
  }

  // Show confirmation message
  function showConfirmation(isEnabled) {
    const message = isEnabled
      ? 'Extension enabled! Refresh your Google Sheets tab to see the button.'
      : 'Extension disabled. The button will be removed from Google Sheets.';

    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${isEnabled ? '#34a853' : '#ea4335'};
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
});

// Add animations to the document
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);
