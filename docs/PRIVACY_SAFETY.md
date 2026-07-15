# Privacy and Safety

## Data Handling

| Data Type | Location | Duration |
|---|---|---|
| Note text | IndexedDB (browser storage) | Until user deletes |
| AI embeddings | IndexedDB (browser storage) | Until user deletes |
| AI model weights | Browser HTTP cache | Until cache is cleared |
| Usage analytics | None | Not collected |

**No data is ever sent to any server.** All processing happens entirely within the browser tab.

## Permissions

| Permission | Required? | Purpose |
|---|---|---|
| Internet | First load only | Download the AI model from Hugging Face CDN |
| Storage (IndexedDB) | Yes | Save notes and embeddings locally |
| GPU (WebGPU) | Optional | Accelerate AI inference |
| Microphone | No | Not used |
| Camera | No | Not used |
| Location | No | Not used |
| File system | No | Not used |

The app requests no special browser permissions beyond storage.

## Storage

- Notes and embeddings are stored in **IndexedDB**, a key-value database built into all modern browsers
- Data persists across page reloads and browser restarts
- Clearing browser storage or website data will delete all user notes
- There is no cloud backup or sync — data exists only on the device where it was created

## Limitations

- Data is device-specific. Notes created on one machine cannot be accessed from another.
- No encryption is applied at the application layer. IndexedDB data is subject to the browser's built-in sandbox security.
- No authentication, user accounts, or access control.
- The app cannot recover notes if the IndexedDB database is corrupted or cleared.

## Potential Risks

| Risk | Mitigation |
|---|---|
| Browser cache clearing deletes model | Model is re-downloaded automatically |
| IndexedDB corruption | Notes are stored as simple key-value pairs; corruption is unlikely but would require manual re-entry |
| Browser sandbox escape (theoretical) | Standard browser security isolation applies; no elevated privileges are requested |
| Model integrity | Model is downloaded from Hugging Face CDN over HTTPS; integrity is verified by the Transformers.js loader |
| Third-party library vulnerabilities | All dependencies are open-source and pinned to specific versions; regular updates recommended |

## Recommendations for Users

- Use a modern, up-to-date browser for the best security and performance
- Clear site data only if you intend to remove all notes
- Do not store sensitive passwords or credentials as notes — the app is not designed for secret management
- Export important notes manually if you need a backup (no export feature currently exists)
