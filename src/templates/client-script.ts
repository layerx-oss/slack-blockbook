/**
 * Block Kit Preview クライアント側のスクリプト
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
    // ストーリーデータ
    const STORY_DATA = ${JSON.stringify(storyData)};

    // 現在のargs（ストーリーごとに保持）
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

    // コントロールHTMLを生成
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

    // バリアント表示を更新
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
        contentHtml = \`<div class="error-message">⚠️ エラー: \${variant.error}</div>\`;
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

      // Block Kit JSONをセット
      if (!variant.error && variant.blockKitJson) {
        const jsonElement = document.getElementById(\`json-content-\${storyId}\`);
        if (jsonElement) {
          jsonElement.innerHTML = syntaxHighlight(variant.blockKitJson);
        }
      }

      // Controlsフッターを常に表示
      let controlsFooter = document.getElementById('controls-footer');

      if (!controlsFooter) {
        // フッターが存在しない場合は作成
        const footer = document.createElement('div');
        footer.innerHTML = generateControlsHtml(variant);
        document.body.appendChild(footer.firstElementChild);
        // トグル機能をセットアップ
        setupControlsToggle();
        controlsFooter = document.getElementById('controls-footer');
      } else {
        // 既存のフッターの内容を更新
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

      // argTypesがある場合のみイベントリスナーを設定
      if (variant.argTypes && Object.keys(variant.argTypes).length > 0) {
        setupControlListeners(storyId, variant);
      }

      // 常に表示
      if (controlsFooter) {
        controlsFooter.style.display = 'block';
      }

      // アクティブ状態を更新
      document.querySelectorAll('.story-item').forEach(el => {
        el.classList.toggle('active', el.dataset.storyId === storyId);
      });

      // URLを更新（history.pushState）
      if (updateUrl) {
        const url = new URL(window.location);
        url.searchParams.set('variant', storyId);
        window.history.pushState({ storyId }, '', url);
      }
    }

    // Controlsフッターのトグル機能
    function setupControlsToggle() {
      const toggle = document.getElementById('controls-toggle');
      const footer = document.getElementById('controls-footer');

      if (toggle && footer) {
        toggle.addEventListener('click', () => {
          footer.classList.toggle('collapsed');
        });
      }
    }

    // コントロールのイベントリスナーを設定
    function setupControlListeners(storyId, variant) {
      const panel = document.getElementById('controls-panel');
      if (!panel) return;

      // 現在のargsを初期化
      if (!currentArgs[storyId]) {
        currentArgs[storyId] = { ...variant.args };
      }

      // 各コントロールにイベントリスナーを追加
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

          // argsを更新
          currentArgs[storyId][key] = value;

          // 再レンダリング
          await rerenderStory(storyId, variant, currentArgs[storyId]);
        });
      });
    }

    // バリアントを再レンダリング
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

        // Block Kit JSONとURLを更新
        const jsonElement = document.getElementById(\`json-content-\${storyId}\`);
        if (jsonElement && result.blockKitJson) {
          console.log('✅ Updating JSON preview');
          jsonElement.innerHTML = syntaxHighlight(result.blockKitJson);
        }

        // "Open in Block Kit Builder" ボタンのURLを更新
        const buttonElement = document.getElementById(\`open-builder-\${storyId}\`);
        if (buttonElement && result.url) {
          console.log('✅ Updating builder URL');
          buttonElement.href = result.url;
        }
      } catch (err) {
        console.error('❌ Failed to re-render:', err);
      }
    }

    // クリックイベントリスナー
    document.querySelectorAll('.story-item').forEach(item => {
      item.addEventListener('click', () => {
        const storyId = item.dataset.storyId;
        updateStoryDisplay(storyId);
      });
    });

    // ブラウザの戻る/進むボタンに対応
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.storyId) {
        updateStoryDisplay(event.state.storyId, false);
      }
    });

    // 初期選択（URLパラメータまたは最初のバリアント）
    if (STORY_DATA.length > 0) {
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const storyIdFromUrl = urlParams.get('variant');

        // URLパラメータにstoryIdがあり、そのバリアントが存在する場合はそれを表示
        if (storyIdFromUrl && STORY_DATA.find(v => v.id === storyIdFromUrl)) {
          updateStoryDisplay(storyIdFromUrl, false);
        } else {
          // それ以外は最初のバリアントを表示
          updateStoryDisplay(STORY_DATA[0].id);
        }
      }, 100);
    }

    // ホットリロード機能 (SSE)
    const eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
      if (event.data === 'reload') {
        console.log('🔄 File changed. Reloading page...');
        // 現在のURLをそのままリロード（クエリパラメータも保持される）
        window.location.reload();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE接続エラー:', error);
      // 接続が切れた場合は再接続を試みる
      eventSource.close();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    // ページを離れる時に接続を閉じる
    window.addEventListener('beforeunload', () => {
      eventSource.close();
    });

    // サイドバーのリサイズ機能
    (function setupSidebarResize() {
      const sidebar = document.getElementById('sidebar');
      const resizer = document.getElementById('sidebar-resizer');

      if (!sidebar || !resizer) return;

      // CSS変数を初期化
      function updateSidebarWidth(width) {
        document.documentElement.style.setProperty('--sidebar-width', width + 'px');
      }

      // 初期幅を設定
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

        // 幅の制限（min-width, max-widthに合わせる）
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
