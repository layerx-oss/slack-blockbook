/**
 * Slack Block Kit UI renderer
 * Renders Block Kit JSON as HTML that mimics Slack's appearance
 */

import { escapeHtml } from "../sanitize";

// Types for Block Kit elements
interface TextObject {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

interface ImageElement {
  type: "image";
  image_url: string;
  alt_text: string;
}

interface ButtonElement {
  type: "button";
  text: TextObject;
  action_id?: string;
  value?: string;
  url?: string;
  style?: "primary" | "danger";
}

interface StaticSelectElement {
  type: "static_select";
  placeholder?: TextObject;
  action_id?: string;
  options?: Array<{
    text: TextObject;
    value: string;
  }>;
  initial_option?: {
    text: TextObject;
    value: string;
  };
}

interface DatepickerElement {
  type: "datepicker";
  action_id?: string;
  placeholder?: TextObject;
  initial_date?: string;
}

interface TimepickerElement {
  type: "timepicker";
  action_id?: string;
  placeholder?: TextObject;
  initial_time?: string;
}

interface CheckboxesElement {
  type: "checkboxes";
  action_id?: string;
  options?: Array<{
    text: TextObject;
    value: string;
    description?: TextObject;
  }>;
  initial_options?: Array<{
    text: TextObject;
    value: string;
  }>;
}

interface RadioButtonsElement {
  type: "radio_buttons";
  action_id?: string;
  options?: Array<{
    text: TextObject;
    value: string;
    description?: TextObject;
  }>;
  initial_option?: {
    text: TextObject;
    value: string;
  };
}

interface PlainTextInputElement {
  type: "plain_text_input";
  action_id?: string;
  placeholder?: TextObject;
  initial_value?: string;
  multiline?: boolean;
}

interface EmailTextInputElement {
  type: "email_text_input";
  action_id?: string;
  placeholder?: TextObject;
  initial_value?: string;
}

interface UrlTextInputElement {
  type: "url_text_input";
  action_id?: string;
  placeholder?: TextObject;
  initial_value?: string;
}

interface NumberInputElement {
  type: "number_input";
  action_id?: string;
  placeholder?: TextObject;
  initial_value?: string;
  is_decimal_allowed?: boolean;
}

interface OverflowElement {
  type: "overflow";
  action_id?: string;
  options?: Array<{
    text: TextObject;
    value: string;
    url?: string;
  }>;
}

type Element =
  | ButtonElement
  | StaticSelectElement
  | ImageElement
  | DatepickerElement
  | TimepickerElement
  | CheckboxesElement
  | RadioButtonsElement
  | PlainTextInputElement
  | EmailTextInputElement
  | UrlTextInputElement
  | NumberInputElement
  | OverflowElement;

type ContextElement = Element | TextObject;

interface Accessory {
  type: string;
  image_url?: string;
  alt_text?: string;
  text?: TextObject;
  action_id?: string;
  value?: string;
  url?: string;
  style?: string;
  placeholder?: TextObject;
  options?: Array<{ text: TextObject; value: string }>;
  initial_option?: { text: TextObject; value: string };
}

interface Block {
  type: string;
  block_id?: string;
  text?: TextObject;
  fields?: TextObject[];
  accessory?: Accessory;
  elements?: ContextElement[];
  image_url?: string;
  alt_text?: string;
  title?: TextObject;
  label?: TextObject;
  element?: Element;
  hint?: TextObject;
  optional?: boolean;
}

interface BlockKitPayload {
  type?: "modal" | "home" | "message";
  title?: TextObject;
  submit?: TextObject;
  close?: TextObject;
  blocks?: Block[];
  attachments?: Array<{ blocks?: Block[] }>;
}

/**
 * Convert mrkdwn text to HTML
 */
function renderMrkdwn(text: string): string {
  let result = escapeHtml(text);

  // Bold: *text*
  result = result.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");

  // Italic: _text_
  result = result.replace(/\b_([^_]+)_\b/g, "<em>$1</em>");

  // Strike: ~text~
  result = result.replace(/~([^~]+)~/g, "<del>$1</del>");

  // Code: `text`
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="slack-inline-code">$1</code>'
  );

