# Google Sheets MP Data Formatter - Chrome Extension

A Chrome extension that formats and beautifies Google Measurement Protocol (MPv1 and MPv2) data directly in Google Sheets.

## Features

- **One-Click Access**: A floating button appears in the bottom-right corner of any Google Sheets page
- **Smart Detection**: Automatically detects whether the data is MPv1 or MPv2 format
- **Beautiful Formatting**: Displays data in a clean, organized, human-readable format
- **MPv1 Query String Generator**: Automatically generates URL-encoded query strings from MPv1 data
- **Parameter Categorization**: Groups MPv1 parameters by category (General, Hit, Custom Dimensions, Enhanced Ecommerce, etc.)
- **Copy to Clipboard**: Easy one-click copy of generated query strings
- **Clean UI**: Modern, responsive interface with smooth animations

## Installation

### Method 1: Install from Source

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked"
5. Select the folder containing the extension files
6. The extension should now be installed and active

### Method 2: Package and Install

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Pack extension"
4. Select the extension directory
5. Install the generated `.crx` file

## Usage

1. Open any Google Sheets document
2. Select a cell containing Google Measurement Protocol data (either MPv1 or MPv2 format)
3. Click the blue "Format MP Data" button in the bottom-right corner
4. View the formatted data in the popup window

### Supported Data Formats

#### MPv1 (Measurement Protocol v1)
```json
{
  "v":"1",
  "tid":"UA-XXXXXX-X",
  "ec":"Enhanced Ecommerce",
  "ea":"Purchase",
  "el":"Exit Click",
  "cid":"1012195300.1713730018",
  "t":"event",
  "ni":"1",
  "ts":"0",
  "tt":"0",
  "ti":"20260107-232501-2134309863",
  "tr":"0",
  "ev":"0",
  "cu":"CZK",
  "pa":"purchase",
  "dl":"https://example.com/page",
  "cd13":"None",
  "cd2":"search",
  "pr1id":"Product123",
  "pr1nm":"Product Name",
  "pr1qt":"1"
}
```

#### MPv2 (Measurement Protocol v2)
```json
{
  "client_id": "1204108240.1741958393",
  "gtm_info": "MPv2 - One Exit Service v0.1.0",
  "user_id": null,
  "timestamp_micros": 1767784955214056,
  "events": [
    {
      "name": "purchase",
      "params": {
        "type": "Exit Click",
        "page_type1": "search",
        "currency": "CZK",
        "value": "0.000",
        "page_location": "https://example.com/page",
        "transaction_id": "1767784949-14f0f743",
        "items": []
      }
    }
  ]
}
```

## Features Breakdown

### MPv1 Data Display
- **Categorized Parameters**: Parameters are grouped into logical categories
- **Human-Readable Labels**: Each parameter shows both the code (e.g., "tid") and description (e.g., "Tracking ID")
- **Query String Generation**: Automatically generates a URL-encoded query string with parameters on separate lines for readability
- **Copy Function**: One-click copy of the full query string (with parameters joined by `&`)

### MPv2 Data Display
- **Client Information**: Displays client ID, user ID, timestamp, and GTM info
- **Event Details**: Shows all events with their parameters
- **Nested Data**: Properly formats nested objects like items, user_data, cookies, etc.
- **Clean Layout**: Each event is clearly separated and easy to read

### UI Features
- **Protocol Badge**: Color-coded badge showing whether data is MPv1 (red) or MPv2 (green)
- **Collapsible Sections**: Main sections for Formatted Data, Query String (MPv1 only), and Raw Data
- **Scrollable Content**: Large datasets are handled with smooth scrolling
- **Close Options**: Click outside the popup or use the × button to close

## Development

### Project Structure
```
chrome-extension-payload/
├── manifest.json          # Extension configuration
├── content.js            # Content script (injected into Google Sheets)
├── content.css           # Styles for the floating button and overlay
├── popup.html            # Popup UI structure
├── popup.js              # Popup logic and data formatting
├── popup.css             # Popup styling
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
└── README.md             # This file
```

### Key Technologies
- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- CSS3 with animations
- Content Scripts for Google Sheets integration

### How It Works

1. **Content Script Injection**: The `content.js` script is automatically injected into all Google Sheets pages
2. **Button Creation**: A floating button is added to the bottom-right corner of the page
3. **Cell Data Extraction**: When clicked, the extension attempts to read the active cell's data using multiple methods:
   - Formula bar content
   - Active cell border detection
   - Input field values
   - Selected text
4. **Data Processing**: The data is parsed as JSON and the protocol version is detected
5. **Popup Display**: An iframe-based popup displays the formatted data
6. **Message Passing**: The raw data is passed to the popup via `postMessage`

### Customization

#### Modify Button Position
Edit `content.css` lines 2-4:
```css
.mp-formatter-btn {
  bottom: 20px;   /* Distance from bottom */
  right: 20px;    /* Distance from right */
}
```

#### Change Color Scheme
Edit `popup.css` and `content.css` to modify colors:
- Primary Blue: `#1a73e8`
- MPv1 Red: `rgba(234, 67, 53, 0.9)`
- MPv2 Green: `rgba(52, 168, 83, 0.9)`

#### Add New Parameter Descriptions
Edit `popup.js` function `getParameterName()` to add more human-readable parameter names.

## Troubleshooting

### Button Not Appearing
- Refresh the Google Sheets page
- Check if the extension is enabled in `chrome://extensions/`
- Verify the URL matches `https://docs.google.com/spreadsheets/*`

### Data Not Showing
- Ensure the cell contains valid JSON data
- Check the browser console for error messages
- Verify the data matches either MPv1 or MPv2 format

### Popup Not Opening
- Check browser console for errors
- Verify all extension files are present
- Try reloading the extension

### Copy Button Not Working
- Check clipboard permissions
- Try using HTTPS (clipboard API requires secure context)
- Check browser console for permission errors

## Browser Support

- Chrome 88+
- Edge 88+ (Chromium-based)
- Brave
- Opera

## Privacy & Permissions

This extension requires:
- `activeTab`: To access the current Google Sheets tab
- `scripting`: To inject the content script
- Host permission for `https://docs.google.com/spreadsheets/*`: To run on Google Sheets

**Privacy**: This extension does not collect, store, or transmit any data. All processing happens locally in your browser.

## License

MIT License - Feel free to modify and use as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Changelog

### Version 1.0.0 (2026-01-12)
- Initial release
- MPv1 and MPv2 data formatting
- Query string generation for MPv1
- Clean, modern UI
- Parameter categorization
- Copy to clipboard functionality

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ for data analysts and marketers working with Google Analytics and Google Tag Manager.
