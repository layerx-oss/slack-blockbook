import {
  INITIAL_SELECTION_DELAY,
  UI_CONFIG,
} from "../config";

interface StoryData {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  url: string;
  blockKitJson?: unknown;
  error?: string;
  filePath: string;
  args?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
}

export function generateStaticClientScript(storyData: StoryData[]): string {
  const { minWidth, maxWidth } = UI_CONFIG.sidebar;
  return `
    // Story data (initial render)
    const STORY_DATA = ${JSON.stringify(storyData)};

    // Current args (persisted per story)
    const currentArgs = {};

    function escapeHtml(unsafe) {
      if (typeof unsafe !== 'string') return unsafe;
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function syntaxHighlight(json) {
      if (typeof json !== 'string') {
        json = JSON.stringify(json, null, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }

    // Client-side Block Kit URL generation
    function generateBlockKitUrl(workspaceId, payload) {
      let normalizedPayload = payload;
      if (Array.isArray(payload)) {
        normalizedPayload = { blocks: payload };
      }
      const encodedPayload = encodeURIComponent(JSON.stringify(normalizedPayload));
      return 'https://api.slack.com/tools/block-kit-builder#' + encodedPayload;
    }

    // Get workspace ID from meta tag
    const WORKSPACE_ID = document.querySelector('meta[name="blockbook-workspace-id"]')?.content || '';

    function generateControlsHtml(variant) {
      let controlsHtml = '';

      if (!variant.argTypes || Object.keys(variant.argTypes).length === 0) {
        controlsHtml = \`
          <div style="text-align: center; color: #999; padding: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚙️</div>
            <div style="font-size: 0.875rem; font-weight: 500;">No controls available for this variant</div>
            <div style="font-size: 0.75rem; margin-top: 0.5rem; color: #bbb;">
              Add <code style="background: #2a2a2a; padding: 0.125rem 0.375rem; border-radius: 3px; color: #ce9178;">argTypes</code> to your variant definition to enable controls
            </div>
          </div>
        \`;
      } else {
        controlsHtml = Object.entries(variant.argTypes).map(([key, argType]) => {
        const value = currentArgs[variant.id]?.[key] ?? variant.args?.[key] ?? '';
        const escapedKey = escapeHtml(key);
        const escapedValue = typeof value === 'string' ? escapeHtml(value) : value;
        const description = argType.description ? \`<div class="control-description">\${escapeHtml(argType.description)}</div>\` : '';

        switch (argType.control) {
          case 'text':
            return \`
              <div class="control-group">
                <label class="control-label">\${escapedKey}</label>
                <input
                  type="text"
                  class="control-input"
                  data-arg-key="\${escapedKey}"
                  value="\${escapedValue}"
                />
                \${description}
              </div>
            \`;

          case 'number':
            return \`
              <div class="control-group">
                <label class="control-label">\${escapedKey}</label>
                <input
                  type="number"
                  class="control-input"
                  data-arg-key="\${escapedKey}"
                  value="\${value}"
                  \${argType.min !== undefined ? \`min="\${argType.min}"\` : ''}
                  \${argType.max !== undefined ? \`max="\${argType.max}"\` : ''}
                  \${argType.step !== undefined ? \`step="\${argType.step}"\` : ''}
                />
                \${description}
              </div>
            \`;

          case 'boolean':
            return \`
              <div class="control-group">
                <div class="control-checkbox-wrapper">
                  <input
                    type="checkbox"
                    class="control-checkbox"
                    data-arg-key="\${escapedKey}"
                    \${value ? 'checked' : ''}
                  />
                  <label class="control-checkbox-label">\${escapedKey}</label>
                </div>
                \${description}
              </div>
            \`;

          case 'select':
            const options = argType.options.map(opt =>
              \`<option value="\${escapeHtml(opt)}" \${value === opt ? 'selected' : ''}>\${escapeHtml(opt)}</option>\`
            ).join('');
            return \`
              <div class="control-group">
                <label class="control-label">\${escapedKey}</label>
                <select class="control-select" data-arg-key="\${escapedKey}">
                  \${options}
                </select>
                \${description}
              </div>
            \`;

          case 'date':
            return \`
              <div class="control-group">
                <label class="control-label">\${escapedKey}</label>
                <input
                  type="date"
                  class="control-input"
                  data-arg-key="\${escapedKey}"
                  value="\${escapedValue}"
                />
                \${description}
              </div>
            \`;

          default:
            return '';
        }
      }).join('');
      }

      return \`
        <div class="controls-footer" id="controls-footer">
          <div class="controls-toggle" id="controls-toggle">
            <div class="controls-header">
              <span>⚙️</span>
              <span>Controls</span>
            </div>
            <span class="controls-chevron">▼</span>
          </div>
          <div class="controls-content">
            <div class="controls-panel" id="controls-panel">
              \${controlsHtml}
            </div>
          </div>
        </div>
      \`;
    }

    function updateStoryDisplay(storyId, updateUrl = true) {
      const variant = STORY_DATA.find(v => v.id === storyId);
      if (!variant) return;

      const displayEl = document.getElementById('variant-display');
      if (!displayEl) return;

      const descriptionHtml = variant.description
        ? \`<p class="variant-description">\${escapeHtml(variant.description)}</p>\`
        : '';

      const tagsHtml = variant.tags && variant.tags.length > 0
        ? \`<div class="tags">\${variant.tags.map(tag => \`<span class="tag">\${escapeHtml(tag)}</span>\`).join('')}</div>\`
        : '<div class="tags"></div>';

      let contentHtml = '';

      if (variant.error) {
        contentHtml = \`<div class="error-message">⚠️ Error: \${escapeHtml(variant.error)}</div>\`;
      } else {
        const actionButtonHtml = \`
          <a href="\${variant.url}" target="_blank" class="action-button" id="open-builder-\${storyId}">
            <span>🚀</span>
            <span>Open in Block Kit Builder</span>
          </a>
        \`;

        contentHtml = \`
          <div class="tags-and-actions">
            \${tagsHtml}
            \${actionButtonHtml}
          </div>

          <div class="preview-container">
            <div class="json-preview">
              <pre id="json-content-\${storyId}"></pre>
            </div>
          </div>
        \`;
      }

      displayEl.innerHTML = \`
        <div class="variant-detail">
          <div class="variant-header">
            <h1 class="variant-title">\${escapeHtml(variant.name)}</h1>
            <div class="variant-path">\${escapeHtml(variant.filePath)}</div>
          </div>
          \${descriptionHtml}
          \${contentHtml}
        </div>
      \`;

      if (!variant.error && variant.blockKitJson) {
        const jsonElement = document.getElementById(\`json-content-\${storyId}\`);
        if (jsonElement) {
          jsonElement.innerHTML = syntaxHighlight(variant.blockKitJson);
        }
      }

      let controlsFooter = document.getElementById('controls-footer');

      if (!controlsFooter) {
        const footer = document.createElement('div');
        footer.innerHTML = generateControlsHtml(variant);
        document.body.appendChild(footer.firstElementChild);
        setupControlsToggle();
        controlsFooter = document.getElementById('controls-footer');
      } else {
        const controlsPanel = controlsFooter.querySelector('.controls-panel');
        if (controlsPanel) {
          const newContent = generateControlsHtml(variant);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newContent;
          const newPanel = tempDiv.querySelector('.controls-panel');
          if (newPanel) {
            controlsPanel.innerHTML = newPanel.innerHTML;
          }
        }
      }

      if (variant.argTypes && Object.keys(variant.argTypes).length > 0) {
        setupControlListeners(storyId, variant);
      }

      if (controlsFooter) {
        controlsFooter.style.display = 'block';
      }

      document.querySelectorAll('.story-item').forEach(el => {
        el.classList.toggle('active', el.dataset.storyId === storyId);
      });

      if (updateUrl) {
        const url = new URL(window.location);
        url.searchParams.set('variant', storyId);
        window.history.pushState({ storyId }, '', url);
      }
    }

    function setupControlsToggle() {
      const toggle = document.getElementById('controls-toggle');
      const footer = document.getElementById('controls-footer');

      if (toggle && footer) {
        toggle.addEventListener('click', () => {
          footer.classList.toggle('collapsed');
        });
      }
    }

    function setupControlListeners(storyId, variant) {
      const panel = document.getElementById('controls-panel');
      if (!panel) return;

      if (!currentArgs[storyId]) {
        currentArgs[storyId] = { ...variant.args };
      }

      panel.querySelectorAll('[data-arg-key]').forEach(input => {
        const key = input.dataset.argKey;
        const argType = variant.argTypes[key];

        input.addEventListener('change', (e) => {
          let value;
          if (argType.control === 'boolean') {
            value = e.target.checked;
          } else if (argType.control === 'number') {
            value = parseFloat(e.target.value);
          } else {
            value = e.target.value;
          }

          currentArgs[storyId][key] = value;
          rerenderStory(storyId, variant, currentArgs[storyId]);
        });
      });
    }

    // Client-side re-rendering using bundled component functions
    function rerenderStory(storyId, variant, args) {
      try {
        const registry = window.__BLOCKBOOK_STORIES__;
        if (!registry) return;

        let story = null;
        for (const entry of registry) {
          if (entry.filePath !== variant.filePath) continue;
          story = entry.stories.find(s => s.name === variant.name);
          if (story) break;
        }
        if (!story || typeof story.component !== 'function') return;

        const blockKitJson = story.component(args);
        const url = generateBlockKitUrl(WORKSPACE_ID, blockKitJson);

        // Update STORY_DATA entry
        const dataEntry = STORY_DATA.find(v => v.id === storyId);
        if (dataEntry) {
          dataEntry.blockKitJson = blockKitJson;
          dataEntry.url = url;
        }

        const jsonElement = document.getElementById(\`json-content-\${storyId}\`);
        if (jsonElement) {
          jsonElement.innerHTML = syntaxHighlight(blockKitJson);
        }

        const buttonElement = document.getElementById(\`open-builder-\${storyId}\`);
        if (buttonElement) {
          buttonElement.href = url;
        }
      } catch (err) {
        console.error('Failed to re-render:', err);
      }
    }

    // Click event listeners
    document.querySelectorAll('.story-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = item.dataset.storyId;
        updateStoryDisplay(storyId);
      });
    });

    // Directory toggle functionality
    document.querySelectorAll('.dir-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const dirItem = header.closest('.dir-item');
        if (dirItem) {
          dirItem.classList.toggle('expanded');
        }
      });
    });

    // Expand all directories by default
    document.querySelectorAll('.dir-item').forEach(item => {
      item.classList.add('expanded');
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.storyId) {
        updateStoryDisplay(event.state.storyId, false);
      }
    });

    // Initial selection (URL parameter or first variant)
    if (STORY_DATA.length > 0) {
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const storyIdFromUrl = urlParams.get('variant');

        if (storyIdFromUrl && STORY_DATA.find(v => v.id === storyIdFromUrl)) {
          updateStoryDisplay(storyIdFromUrl, false);
        } else {
          updateStoryDisplay(STORY_DATA[0].id);
        }
      }, ${INITIAL_SELECTION_DELAY});
    }

    // Sidebar resize functionality
    (function setupSidebarResize() {
      const sidebar = document.getElementById('sidebar');
      const resizer = document.getElementById('sidebar-resizer');

      if (!sidebar || !resizer) return;

      function updateSidebarWidth(width) {
        document.documentElement.style.setProperty('--sidebar-width', width + 'px');
      }

      updateSidebarWidth(sidebar.offsetWidth);

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        resizer.classList.add('resizing');
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;

        const clampedWidth = Math.max(${minWidth}, Math.min(${maxWidth}, newWidth));

        sidebar.style.width = clampedWidth + 'px';
        updateSidebarWidth(clampedWidth);
      });

      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          resizer.classList.remove('resizing');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      });
    })();
  `;
}
