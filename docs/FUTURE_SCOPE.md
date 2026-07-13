# Future Scope

Given more time, here is what we would build next.

## Short Term

### Rich Note Editing
Support markdown formatting, bullet lists, and code blocks within notes. This makes the app viable for real note-taking workflows.

### Note Import / Export
Allow users to import notes from plain text files (or popular formats like Markdown, Notion JSON, or Obsidian vaults) and export graph data as JSON or CSV.

### Pin / Persistent Graph Layout
Allow users to pin nodes in place and save the graph layout so it does not reset on reload.

### Undo / Redo
Support undo for accidental note deletions and graph modifications.

## Medium Term

### Multi-Model Support
Let users choose between different embedding models (e.g., a smaller model for speed, a larger model for accuracy). Models could be loaded on demand.

### Knowledge Graph Export
Export the graph as a standard knowledge graph format (RDF, JSON-LD) for use with other tools.

### PWA Support
Make the app installable as a Progressive Web App with offline-first service workers and a manifest file.

### Mobile Responsive Layout
Optimize the sidebar and graph layout for small screens and touch interactions.

### Auto-Summarization
Use a local text generation model to summarize note clusters, giving users a quick overview of what each cluster contains.

## Long Term

### Real-Time Collaboration
Allow multiple users to add notes and see the graph update in real time using CRDTs (Conflict-Free Replicated Data Types). All data stays on-device or syncs via encrypted peer-to-peer channels.

### Plugins / Extensions
Provide a plugin API so the community can extend the app with custom data sources, AI models, export formats, and visualizations.

### Graph Navigation History
Track which clusters and notes the user has explored, with breadcrumb navigation and a history stack.

### Multi-Vault Support
Let users create multiple knowledge graphs (vaults) for different projects or contexts.

### Browser Extension
Build a browser extension that lets users add web pages to their knowledge graph with one click.

### Mobile App
Native mobile apps (or a properly responsive PWA) for on-the-go note capture and graph exploration.

## Known Limitations

- The app is not designed for very large note collections (10,000+ notes) because the O(n^2) similarity computation becomes slow
- The current model is English-only
- Long notes (paragraphs) may lose specificity in their embedding
- Graph layout resets on page reload (no layout persistence yet)
- No authentication or multi-user support
