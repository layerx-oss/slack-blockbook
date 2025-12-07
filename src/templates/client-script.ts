/**
 * Block Kit Preview client-side script
 */

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

export function generateClientScript(storyData: StoryData[]): string {
  return `
    // Story data
    const STORY_DATA = ${JSON.stringify(storyData)};

    // Current args (persisted per story)
    const currentArgs = {};

    // JSON syntax highlighting
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

    // Generate controls HTML
    function generateControlsHtml(variant) {
      console.log('generateControlsHtml called for variant:', variant.name);
      console.log('argTypes:', variant.argTypes);
      console.log('args:', variant.args);

      let controlsHtml = '';

      if (!variant.argTypes || Object.keys(variant.argTypes).length === 0) {
        console.log('No argTypes found, showing empty state');
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
        const description = argType.description ? \`<div class="control-description">\${argType.description}</div>\` : '';

        switch (argType.control) {
          case 'text':
            return \`
              <div class="control-group">
                <label class="control-label">\${key}</label>
                <input
                  type="text"
                  class="control-input"
                  data-arg-key="\${key}"
                  value="\${value}"
                />
                \${description}
              </div>
            \`;

          case 'number':
            return \`
              <div class="control-group">
                <label class="control-label">\${key}</label>
                <input
                  type="number"
                  class="control-input"
                  data-arg-key="\${key}"
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
                    data-arg-key="\${key}"
                    \${value ? 'checked' : ''}
                  />
                  <label class="control-checkbox-label">\${key}</label>
                </div>
                \${description}
              </div>
            \`;

          case 'select':
            const options = argType.options.map(opt =>
              \`<option value="\${opt}" \${value === opt ? 'selected' : ''}>\${opt}</option>\`
            ).join('');
            return \`
              <div class="control-group">
                <label class="control-label">\${key}</label>
                <select class="control-select" data-arg-key="\${key}">
                  \${options}
                </select>
                \${description}
              </div>
            \`;

          case 'date':
            return \`
              <div class="control-group">
                <label class="control-label">\${key}</label>
                <input
                  type="date"
                  class="control-input"
                  data-arg-key="\${key}"
                  value="\${value}"
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

    // Update variant display
    function updateStoryDisplay(storyId, updateUrl = true) {
      const variant = STORY_DATA.find(v => v.id === storyId);
      if (!variant) return;

      const displayEl = document.getElementById('variant-display');
      if (!displayEl) return;

      const descriptionHtml = variant.description
        ? \`<p class="variant-description">\${variant.description}</p>\`
        : '';

      const tagsHtml = variant.tags && variant.tags.length > 0
        ? \`<div class="tags">\${variant.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}</div>\`
        : '<div class="tags"></div>';

      let contentHtml = '';

      if (variant.error) {
        contentHtml = \`<div class="error-message">⚠️ Error: \${variant.error}</div>\`;
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
            <h1 class="variant-title">\${variant.name}</h1>
            <div class="variant-path">\${variant.filePath}</div>
          </div>
          \${descriptionHtml}
          \${contentHtml}
        </div>
      \`;

      // Set Block Kit JSON
      if (!variant.error && variant.blockKitJson) {
        const jsonElement = document.getElementById(\`json-content-\${storyId}\`);
        if (jsonElement) {
          jsonElement.innerHTML = syntaxHighlight(variant.blockKitJson);
        }
      }

      // Always show Controls footer
      let controlsFooter = document.getElementById('controls-footer');

      if (!controlsFooter) {
        // Create footer if it doesn't exist
        const footer = document.createElement('div');
        footer.innerHTML = generateControlsHtml(variant);
        document.body.appendChild(footer.firstElementChild);
        // Setup toggle functionality
        setupControlsToggle();
        controlsFooter = document.getElementById('controls-footer');
      } else {
        // Update existing footer content
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

      // Setup event listeners only if argTypes exist
      if (variant.argTypes && Object.keys(variant.argTypes).length > 0) {
        setupControlListeners(storyId, variant);
      }

      // Always show
      if (controlsFooter) {
        controlsFooter.style.display = 'block';
      }

      // Update active state
      document.querySelectorAll('.story-item').forEach(el => {
        el.classList.toggle('active', el.dataset.storyId === storyId);
      });

      // Update URL (history.pushState)
      if (updateUrl) {
        const url = new URL(window.location);
        url.searchParams.set('variant', storyId);
        window.history.pushState({ storyId }, '', url);
      }
    }

    // Controls footer toggle functionality
    function setupControlsToggle() {
      const toggle = document.getElementById('controls-toggle');
      const footer = document.getElementById('controls-footer');

      if (toggle && footer) {
        toggle.addEventListener('click', () => {
          footer.classList.toggle('collapsed');
        });
      }
    }

    // Setup control event listeners
    function setupControlListeners(storyId, variant) {
      const panel = document.getElementById('controls-panel');
      if (!panel) return;

      // Initialize current args
      if (!currentArgs[storyId]) {
        currentArgs[storyId] = { ...variant.args };
      }

      // Add event listeners to each control
      panel.querySelectorAll('[data-arg-key]').forEach(input => {
        const key = input.dataset.argKey;
        const argType = variant.argTypes[key];

        input.addEventListener('change', async (e) => {
          let value;
          if (argType.control === 'boolean') {
            value = e.target.checked;
          } else if (argType.control === 'number') {
            value = parseFloat(e.target.value);
          } else {
            value = e.target.value;
          }

          // Update args
          currentArgs[storyId][key] = value;

          // Re-render
          await rerenderStory(storyId, variant, currentArgs[storyId]);
        });
      });
    }

    // Re-render variant
    async function rerenderStory(storyId, variant, args) {
      try {
        console.log('🔄 Re-rendering variant:', variant.name);
        console.log('Args:', args);
        console.log('File path:', variant.filePath);

        const response = await fetch('/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: variant.filePath,
            storyName: variant.name,
            args,
          }),
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);

        if (result.error) {
          console.error('❌ Re-render error:', result.error);
          return;
        }

        // Update Block Kit JSON and URL
        const jsonElement = document.getElementById(\`json-content-\${storyId}\`);
        if (jsonElement && result.blockKitJson) {
          console.log('✅ Updating JSON preview');
          jsonElement.innerHTML = syntaxHighlight(result.blockKitJson);
        }

        // Update "Open in Block Kit Builder" button URL
        const buttonElement = document.getElementById(\`open-builder-\${storyId}\`);
        if (buttonElement && result.url) {
          console.log('✅ Updating builder URL');
          buttonElement.href = result.url;
        }
      } catch (err) {
        console.error('❌ Failed to re-render:', err);
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

        // Display variant from URL parameter if it exists
        if (storyIdFromUrl && STORY_DATA.find(v => v.id === storyIdFromUrl)) {
          updateStoryDisplay(storyIdFromUrl, false);
        } else {
          // Otherwise display first variant
          updateStoryDisplay(STORY_DATA[0].id);
        }
      }, 100);
    }

    // Hot reload functionality (SSE)
    const eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
      if (event.data === 'reload') {
        console.log('🔄 File changed. Reloading page...');
        // Reload current URL (query parameters preserved)
        window.location.reload();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Try to reconnect if connection is lost
      eventSource.close();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    // Close connection when leaving page
    window.addEventListener('beforeunload', () => {
      eventSource.close();
    });

    // Sidebar resize functionality
    (function setupSidebarResize() {
      const sidebar = document.getElementById('sidebar');
      const resizer = document.getElementById('sidebar-resizer');

      if (!sidebar || !resizer) return;

      // Initialize CSS variable
      function updateSidebarWidth(width) {
        document.documentElement.style.setProperty('--sidebar-width', width + 'px');
      }

      // Set initial width
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

        // Width constraints (match min-width, max-width)
        const minWidth = 200;
        const maxWidth = 600;
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

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
