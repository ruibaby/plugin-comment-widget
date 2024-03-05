import './user-avatar';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { formatDate, timeAgo } from './utils/date';
import baseStyles from './styles/base';
import varStyles from './styles/var';

export class BaseCommentItem extends LitElement {
  @property({ type: String })
  userAvatar: string | undefined;

  @property({ type: String })
  userDisplayName: string | undefined;

  @property({ type: String })
  userWebsite: string | undefined;

  @property({ type: String })
  creationTime: string | undefined;

  @property({ type: Boolean })
  approved: boolean | undefined;

  @property({ type: Boolean })
  breath: boolean | undefined;

  @property({ type: String })
  content = '';

  override render() {
    return html`<div class="item ${this.breath ? 'item--animate-breath' : ''}">
      <div class="item__avatar">
        <user-avatar
          src="${this.userAvatar || ''}"
          alt="${this.userDisplayName || ''}"
        ></user-avatar>
      </div>
      <div class="item__main">
        <div class="item__meta">
          ${this.userWebsite
            ? html`<a class="item__author" target="_blank" href=${this.userWebsite}>
                ${this.userDisplayName}
              </a>`
            : html`<div class="item__author">${this.userDisplayName}</div>`}
          <div class="item__meta-info" title=${formatDate(this.creationTime)}>
            ${timeAgo(this.creationTime)}
          </div>
          ${!this.approved ? html`<div class="item__meta-info">审核中</div>` : ''}
        </div>

        <div class="item__content">
          <pre><slot name="pre-content"></slot>${this.content}</pre>
        </div>

        <div class="item__actions">
          <slot name="action"></slot>
        </div>

        <slot name="footer"></slot>
      </div>
    </div>`;
  }

  static override styles = [
    varStyles,
    baseStyles,
    css`
      .item {
        display: flex;
        gap: 0.75em;
        padding: 1em 0;
      }

      .item__main {
        flex: 1;
      }

      .item__meta {
        display: flex;
        align-items: center;
        gap: 0.75em;
      }

      .item__author {
        color: var(--base-color);
        font-weight: 500;
        font-size: 0.875em;
      }

      .item__meta-info {
        color: darkcyan;
        font-size: 0.75em;
        line-height: 1em;
      }

      .item__content {
        margin-top: 0.5em;
      }

      .item__content pre {
        color: var(--base-color);
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-break: break-all;
      }

      .item__actions {
        margin-top: 0.5em;
        display: flex;
        align-items: center;
      }

      .item--animate-breath {
        animation: breath 1s ease-in-out infinite;
      }

      @keyframes breath {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.02);
        }
        100% {
          transform: scale(1);
        }
      }
    `,
  ];
}

customElements.get('base-comment-item') ||
  customElements.define('base-comment-item', BaseCommentItem);

declare global {
  interface HTMLElementTagNameMap {
    'base-comment-item': BaseCommentItem;
  }
}
