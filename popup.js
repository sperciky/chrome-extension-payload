// Listen for messages from the content script
window.addEventListener('message', (event) => {
  if (event.data.type === 'MP_DATA') {
    processData(event.data.data);
  }
}, { passive: true });

// Process the incoming data
function processData(rawData) {
  try {
    // Display raw data
    document.getElementById('rawData').textContent = rawData;

    // Try to parse as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(rawData);
    } catch (e) {
      showError('Invalid JSON data. Please ensure the cell contains valid MP data.');
      return;
    }

    // Detect protocol version
    const protocol = detectProtocol(parsedData);

    if (!protocol) {
      showError('Unable to detect Measurement Protocol version. Data format not recognized.');
      return;
    }

    // Update protocol badge
    const badge = document.getElementById('protocolBadge');
    badge.textContent = protocol.toUpperCase();
    badge.className = `protocol-badge ${protocol.toLowerCase()}`;

    // Format and display data based on protocol
    if (protocol === 'MPv1') {
      formatMPv1(parsedData);
      generateQueryString(parsedData);
    } else if (protocol === 'MPv2') {
      formatMPv2(parsedData);
    }

  } catch (error) {
    console.error('Error processing data:', error);
    showError(`Processing error: ${error.message}`);
  }
}

// Detect which protocol version the data is
function detectProtocol(data) {
  if (data.v === '1' || data.tid || data.cid) {
    return 'MPv1';
  } else if (data.client_id && data.events && Array.isArray(data.events)) {
    return 'MPv2';
  }
  return null;
}

// Format MPv1 data
function formatMPv1(data) {
  const container = document.getElementById('formattedData');
  container.innerHTML = '';

  // Group parameters by category
  const groups = {
    'General Parameters': [],
    'Hit Parameters': [],
    'Custom Dimensions': [],
    'Enhanced Ecommerce': [],
    'Other Parameters': []
  };

  // Categorize parameters
  for (const [key, value] of Object.entries(data)) {
    const category = categorizeMPv1Parameter(key);
    groups[category].push({ key, value });
  }

  // Display each group
  for (const [groupName, params] of Object.entries(groups)) {
    if (params.length > 0) {
      const groupDiv = createParamGroup(groupName, params);
      container.appendChild(groupDiv);
    }
  }
}

// Categorize MPv1 parameters
function categorizeMPv1Parameter(key) {
  const generalParams = ['v', 'tid', 'cid', 't', 'dl', 'dt', 'dh', 'dp'];
  const hitParams = ['ec', 'ea', 'el', 'ev', 'ni', 'ti', 'tr', 'tt', 'ts', 'pa'];
  const customDimensions = key.match(/^cd\d+$/);
  const ecommerce = key.match(/^pr\d+/);

  if (generalParams.includes(key)) return 'General Parameters';
  if (hitParams.includes(key)) return 'Hit Parameters';
  if (customDimensions) return 'Custom Dimensions';
  if (ecommerce) return 'Enhanced Ecommerce';
  return 'Other Parameters';
}

// Format MPv2 data
function formatMPv2(data) {
  const container = document.getElementById('formattedData');
  container.innerHTML = '';

  // Client Info Group
  const clientInfo = {
    'Client ID': data.client_id,
    'User ID': data.user_id || 'N/A',
    'Timestamp (microseconds)': data.timestamp_micros,
    'GTM Info': data.gtm_info || 'N/A'
  };

  const clientGroup = createParamGroup('Client Information',
    Object.entries(clientInfo).map(([key, value]) => ({ key, value }))
  );
  container.appendChild(clientGroup);

  // Events
  if (data.events && data.events.length > 0) {
    const eventsDiv = document.createElement('div');
    eventsDiv.className = 'param-group';

    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.fontSize = '16px';
    title.style.marginBottom = '12px';
    title.style.color = '#1a73e8';
    title.textContent = `Events (${data.events.length})`;
    eventsDiv.appendChild(title);

    data.events.forEach((event, index) => {
      const eventDiv = formatEvent(event, index);
      eventsDiv.appendChild(eventDiv);
    });

    container.appendChild(eventsDiv);
  }

  // Generate formatted JSON for MPv2
  generateFormattedJson(data);
}

// Format a single event
function formatEvent(event, index) {
  const eventDiv = document.createElement('div');
  eventDiv.className = 'event-item';

  const eventName = document.createElement('div');
  eventName.className = 'event-name';
  eventName.textContent = `Event ${index + 1}: ${event.name}`;
  eventDiv.appendChild(eventName);

  if (event.params) {
    for (const [key, value] of Object.entries(event.params)) {
      const paramRow = document.createElement('div');
      paramRow.className = 'param-row';

      const paramKey = document.createElement('div');
      paramKey.className = 'param-key';
      paramKey.textContent = key;

      const paramValue = document.createElement('div');
      paramValue.className = 'param-value';

      if (typeof value === 'object' && value !== null) {
        paramValue.className += ' json';
        paramValue.textContent = JSON.stringify(value, null, 2);
      } else {
        paramValue.textContent = String(value);
      }

      paramRow.appendChild(paramKey);
      paramRow.appendChild(paramValue);
      eventDiv.appendChild(paramRow);
    }
  }

  return eventDiv;
}

