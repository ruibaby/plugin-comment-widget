import './icons/icon-loading';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import baseStyles from './styles/base';
import varStyles from './styles/var';

export class UserAvatar extends LitElement {
  @property({ type: String })
  src: string | undefined;

  @property({ type: String })
  alt: string | undefined;

  @state()
  error = false;

  @state()
  loading = false;

  override async connectedCallback() {
    super.connectedCallback();
    await this.loadImage();
  }

  async loadImage() {
    if (!this.src) {
      return Promise.resolve();
    }
    this.loading = true;
    try {
      await new Promise((resolve) => {
        const img = new Image();
        img.src = this.src || '';
        img.onload = () => {
          this.error = false;
          resolve(null);
        };
        img.onerror = () => {
          this.error = true;
          resolve(null);
        };
      });
    } catch (e) {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getPlaceholderText() {
    if (!this.alt) {
      return undefined;
    }
    const words = this.alt.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    if (words.length > 1) {
      return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    }
    return undefined;
  }

  override render() {
    if (this.src) {
      if (this.loading) {
        return html`<div class="avatar avatar--loading">
          <icon-loading></icon-loading>
        </div>`;
      }

      if (this.error) {
        return html`<div class="avatar avatar--error">
          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10Zm0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16Zm-1-5h2v2h-2v-2Zm0-8h2v6h-2V7Z"
            />
          </svg>
        </div>`;
      }

      return html`<div class="avatar">
        <img src="${this.src}" alt="${this.alt || ''}" loading="lazy" />
      </div>`;
    }

    return html`<div class="avatar">
      <span class="avatar__placeholder">${this.getPlaceholderText()}</span>
    </div>`;
  }

  static override styles = [
    varStyles,
    baseStyles,
    css`
      .avatar {
        border-radius: var(--component-avatar-rounded);
        height: var(--component-avatar-size);
        width: var(--component-avatar-size);
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: rgb(243 244 246);
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar--error svg {
        height: 1.15em;
        width: 1.15em;
        color: rgb(255 59 48);
      }

      .avatar__placeholder {
        font-weight: 500;
        color: rgb(31 41 55);
        font-size: 0.75em;
        line-height: 1em;
        user-select: none;
      }
    `,
  ];
}

customElements.get('user-avatar') || customElements.define('user-avatar', UserAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'user-avatar': UserAvatar;
  }
}
