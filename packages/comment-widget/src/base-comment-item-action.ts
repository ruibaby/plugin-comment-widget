import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

export class BaseCommentItemAction extends LitElement {
  @property({ type: String })
  text = '';

  override render() {
    return html`
      <div slot="action" class="item-action">
        <div class="item-action__icon">
          <slot name="icon"></slot>
        </div>
        <span class="item-action__text"> ${this.text} </span>
      </div>
    `;
  }

  static override styles = css`
    .item-action {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      gap: 0.1em;
    }

    .item-action__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 0.15s;
      padding: 0.45em;
    }

    .item-action__icon ::slotted(svg) {
      color: var(--base-info-color);
      width: 1em;
      height: 1em;
    }

    .item-action__text {
      color: var(--base-info-color);
      user-select: none;
      font-size: 0.75em;
    }

    .item-action:hover .item-action__icon {
      background-color: var(--component-comment-item-action-bg-color-hover);
    }

    .item-action:hover .item-action__text {
      color: var(--component-comment-item-action-color-hover);
    }

    .item-action:hover .item-action__icon ::slotted(svg) {
      color: var(--component-comment-item-action-color-hover);
    }
  `;
}

customElements.get('base-comment-item-action') ||
  customElements.define('base-comment-item-action', BaseCommentItemAction);

declare global {
  interface HTMLElementTagNameMap {
    'base-comment-item-action': BaseCommentItemAction;
  }
}