// Create a parameter group
function createParamGroup(title, params) {
  const groupDiv = document.createElement('div');
  groupDiv.className = 'param-group';

  const titleDiv = document.createElement('div');
  titleDiv.style.fontWeight = '700';
  titleDiv.style.fontSize = '16px';
  titleDiv.style.marginBottom = '12px';
  titleDiv.style.color = '#1a73e8';
  titleDiv.textContent = title;
  groupDiv.appendChild(titleDiv);

  params.forEach(({ key, value }) => {
    const row = document.createElement('div');
    row.className = 'param-row';

    const keyDiv = document.createElement('div');
    keyDiv.className = 'param-key';
    keyDiv.textContent = getParameterName(key);

    const valueDiv = document.createElement('div');
    valueDiv.className = 'param-value';

    if (typeof value === 'object' && value !== null) {
      valueDiv.className += ' json';
      valueDiv.textContent = JSON.stringify(value, null, 2);
    } else {
      valueDiv.textContent = String(value);
    }

    row.appendChild(keyDiv);
    row.appendChild(valueDiv);
    groupDiv.appendChild(row);
  });

  return groupDiv;
}

// Get human-readable parameter names
function getParameterName(key) {
  const paramNames = {
    'v': 'v (Protocol Version)',
    'tid': 'tid (Tracking ID)',
    'cid': 'cid (Client ID)',
    't': 't (Hit Type)',
    'ec': 'ec (Event Category)',
    'ea': 'ea (Event Action)',
    'el': 'el (Event Label)',
    'ev': 'ev (Event Value)',
    'ni': 'ni (Non-Interaction)',
    'ti': 'ti (Transaction ID)',
    'tr': 'tr (Transaction Revenue)',
    'tt': 'tt (Transaction Tax)',
    'ts': 'ts (Transaction Shipping)',
    'pa': 'pa (Product Action)',
    'dl': 'dl (Document Location)',
    'dt': 'dt (Document Title)',
    'dh': 'dh (Document Hostname)',
    'dp': 'dp (Document Path)',
    'cu': 'cu (Currency)',
    'z': 'z (Cache Buster)'
  };

  // Check for custom dimensions
  if (key.match(/^cd\d+$/)) {
    return `${key} (Custom Dimension ${key.substring(2)})`;
  }

  // Check for product fields
  if (key.match(/^pr\d+/)) {
    return key + ' (Product Field)';
  }

  // Check for content groups
  if (key.match(/^cg\d+$/)) {
    return `${key} (Content Group ${key.substring(2)})`;
  }

  return paramNames[key] || key;
}

// Generate URL-encoded query string for MPv1
function generateQueryString(data) {
  const queryStringSection = document.getElementById('queryStringSection');
  queryStringSection.style.display = 'block';

  const queryString = document.getElementById('queryString');

  // Build query string with newlines
  const params = [];
  for (const [key, value] of Object.entries(data)) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(value);
    params.push(`${encodedKey}=${encodedValue}`);
  }

  // Join with newlines for readability
  const formattedQueryString = params.join('\n');
  queryString.textContent = formattedQueryString;

  // Setup copy button
  const copyBtn = document.getElementById('copyQueryBtn');
  copyBtn.onclick = () => {
    // Copy the full URL-encoded query string (without newlines)
    const fullQueryString = params.join('&');
    navigator.clipboard.writeText(fullQueryString).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Query String';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      copyBtn.textContent = 'Copy Failed';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Query String';
      }, 2000);
    });
  };
}

// Generate formatted JSON for MPv2
function generateFormattedJson(data) {
  const formattedJsonSection = document.getElementById('formattedJsonSection');
  formattedJsonSection.style.display = 'block';

  const formattedJsonDiv = document.getElementById('formattedJson');

  // Format JSON with 4 spaces indentation
  const formattedJson = JSON.stringify(data, null, 4);
  formattedJsonDiv.textContent = formattedJson;

  // Setup copy button
  const copyBtn = document.getElementById('copyJsonBtn');
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(formattedJson).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Formatted JSON';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      copyBtn.textContent = 'Copy Failed';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Formatted JSON';
      }, 2000);
    });
  };
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  errorText.textContent = message;
  errorDiv.style.display = 'block';
}
