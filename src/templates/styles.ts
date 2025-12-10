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

  /* Preview mode tabs */
  .preview-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 0;
  }

  .preview-tab {
    padding: 0.75rem 1.25rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.2s;
  }

  .preview-tab:hover {
    color: #4A154B;
    background: rgba(74, 21, 75, 0.05);
  }

  .preview-tab.active {
    color: #4A154B;
    border-bottom-color: #4A154B;
  }

  .preview-content {
    display: none;
  }

  .preview-content.active {
    display: block;
  }

  /* Slack Preview Styles - Block Kit Builder風（ライトモード） */
  .slack-preview-wrapper {
    background: #f4f4f4;
    padding: 40px;
    min-height: 300px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    border-radius: 0 0 8px 8px;
  }

  .slack-preview {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #ddd;
    overflow: hidden;
    font-family: 'Slack-Lato', 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .slack-preview-modal {
    max-width: 500px;
  }

  .slack-preview-home {
    max-width: 100%;
  }

  /* Modal header - Block Kit Builder風 */
  .slack-modal-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;
  }

  .slack-modal-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .slack-modal-app-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .slack-modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #1d1c1d;
  }

  .slack-modal-close-x {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 4px;
    font-size: 20px;
    color: #616061;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .slack-modal-close-x:hover {
    background: #f0f0f0;
    color: #1d1c1d;
  }

  /* Modal footer - ボタン配置 */
  .slack-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #e8e8e8;
    background: #fff;
  }

  .slack-modal-close {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #1d1c1d;
    cursor: pointer;
    transition: all 0.15s;
  }

  .slack-modal-close:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .slack-modal-submit {
    padding: 8px 16px;
    border: none;
    background: #007a5a;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: all 0.15s;
  }

  .slack-modal-submit:hover {
    background: #148567;
  }

  .slack-modal-submit-placeholder {
    display: none;
  }

  /* Home header */
  .slack-home-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;
  }

  .slack-home-icon {
    font-size: 18px;
  }

  .slack-home-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d1c1d;
  }

  /* Message header */
  .slack-message-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 20px 0;
  }

  .slack-message-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .slack-message-info {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .slack-message-author {
    font-size: 15px;
    font-weight: 900;
    color: #1d1c1d;
  }

  .slack-message-time {
    font-size: 12px;
    color: #616061;
  }

  /* Preview body */
  .slack-preview-body {
    padding: 16px 20px 20px;
    background: #fff;
  }

  .slack-preview-message .slack-preview-body {
    padding-left: 64px;
  }

  /* Blocks */
  .slack-block {
    margin-bottom: 8px;
  }

  .slack-block:last-child {
    margin-bottom: 0;
  }

  /* Header block */
  .slack-header {
    margin-top: 4px;
  }

  .slack-header-text {
    font-size: 18px;
    font-weight: 900;
    color: #1d1c1d;
    margin: 0;
    line-height: 1.4;
  }

  /* Section block */
  .slack-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .slack-section-content {
    flex: 1;
    min-width: 0;
  }

  .slack-section-text {
    font-size: 15px;
    color: #1d1c1d;
    line-height: 1.46668;
    word-wrap: break-word;
  }

  .slack-section-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 16px;
    margin-top: 8px;
  }

  .slack-section-field {
    font-size: 15px;
    color: #1d1c1d;
    line-height: 1.46668;
  }

  .slack-section-accessory {
    flex-shrink: 0;
  }

  /* Divider block */
  .slack-divider {
    margin: 16px 0;
  }

  .slack-divider hr {
    border: none;
    border-top: 1px solid #e8e8e8;
    margin: 0;
  }

  /* Image block */
  .slack-image-block {
    margin: 8px 0;
  }

  .slack-image-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d1c1d;
    margin-bottom: 4px;
  }

  .slack-block-image {
    max-width: 100%;
    max-height: 360px;
    border-radius: 4px;
    object-fit: contain;
  }

  .slack-accessory-image {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }

  /* Context block */
  .slack-context {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  .slack-context-image {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    object-fit: cover;
  }

  .slack-context-text {
    font-size: 12px;
    color: #616061;
    line-height: 1.5;
  }

  /* Actions block */
  .slack-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0;
  }

  /* Input block */
  .slack-input {
    margin: 12px 0;
  }

  .slack-input-label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #1d1c1d;
    margin-bottom: 8px;
  }

  .slack-required {
    color: #e01e5a;
    margin-left: 2px;
  }

  .slack-input-hint {
    font-size: 12px;
    color: #616061;
    margin-top: 4px;
  }

  /* Button element */
  .slack-button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #1d1c1d;
    cursor: pointer;
    transition: all 0.15s;
  }

  .slack-button:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .slack-button-primary {
    background: #007a5a;
    border-color: #007a5a;
    color: #fff;
  }

  .slack-button-primary:hover {
    background: #148567;
    border-color: #148567;
  }

  .slack-button-danger {
    background: #e01e5a;
    border-color: #e01e5a;
    color: #fff;
  }

  .slack-button-danger:hover {
    background: #d41c54;
    border-color: #d41c54;
  }

  /* Select element */
  .slack-select {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    font-size: 14px;
    color: #1d1c1d;
    cursor: pointer;
    min-width: 150px;
    gap: 8px;
  }

  .slack-select:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .slack-select-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slack-select-arrow {
    font-size: 10px;
    color: #616061;
  }

  /* Datepicker element */
  .slack-datepicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    font-size: 14px;
    color: #1d1c1d;
    cursor: pointer;
  }

  .slack-datepicker:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .slack-datepicker-icon {
    font-size: 14px;
  }

  /* Timepicker element */
  .slack-timepicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    font-size: 14px;
    color: #1d1c1d;
    cursor: pointer;
  }

  .slack-timepicker:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .slack-timepicker-icon {
    font-size: 14px;
  }

  /* Overflow menu element */
  .slack-overflow {
    padding: 4px 8px;
    border: 1px solid transparent;
    background: transparent;
    border-radius: 4px;
    font-size: 18px;
    color: #616061;
    cursor: pointer;
  }

  .slack-overflow:hover {
    background: #f0f0f0;
    color: #1d1c1d;
  }

  /* Text input element */
  .slack-text-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    color: #1d1c1d;
    background: #fff;
  }

  .slack-text-input:focus {
    outline: none;
    border-color: #1264a3;
    box-shadow: 0 0 0 1px #1264a3;
  }

  .slack-text-input::placeholder {
    color: #999;
  }

  .slack-textarea {
    min-height: 80px;
    resize: vertical;
  }

  /* Text input wrapper for icon inputs */
  .slack-text-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
  }

  .slack-text-input-wrapper:focus-within {
    border-color: #1264a3;
    box-shadow: 0 0 0 1px #1264a3;
  }

  .slack-input-icon {
    padding: 8px 0 8px 12px;
    font-size: 14px;
    color: #616061;
    flex-shrink: 0;
  }

  .slack-text-input-wrapper .slack-text-input {
    border: none;
    border-radius: 0;
    padding-left: 8px;
  }

  .slack-text-input-wrapper .slack-text-input:focus {
    box-shadow: none;
  }

  /* Checkboxes element */
  .slack-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slack-checkbox-option {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
  }

  .slack-checkbox-input {
    display: none;
  }

  .slack-checkbox-checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid #ddd;
    border-radius: 3px;
    background: #fff;
    flex-shrink: 0;
    margin-top: 2px;
    position: relative;
  }

  .slack-checkbox-input:checked + .slack-checkbox-checkmark {
    background: #1264a3;
    border-color: #1264a3;
  }

  .slack-checkbox-input:checked + .slack-checkbox-checkmark::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .slack-checkbox-content {
    flex: 1;
  }

  .slack-checkbox-label {
    font-size: 14px;
    color: #1d1c1d;
    line-height: 1.4;
  }

  .slack-checkbox-description {
    font-size: 12px;
    color: #616061;
    margin-top: 2px;
  }

  /* Radio buttons element */
  .slack-radio-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slack-radio-option {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
  }

  .slack-radio-input {
    display: none;
  }

  .slack-radio-checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid #ddd;
    border-radius: 50%;
    background: #fff;
    flex-shrink: 0;
    margin-top: 2px;
    position: relative;
  }

  .slack-radio-input:checked + .slack-radio-checkmark {
    border-color: #1264a3;
  }

  .slack-radio-input:checked + .slack-radio-checkmark::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 3px;
    width: 6px;
    height: 6px;
    background: #1264a3;
    border-radius: 50%;
  }

  .slack-radio-content {
    flex: 1;
  }

  .slack-radio-label {
    font-size: 14px;
    color: #1d1c1d;
    line-height: 1.4;
  }

  .slack-radio-description {
    font-size: 12px;
    color: #616061;
    margin-top: 2px;
  }

  /* Text formatting */
  .slack-inline-code {
    background: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    color: #e01e5a;
  }

  .slack-code-block {
    background: #f8f8f8;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 8px 12px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    overflow-x: auto;
    white-space: pre-wrap;
    margin: 8px 0;
    color: #1d1c1d;
  }

  .slack-link {
    color: #1264a3;
    text-decoration: none;
  }

  .slack-link:hover {
    text-decoration: underline;
  }

  .slack-mention {
    background: #e8f5fa;
    color: #1264a3;
    padding: 0 2px;
    border-radius: 3px;
  }

  /* Rich text block (placeholder) */
  .slack-rich-text-content {
    font-size: 14px;
    color: #616061;
    font-style: italic;
  }

  /* Video block (placeholder) */
  .slack-video-placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: #f8f8f8;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    color: #616061;
    font-size: 14px;
  }

  /* File block (placeholder) */
  .slack-file-placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f8f8f8;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    color: #616061;
    font-size: 14px;
  }

  /* Unknown block */
  .slack-unknown {
    padding: 8px 12px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
  }

  .slack-unknown-type {
    font-size: 12px;
    color: #856404;
  }

  /* Attachment */
  .slack-attachment {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin-top: 8px;
  }

  /* Preview error */
  .slack-preview-error {
    padding: 16px;
    background: #fdecea;
    border: 1px solid #e01e5a;
    border-radius: 4px;
    color: #e01e5a;
    font-size: 14px;
  }
`;
