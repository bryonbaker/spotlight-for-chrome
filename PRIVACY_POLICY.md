# Privacy Policy for Spotlight Focus

**Last Updated: June 22, 2026**

## Overview

Spotlight Focus is a Chrome extension designed to enhance browser-based presentations by dimming the active tab and creating a spotlight effect around your cursor. This privacy policy explains what data the extension collects and how it is used.

## Data Collection

### What We DO Collect

Spotlight Focus stores only the following user preferences locally on your device:

- **Spotlight State** - Whether the spotlight effect is currently enabled or disabled
- **Spotlight Radius** - The size of your spotlight circle (in pixels)
- **Dim Opacity** - The brightness level of the dimming effect (percentage)

These settings are stored locally using Chrome's `chrome.storage.local` API and remain on your device. They are never transmitted to any server or third party.

### What We DO NOT Collect

Spotlight Focus does **not** collect, store, or transmit:

- Personal information (name, email, address, etc.)
- Browsing history or visited URLs
- Page content from any website
- Keystroke data or typed content
- Mouse position data (tracked in real-time for visual effect only, never stored)
- Credentials, passwords, or authentication information
- Financial information
- Location data
- Health information
- Any other personally identifiable information

## How Data is Used

The locally stored user preferences are used solely to:

1. Remember your spotlight settings between browser sessions
2. Apply your preferred visual effect settings when you activate the extension
3. Maintain consistency across different tabs and windows

## Data Storage

All data is stored locally on your device using Chrome's built-in storage API. No data is transmitted to external servers, cloud services, or third parties.

## Third-Party Access

Spotlight Focus does **not**:

- Share data with third parties
- Sell user data
- Use analytics or tracking services
- Communicate with external servers
- Include advertisements or trackers

## Permissions Explanation

Spotlight Focus requires the following Chrome permissions:

- **activeTab** - To apply the visual effect to the currently active tab
- **scripting** - To inject the visual overlay onto web pages
- **storage** - To save your preference settings locally
- **tabs** - To detect tab switches and page loads
- **Host permissions (`<all_urls>`)** - To allow the spotlight effect on any website you're presenting

These permissions are used exclusively for the extension's core functionality and do not enable data collection.

## Data Security

Since all data is stored locally on your device and the extension does not communicate with external servers, your data security is maintained by Chrome's built-in security mechanisms.

## Changes to Privacy Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this document and published to this repository.

## Open Source

This extension is open source. You can review the complete source code at [https://github.com/yourusername/spotlight-for-chrome](https://github.com/yourusername/spotlight-for-chrome) to verify these privacy claims.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository or contact [your contact information].

## Your Rights

You can:

- Clear all stored preferences by removing and reinstalling the extension
- Review what data is stored by inspecting Chrome's local storage in Developer Tools
- Disable or uninstall the extension at any time

## Compliance

This extension complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
