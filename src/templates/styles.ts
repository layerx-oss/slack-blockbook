/**
 * Block Kit Preview UI style definitions
 */
export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #333;
    overflow: hidden;
  }

  /* Header */
  .header {
    background: #4A154B;
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    position: relative;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  .header-divider {
    width: 1px;
    height: 1.5rem;
    background: rgba(255, 255, 255, 0.3);
  }

  .project-name {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  /* Layout */
  .app-layout {
    display: flex;
    height: calc(100vh - 64px);
    overflow: hidden;
  }

  /* Sidebar */
  .sidebar {
    width: 280px;
    min-width: 200px;
    max-width: 600px;
    background: #f8f9fa;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    flex-shrink: 0;
    position: relative;
  }

  .sidebar-resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    z-index: 10;
    transition: background 0.2s;
  }

  .sidebar-resizer:hover,
  .sidebar-resizer.resizing {
    background: #4A154B;
  }

  .sidebar-header {
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.05em;
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .file-list {
    list-style: none;
    padding: 0.5rem 0;
  }

  .file-item {
    margin-bottom: 0.5rem;
  }

  .file-header {
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
    transition: background 0.2s;
  }

  .file-header:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .folder-icon {
    font-size: 1rem;
  }

  .file-name {
    flex: 1;
  }

  .story-list {
    list-style: none;
    padding-left: 0;
  }

  .story-item {
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: #555;
    transition: all 0.2s;
  }

  .story-item:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  .story-item.active {
    background: rgba(102, 126, 234, 0.15);
    color: #667eea;
    font-weight: 600;
  }

  .story-icon {
    font-size: 0.875rem;
  }

  /* Directory tree */
  .dir-item {
    margin-bottom: 0.25rem;
  }

  .dir-header {
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
    transition: background 0.2s;
  }

  .dir-header:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .dir-chevron {
    font-size: 0.625rem;
    color: #888;
    transition: transform 0.2s;
    width: 0.75rem;
    text-align: center;
  }

  .dir-item.expanded > .dir-header .dir-chevron {
    transform: rotate(90deg);
  }

  .dir-children {
    list-style: none;
    padding-left: 1rem;
    display: none;
  }

  .dir-item.expanded > .dir-children {
    display: block;
  }

  .file-chevron {
    font-size: 0.625rem;
    color: #888;
    transition: transform 0.2s;
    width: 0.75rem;
    text-align: center;
  }

  .file-item.expanded > .file-header .file-chevron {
    transform: rotate(90deg);
  }

  .file-item > .story-list {
    display: none;
    padding-left: 1.5rem;
  }

  .file-item.expanded > .story-list {
    display: block;
  }

  .file-icon {
    font-size: 0.875rem;
  }

  /* Main area */
  .main-content {
    flex: 1;
    overflow-y: auto;
    background: #ffffff;
  }

  .canvas-toolbar {
    background: #f6f9fc;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .canvas-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
  }

  .stats-badge {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #666;
  }

  .stat-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .canvas {
    padding: 2rem;
  }

  /* Story details */
  .story-detail {
    background: white;
    border-radius: 8px;
  }

  .story-header {
    margin-bottom: 1rem;
  }

  .story-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .story-path {
    font-size: 0.8125rem;
    color: #999;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  }

  .story-description {
    font-size: 0.9375rem;
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }

  .tags-and-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    background: #f0f0f0;
    color: #666;
    padding: 0.25rem 0.75rem;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #4A154B;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.9375rem;
    font-weight: 600;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    white-space: nowrap;
  }

  .action-button:hover {
    background: #611f69;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 21, 75, 0.4);
  }

  .error-message {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 6px;
    padding: 1rem;
    color: #856404;
    font-size: 0.875rem;
  }

  /* Empty state */
  .empty-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: #999;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #666;
  }

  .empty-description {
    font-size: 0.9375rem;
    line-height: 1.6;
    max-width: 400px;
  }

  .empty-code {
    background: #f0f0f0;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 0.8125rem;
    color: #FF4785;
  }

  /* JSON Preview */
  .preview-container {
    margin-bottom: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }

  .json-preview {
    background: #1e1e1e;
    padding: 1rem;
    overflow: auto;
    max-height: 600px;
  }

  .json-preview pre {
    margin: 0;
    color: #d4d4d4;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  /* JSON Syntax Highlighting */
  .json-key {
    color: #9cdcfe;
  }

  .json-string {
    color: #ce9178;
  }

  .json-number {
    color: #b5cea8;
  }

  .json-boolean {
    color: #569cd6;
  }

  .json-null {
    color: #569cd6;
  }

  /* Controls Panel (Footer) */
  .controls-footer {
    position: fixed;
    bottom: 0;
    left: var(--sidebar-width, 280px);
    right: 0;
    background: white;
    border-top: 2px solid #e0e0e0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
    transition: transform 0.3s ease;
  }

  .controls-footer.collapsed {
    transform: translateY(calc(100% - 48px));
  }

  .controls-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    user-select: none;
    background: #f9f9f9;
    border-bottom: 1px solid #e0e0e0;
  }

  .controls-toggle:hover {
    background: #f0f0f0;
  }

  .controls-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
  }

  .controls-chevron {
    transition: transform 0.3s ease;
    font-size: 1.25rem;
  }

  .controls-footer.collapsed .controls-chevron {
    transform: rotate(180deg);
  }

  .controls-content {
    padding: 1.5rem;
    max-height: 600px;
    overflow-y: auto;
    background: #f9f9f9;
  }

  .controls-panel {
    max-width: 1200px;
    margin: 0 auto;
  }

  .control-group {
    margin-bottom: 1rem;
  }

  .control-group:last-child {
    margin-bottom: 0;
  }

  .control-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #666;
    margin-bottom: 0.375rem;
  }

  .control-description {
    font-size: 0.75rem;
    color: #999;
    margin-top: 0.25rem;
  }

  .control-input,
  .control-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .control-input:focus,
  .control-select:focus {
    outline: none;
    border-color: #FF4785;
  }

  .control-checkbox {
    width: 1.125rem;
    height: 1.125rem;
    cursor: pointer;
  }

  .control-checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .control-checkbox-label {
    font-size: 0.875rem;
    color: #333;
    cursor: pointer;
    user-select: none;
  }
`;