  // Code block: ```text```
  result = result.replace(
    /```([^`]+)```/g,
    '<pre class="slack-code-block">$1</pre>'
  );

  // Links: <url|text> or <url>
  result = result.replace(/<([^|>]+)\|([^>]+)>/g, (_, url, text) => {
    return `<a href="${escapeHtml(url)}" class="slack-link" target="_blank">${escapeHtml(text)}</a>`;
  });
  result = result.replace(/<(https?:\/\/[^>]+)>/g, (_, url) => {
    return `<a href="${escapeHtml(url)}" class="slack-link" target="_blank">${escapeHtml(url)}</a>`;
  });

  // User mentions: <@U123>
  result = result.replace(
    /<@([A-Z0-9]+)>/g,
    '<span class="slack-mention">@user</span>'
  );

  // Channel mentions: <#C123|channel>
  result = result.replace(
    /<#([A-Z0-9]+)\|([^>]+)>/g,
    '<span class="slack-mention">#$2</span>'
  );

  // Line breaks
  result = result.replace(/\n/g, "<br>");

  return result;
}

/**
 * Render text object
 */
function renderTextObject(textObj: TextObject | undefined): string {
  if (!textObj) return "";

  if (textObj.type === "mrkdwn") {
    return renderMrkdwn(textObj.text);
  }
  return escapeHtml(textObj.text);
}

/**
 * Render button element
 */
function renderButton(element: ButtonElement): string {
  const styleClass =
    element.style === "primary"
      ? "slack-button-primary"
      : element.style === "danger"
        ? "slack-button-danger"
        : "";

  return `
    <button class="slack-button ${styleClass}">
      ${renderTextObject(element.text)}
    </button>
  `;
}

/**
 * Render select element
 */
function renderStaticSelect(element: StaticSelectElement): string {
  const displayText = element.initial_option
    ? renderTextObject(element.initial_option.text)
    : element.placeholder
      ? renderTextObject(element.placeholder)
      : "Select an option";

  return `
    <div class="slack-select">
      <span class="slack-select-text">${displayText}</span>
      <span class="slack-select-arrow">▼</span>
    </div>
  `;
}

/**
 * Render datepicker element
 */
function renderDatepicker(element: DatepickerElement): string {
  const displayText = element.initial_date
    ? element.initial_date
    : element.placeholder
      ? renderTextObject(element.placeholder)
      : "Select a date";

  return `
    <div class="slack-datepicker">
      <span class="slack-datepicker-icon">📅</span>
      <span class="slack-datepicker-text">${escapeHtml(displayText)}</span>
    </div>
  `;
}

/**
 * Render timepicker element
 */
function renderTimepicker(element: TimepickerElement): string {
  const displayText = element.initial_time
    ? element.initial_time
    : element.placeholder
      ? renderTextObject(element.placeholder)
      : "Select time";

  return `
    <div class="slack-timepicker">
      <span class="slack-timepicker-icon">🕐</span>
      <span class="slack-timepicker-text">${escapeHtml(displayText)}</span>
    </div>
  `;
}

/**
 * Render checkboxes element
 */
function renderCheckboxes(element: CheckboxesElement): string {
  const options = element.options ?? [];
  const initialValues = new Set(
    (element.initial_options ?? []).map((o) => o.value)
  );

  const optionsHtml = options
    .map((option) => {
      const checked = initialValues.has(option.value);
      const descriptionHtml = option.description
        ? `<div class="slack-checkbox-description">${renderTextObject(option.description)}</div>`
        : "";

      return `
      <label class="slack-checkbox-option">
        <input type="checkbox" class="slack-checkbox-input" ${checked ? "checked" : ""} disabled>
        <span class="slack-checkbox-checkmark"></span>
        <div class="slack-checkbox-content">
          <span class="slack-checkbox-label">${renderTextObject(option.text)}</span>
          ${descriptionHtml}
        </div>
      </label>
    `;
    })
    .join("");

  return `<div class="slack-checkboxes">${optionsHtml}</div>`;
}

/**
 * Render radio buttons element
 */
function renderRadioButtons(element: RadioButtonsElement): string {
  const options = element.options ?? [];
  const initialValue = element.initial_option?.value;

  const optionsHtml = options
    .map((option) => {
      const checked = option.value === initialValue;
      const descriptionHtml = option.description
        ? `<div class="slack-radio-description">${renderTextObject(option.description)}</div>`
        : "";

      return `
      <label class="slack-radio-option">
        <input type="radio" class="slack-radio-input" ${checked ? "checked" : ""} disabled>
        <span class="slack-radio-checkmark"></span>
        <div class="slack-radio-content">
          <span class="slack-radio-label">${renderTextObject(option.text)}</span>
          ${descriptionHtml}
        </div>
      </label>
    `;
    })
    .join("");

  return `<div class="slack-radio-buttons">${optionsHtml}</div>`;
}

/**
 * Render plain text input element
 */
function renderPlainTextInput(element: PlainTextInputElement): string {
  const placeholder = element.placeholder
    ? renderTextObject(element.placeholder)
    : "";
  const value = element.initial_value ? escapeHtml(element.initial_value) : "";

  if (element.multiline) {
    return `
      <textarea class="slack-text-input slack-textarea" placeholder="${placeholder}" disabled>${value}</textarea>
    `;
  }

  return `
    <input type="text" class="slack-text-input" placeholder="${placeholder}" value="${value}" disabled>
  `;
}

/**
 * Render email text input element
 */
function renderEmailTextInput(element: EmailTextInputElement): string {
  const placeholder = element.placeholder
    ? renderTextObject(element.placeholder)
    : "";
  const value = element.initial_value ? escapeHtml(element.initial_value) : "";

  return `
    <div class="slack-text-input-wrapper">
      <span class="slack-input-icon">✉️</span>
      <input type="email" class="slack-text-input slack-email-input" placeholder="${placeholder}" value="${value}" disabled>
    </div>
  `;
}

/**
 * Render URL text input element
 */
function renderUrlTextInput(element: UrlTextInputElement): string {
  const placeholder = element.placeholder
    ? renderTextObject(element.placeholder)
    : "";
  const value = element.initial_value ? escapeHtml(element.initial_value) : "";

  return `
    <div class="slack-text-input-wrapper">
      <span class="slack-input-icon">🔗</span>
      <input type="url" class="slack-text-input slack-url-input" placeholder="${placeholder}" value="${value}" disabled>
    </div>
  `;
}

/**
 * Render number input element
 */
function renderNumberInput(element: NumberInputElement): string {
  const placeholder = element.placeholder
    ? renderTextObject(element.placeholder)
    : "";
  const value = element.initial_value ? escapeHtml(element.initial_value) : "";

  return `
    <div class="slack-text-input-wrapper">
      <span class="slack-input-icon">#</span>
      <input type="number" class="slack-text-input slack-number-input" placeholder="${placeholder}" value="${value}" disabled>
    </div>
  `;
}

/**
 * Render overflow menu element
 */
function renderOverflow(_element: OverflowElement): string {
  return `
    <button class="slack-overflow">
      <span class="slack-overflow-dots">⋮</span>
    </button>
  `;
}

/**
 * Render accessory element
 */
function renderAccessory(accessory: Accessory): string {
  switch (accessory.type) {
    case "image":
      return `
        <img
          src="${escapeHtml(accessory.image_url ?? "")}"
          alt="${escapeHtml(accessory.alt_text ?? "")}"
          class="slack-accessory-image"
        />
      `;
    case "button":
      return renderButton(accessory as ButtonElement);
    case "static_select":
      return renderStaticSelect(accessory as StaticSelectElement);
    case "datepicker":
      return renderDatepicker(accessory as DatepickerElement);
    case "timepicker":
      return renderTimepicker(accessory as TimepickerElement);
    case "overflow":
      return renderOverflow(accessory as OverflowElement);
    case "checkboxes":
      return renderCheckboxes(accessory as CheckboxesElement);
    case "radio_buttons":
      return renderRadioButtons(accessory as RadioButtonsElement);
    default:
      return "";
  }
}

/**
 * Render action element
 */
function renderElement(element: Element): string {
  switch (element.type) {
    case "button":
      return renderButton(element);
    case "static_select":
      return renderStaticSelect(element);
    case "datepicker":
      return renderDatepicker(element);
    case "timepicker":
      return renderTimepicker(element);
    case "checkboxes":
      return renderCheckboxes(element);
    case "radio_buttons":
      return renderRadioButtons(element);
    case "plain_text_input":
      return renderPlainTextInput(element);
    case "email_text_input":
      return renderEmailTextInput(element);
    case "url_text_input":
      return renderUrlTextInput(element);
    case "number_input":
      return renderNumberInput(element);
    case "overflow":
      return renderOverflow(element);
    case "image":
      return `
        <img
          src="${escapeHtml(element.image_url)}"
          alt="${escapeHtml(element.alt_text)}"
          class="slack-context-image"
        />
      `;
    default:
      return "";
  }
}

/**
 * Render a single block
 */
function renderBlock(block: Block): string {
  switch (block.type) {
    case "header":
      return `
        <div class="slack-block slack-header">
          <h2 class="slack-header-text">${renderTextObject(block.text)}</h2>
        </div>
      `;

    case "section": {
      const textHtml = block.text
        ? `<div class="slack-section-text">${renderTextObject(block.text)}</div>`
        : "";

      const fieldsHtml = block.fields
        ? `<div class="slack-section-fields">${block.fields.map((f) => `<div class="slack-section-field">${renderTextObject(f)}</div>`).join("")}</div>`
        : "";

      const accessoryHtml = block.accessory
        ? `<div class="slack-section-accessory">${renderAccessory(block.accessory)}</div>`
        : "";

      return `
        <div class="slack-block slack-section">
          <div class="slack-section-content">
            ${textHtml}
            ${fieldsHtml}
          </div>
          ${accessoryHtml}
        </div>
      `;
    }

    case "divider":
      return '<div class="slack-block slack-divider"><hr></div>';

    case "image": {
      const titleHtml = block.title
        ? `<div class="slack-image-title">${renderTextObject(block.title)}</div>`
        : "";

      return `
        <div class="slack-block slack-image-block">
          ${titleHtml}
          <img
            src="${escapeHtml(block.image_url ?? "")}"
            alt="${escapeHtml(block.alt_text ?? "")}"
            class="slack-block-image"
          />
        </div>
      `;
    }

    case "context": {
      const elementsHtml = (block.elements ?? [])
        .map((el) => {
          if (el.type === "image") {
            return `
            <img
              src="${escapeHtml((el as ImageElement).image_url)}"
              alt="${escapeHtml((el as ImageElement).alt_text)}"
              class="slack-context-image"
            />
          `;
          }
          if (el.type === "plain_text" || el.type === "mrkdwn") {
            return `<span class="slack-context-text">${renderTextObject(el as TextObject)}</span>`;
          }
          return "";
        })
        .join("");

      return `
        <div class="slack-block slack-context">
          ${elementsHtml}
        </div>
      `;
    }

    case "actions": {
      const actionsHtml = (block.elements ?? [])
        .map((el) => renderElement(el as Element))
        .join("");

      return `
        <div class="slack-block slack-actions">
          ${actionsHtml}
        </div>
      `;
    }

    case "input": {
      const labelHtml = block.label
        ? `<label class="slack-input-label">${renderTextObject(block.label)}${!block.optional ? '<span class="slack-required">*</span>' : ""}</label>`
        : "";

      const elementHtml = block.element ? renderElement(block.element) : "";

      const hintHtml = block.hint
        ? `<div class="slack-input-hint">${renderTextObject(block.hint)}</div>`
        : "";

      return `
        <div class="slack-block slack-input">
          ${labelHtml}
          ${elementHtml}
          ${hintHtml}
        </div>
      `;
    }

    case "rich_text":
      return `
        <div class="slack-block slack-rich-text">
          <div class="slack-rich-text-content">[Rich Text Block]</div>
        </div>
      `;

    case "video":
      return `
        <div class="slack-block slack-video">
          <div class="slack-video-placeholder">
            <span>🎬</span>
            <span>Video</span>
          </div>
        </div>
      `;

    case "file":
      return `
        <div class="slack-block slack-file">
          <div class="slack-file-placeholder">
            <span>📎</span>
            <span>File attachment</span>
          </div>
        </div>
      `;

    default:
      return `
        <div class="slack-block slack-unknown">
          <span class="slack-unknown-type">Unknown block type: ${escapeHtml(block.type)}</span>
        </div>
      `;
  }
}

/**
 * Render modal header (Block Kit Builder style)
 */
function renderModalHeader(payload: BlockKitPayload): string {
  if (payload.type !== "modal") return "";

  const titleText = payload.title ? renderTextObject(payload.title) : "Modal";

  return `
    <div class="slack-modal-header">
      <div class="slack-modal-header-left">
        <div class="slack-modal-app-icon">📋</div>
        <div class="slack-modal-title">${titleText}</div>
      </div>
      <button class="slack-modal-close-x">×</button>
    </div>
  `;
}

/**
 * Render modal footer (Block Kit Builder style)
 */
function renderModalFooter(payload: BlockKitPayload): string {
  if (payload.type !== "modal") return "";

  const closeText = payload.close ? renderTextObject(payload.close) : "Cancel";
  const submitText = payload.submit
    ? renderTextObject(payload.submit)
    : "Submit";

  return `
    <div class="slack-modal-footer">
      <button class="slack-modal-close">${closeText}</button>
      ${payload.submit ? `<button class="slack-modal-submit">${submitText}</button>` : ""}
    </div>
  `;
}

/**
 * Render Home tab header
 */
function renderHomeHeader(): string {
  return `
    <div class="slack-home-header">
      <span class="slack-home-icon">🏠</span>
      <span class="slack-home-title">Home</span>
    </div>
  `;
}

/**
 * Render message header (simulated)
 */
function renderMessageHeader(): string {
  return `
    <div class="slack-message-header">
      <div class="slack-message-avatar">🤖</div>
      <div class="slack-message-info">
        <span class="slack-message-author">App</span>
        <span class="slack-message-time">Now</span>
      </div>
    </div>
  `;
}

/**
 * Main render function: converts Block Kit JSON to HTML
 */
export function renderBlockKitPreview(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return '<div class="slack-preview-wrapper"><div class="slack-preview-error">Invalid Block Kit payload</div></div>';
  }

  // Handle array format (jsx-slack returns blocks as array)
  let data: BlockKitPayload;
  if (Array.isArray(payload)) {
    data = { blocks: payload as Block[] };
  } else {
    data = payload as BlockKitPayload;
  }

  const blocks = data.blocks ?? [];

  // Determine view type
  const viewType = data.type ?? "message";

  let headerHtml = "";
  let footerHtml = "";
  let wrapperClass = "slack-preview";

  switch (viewType) {
    case "modal":
      headerHtml = renderModalHeader(data);
      footerHtml = renderModalFooter(data);
      wrapperClass += " slack-preview-modal";
      break;
    case "home":
      headerHtml = renderHomeHeader();
      wrapperClass += " slack-preview-home";
      break;
    default:
      headerHtml = renderMessageHeader();
      wrapperClass += " slack-preview-message";
  }

  // Render all blocks
  const blocksHtml = blocks.map((block) => renderBlock(block)).join("");

  // Handle attachments (for message type)
  let attachmentsHtml = "";
  if (data.attachments && data.attachments.length > 0) {
    attachmentsHtml = data.attachments
      .map((att) => {
        const attBlocks = att.blocks ?? [];
        return `
        <div class="slack-attachment">
          ${attBlocks.map((block) => renderBlock(block)).join("")}
        </div>
      `;
      })
      .join("");
  }

  return `
    <div class="slack-preview-wrapper">
      <div class="${wrapperClass}">
        ${headerHtml}
        <div class="slack-preview-body">
          ${blocksHtml}
          ${attachmentsHtml}
        </div>
        ${footerHtml}
      </div>
    </div>
  `;
}

/**
 * Generate client-side rendering function as string
 */
export function generateSlackRendererScript(): string {
  return `
    // Slack Block Kit renderer (client-side)
    function renderMrkdwn(text) {
      let result = escapeHtml(text);
      result = result.replace(/\\*([^*]+)\\*/g, '<strong>$1</strong>');
      result = result.replace(/\\b_([^_]+)_\\b/g, '<em>$1</em>');
      result = result.replace(/~([^~]+)~/g, '<del>$1</del>');
      result = result.replace(/\`([^\`]+)\`/g, '<code class="slack-inline-code">$1</code>');
      result = result.replace(/\`\`\`([^\`]+)\`\`\`/g, '<pre class="slack-code-block">$1</pre>');
      result = result.replace(/<([^|>]+)\\|([^>]+)>/g, (_, url, text) => {
        return '<a href="' + escapeHtml(url) + '" class="slack-link" target="_blank">' + escapeHtml(text) + '</a>';
      });
      result = result.replace(/<(https?:\\/\\/[^>]+)>/g, (_, url) => {
        return '<a href="' + escapeHtml(url) + '" class="slack-link" target="_blank">' + escapeHtml(url) + '</a>';
      });
      result = result.replace(/<@([A-Z0-9]+)>/g, '<span class="slack-mention">@user</span>');
      result = result.replace(/<#([A-Z0-9]+)\\|([^>]+)>/g, '<span class="slack-mention">#$2</span>');
      result = result.replace(/\\n/g, '<br>');
      return result;
    }

    function renderTextObject(textObj) {
      if (!textObj) return '';
      if (textObj.type === 'mrkdwn') {
        return renderMrkdwn(textObj.text);
      }
      return escapeHtml(textObj.text);
    }

    function renderButton(element) {
      const styleClass = element.style === 'primary' ? 'slack-button-primary' :
                         element.style === 'danger' ? 'slack-button-danger' : '';
      return '<button class="slack-button ' + styleClass + '">' + renderTextObject(element.text) + '</button>';
    }

    function renderStaticSelect(element) {
      const displayText = element.initial_option ? renderTextObject(element.initial_option.text) :
                          element.placeholder ? renderTextObject(element.placeholder) : 'Select an option';
      return '<div class="slack-select"><span class="slack-select-text">' + displayText + '</span><span class="slack-select-arrow">▼</span></div>';
    }

    function renderDatepicker(element) {
      const displayText = element.initial_date ? element.initial_date :
                          element.placeholder ? renderTextObject(element.placeholder) : 'Select a date';
      return '<div class="slack-datepicker"><span class="slack-datepicker-icon">📅</span><span class="slack-datepicker-text">' + escapeHtml(displayText) + '</span></div>';
    }

    function renderTimepicker(element) {
      const displayText = element.initial_time ? element.initial_time :
                          element.placeholder ? renderTextObject(element.placeholder) : 'Select time';
      return '<div class="slack-timepicker"><span class="slack-timepicker-icon">🕐</span><span class="slack-timepicker-text">' + escapeHtml(displayText) + '</span></div>';
    }

    function renderCheckboxes(element) {
      const options = element.options || [];
      const initialValues = new Set((element.initial_options || []).map(o => o.value));
      return '<div class="slack-checkboxes">' + options.map(option => {
        const checked = initialValues.has(option.value);
        const descriptionHtml = option.description ? '<div class="slack-checkbox-description">' + renderTextObject(option.description) + '</div>' : '';
        return '<label class="slack-checkbox-option"><input type="checkbox" class="slack-checkbox-input" ' + (checked ? 'checked' : '') + ' disabled><span class="slack-checkbox-checkmark"></span><div class="slack-checkbox-content"><span class="slack-checkbox-label">' + renderTextObject(option.text) + '</span>' + descriptionHtml + '</div></label>';
      }).join('') + '</div>';
    }

    function renderRadioButtons(element) {
      const options = element.options || [];
      const initialValue = element.initial_option?.value;
      return '<div class="slack-radio-buttons">' + options.map(option => {
        const checked = option.value === initialValue;
        const descriptionHtml = option.description ? '<div class="slack-radio-description">' + renderTextObject(option.description) + '</div>' : '';
        return '<label class="slack-radio-option"><input type="radio" class="slack-radio-input" ' + (checked ? 'checked' : '') + ' disabled><span class="slack-radio-checkmark"></span><div class="slack-radio-content"><span class="slack-radio-label">' + renderTextObject(option.text) + '</span>' + descriptionHtml + '</div></label>';
      }).join('') + '</div>';
    }

    function renderPlainTextInput(element) {
      const placeholder = element.placeholder ? renderTextObject(element.placeholder) : '';
      const value = element.initial_value ? escapeHtml(element.initial_value) : '';
      if (element.multiline) {
        return '<textarea class="slack-text-input slack-textarea" placeholder="' + placeholder + '" disabled>' + value + '</textarea>';
      }
      return '<input type="text" class="slack-text-input" placeholder="' + placeholder + '" value="' + value + '" disabled>';
    }

    function renderEmailTextInput(element) {
      const placeholder = element.placeholder ? renderTextObject(element.placeholder) : '';
      const value = element.initial_value ? escapeHtml(element.initial_value) : '';
      return '<div class="slack-text-input-wrapper"><span class="slack-input-icon">✉️</span><input type="email" class="slack-text-input slack-email-input" placeholder="' + placeholder + '" value="' + value + '" disabled></div>';
    }

    function renderUrlTextInput(element) {
      const placeholder = element.placeholder ? renderTextObject(element.placeholder) : '';
      const value = element.initial_value ? escapeHtml(element.initial_value) : '';
      return '<div class="slack-text-input-wrapper"><span class="slack-input-icon">🔗</span><input type="url" class="slack-text-input slack-url-input" placeholder="' + placeholder + '" value="' + value + '" disabled></div>';
    }

    function renderNumberInput(element) {
      const placeholder = element.placeholder ? renderTextObject(element.placeholder) : '';
      const value = element.initial_value ? escapeHtml(element.initial_value) : '';
      return '<div class="slack-text-input-wrapper"><span class="slack-input-icon">#</span><input type="number" class="slack-text-input slack-number-input" placeholder="' + placeholder + '" value="' + value + '" disabled></div>';
    }

    function renderOverflow(element) {
      return '<button class="slack-overflow"><span class="slack-overflow-dots">⋮</span></button>';
    }

    function renderAccessory(accessory) {
      switch (accessory.type) {
        case 'image':
          return '<img src="' + escapeHtml(accessory.image_url || '') + '" alt="' + escapeHtml(accessory.alt_text || '') + '" class="slack-accessory-image" />';
        case 'button':
          return renderButton(accessory);
        case 'static_select':
          return renderStaticSelect(accessory);
        case 'datepicker':
          return renderDatepicker(accessory);
        case 'timepicker':
          return renderTimepicker(accessory);
        case 'overflow':
          return renderOverflow(accessory);
        case 'checkboxes':
          return renderCheckboxes(accessory);
        case 'radio_buttons':
          return renderRadioButtons(accessory);
        default:
          return '';
      }
    }

    function renderElement(element) {
      switch (element.type) {
        case 'button':
          return renderButton(element);
        case 'static_select':
          return renderStaticSelect(element);
        case 'datepicker':
          return renderDatepicker(element);
        case 'timepicker':
          return renderTimepicker(element);
        case 'checkboxes':
          return renderCheckboxes(element);
        case 'radio_buttons':
          return renderRadioButtons(element);
        case 'plain_text_input':
          return renderPlainTextInput(element);
        case 'email_text_input':
          return renderEmailTextInput(element);
        case 'url_text_input':
          return renderUrlTextInput(element);
        case 'number_input':
          return renderNumberInput(element);
        case 'overflow':
          return renderOverflow(element);
        case 'image':
          return '<img src="' + escapeHtml(element.image_url) + '" alt="' + escapeHtml(element.alt_text) + '" class="slack-context-image" />';
        default:
          return '';
      }
    }

    function renderBlock(block) {
      switch (block.type) {
        case 'header':
          return '<div class="slack-block slack-header"><h2 class="slack-header-text">' + renderTextObject(block.text) + '</h2></div>';

        case 'section': {
          const textHtml = block.text ? '<div class="slack-section-text">' + renderTextObject(block.text) + '</div>' : '';
          const fieldsHtml = block.fields ? '<div class="slack-section-fields">' + block.fields.map(f => '<div class="slack-section-field">' + renderTextObject(f) + '</div>').join('') + '</div>' : '';
          const accessoryHtml = block.accessory ? '<div class="slack-section-accessory">' + renderAccessory(block.accessory) + '</div>' : '';
          return '<div class="slack-block slack-section"><div class="slack-section-content">' + textHtml + fieldsHtml + '</div>' + accessoryHtml + '</div>';
        }

        case 'divider':
          return '<div class="slack-block slack-divider"><hr></div>';

        case 'image': {
          const titleHtml = block.title ? '<div class="slack-image-title">' + renderTextObject(block.title) + '</div>' : '';
          return '<div class="slack-block slack-image-block">' + titleHtml + '<img src="' + escapeHtml(block.image_url || '') + '" alt="' + escapeHtml(block.alt_text || '') + '" class="slack-block-image" /></div>';
        }

        case 'context': {
          const elementsHtml = (block.elements || []).map(el => {
            if (el.type === 'image') {
              return '<img src="' + escapeHtml(el.image_url) + '" alt="' + escapeHtml(el.alt_text) + '" class="slack-context-image" />';
            }
            // Context blocks can contain plain_text or mrkdwn text objects
            if ('text' in el && (el.type === 'plain_text' || el.type === 'mrkdwn')) {
              return '<span class="slack-context-text">' + renderTextObject(el) + '</span>';
            }
            return '';
          }).join('');
          return '<div class="slack-block slack-context">' + elementsHtml + '</div>';
        }

        case 'actions': {
          const actionsHtml = (block.elements || []).map(el => renderElement(el)).join('');
          return '<div class="slack-block slack-actions">' + actionsHtml + '</div>';
        }

        case 'input': {
          const labelHtml = block.label ? '<label class="slack-input-label">' + renderTextObject(block.label) + (!block.optional ? '<span class="slack-required">*</span>' : '') + '</label>' : '';
          const elementHtml = block.element ? renderElement(block.element) : '';
          const hintHtml = block.hint ? '<div class="slack-input-hint">' + renderTextObject(block.hint) + '</div>' : '';
          return '<div class="slack-block slack-input">' + labelHtml + elementHtml + hintHtml + '</div>';
        }

        case 'rich_text':
          return '<div class="slack-block slack-rich-text"><div class="slack-rich-text-content">[Rich Text Block]</div></div>';

        case 'video':
          return '<div class="slack-block slack-video"><div class="slack-video-placeholder"><span>🎬</span><span>Video</span></div></div>';

        case 'file':
          return '<div class="slack-block slack-file"><div class="slack-file-placeholder"><span>📎</span><span>File attachment</span></div></div>';

        default:
          return '<div class="slack-block slack-unknown"><span class="slack-unknown-type">Unknown block type: ' + escapeHtml(block.type) + '</span></div>';
      }
    }

    function renderModalHeader(payload) {
      if (payload.type !== 'modal') return '';
      const titleText = payload.title ? renderTextObject(payload.title) : 'Modal';
      return '<div class="slack-modal-header"><div class="slack-modal-header-left"><div class="slack-modal-app-icon">📋</div><div class="slack-modal-title">' + titleText + '</div></div><button class="slack-modal-close-x">×</button></div>';
    }

    function renderModalFooter(payload) {
      if (payload.type !== 'modal') return '';
      const closeText = payload.close ? renderTextObject(payload.close) : 'Cancel';
      const submitText = payload.submit ? renderTextObject(payload.submit) : 'Submit';
      return '<div class="slack-modal-footer"><button class="slack-modal-close">' + closeText + '</button>' + (payload.submit ? '<button class="slack-modal-submit">' + submitText + '</button>' : '') + '</div>';
    }

    function renderHomeHeader() {
      return '<div class="slack-home-header"><span class="slack-home-icon">🏠</span><span class="slack-home-title">Home</span></div>';
    }

    function renderMessageHeader() {
      return '<div class="slack-message-header"><div class="slack-message-avatar">🤖</div><div class="slack-message-info"><span class="slack-message-author">App</span><span class="slack-message-time">Now</span></div></div>';
    }

    function renderBlockKitPreview(payload) {
      if (!payload || typeof payload !== 'object') {
        return '<div class="slack-preview-wrapper"><div class="slack-preview-error">Invalid Block Kit payload</div></div>';
      }

      // Handle array format (jsx-slack returns blocks as array)
      let data = payload;
      if (Array.isArray(payload)) {
        data = { blocks: payload };
      }

      const blocks = data.blocks || [];
      const viewType = data.type || 'message';

      let headerHtml = '';
      let footerHtml = '';
      let wrapperClass = 'slack-preview';

      switch (viewType) {
        case 'modal':
          headerHtml = renderModalHeader(data);
          footerHtml = renderModalFooter(data);
          wrapperClass += ' slack-preview-modal';
          break;
        case 'home':
          headerHtml = renderHomeHeader();
          wrapperClass += ' slack-preview-home';
          break;
        default:
          headerHtml = renderMessageHeader();
          wrapperClass += ' slack-preview-message';
      }

      const blocksHtml = blocks.map(block => renderBlock(block)).join('');

      let attachmentsHtml = '';
      if (data.attachments && data.attachments.length > 0) {
        attachmentsHtml = data.attachments.map(att => {
          const attBlocks = att.blocks || [];
          return '<div class="slack-attachment">' + attBlocks.map(block => renderBlock(block)).join('') + '</div>';
        }).join('');
      }

      return '<div class="slack-preview-wrapper"><div class="' + wrapperClass + '">' + headerHtml + '<div class="slack-preview-body">' + blocksHtml + attachmentsHtml + '</div>' + footerHtml + '</div></div>';
    }
  `;
}
