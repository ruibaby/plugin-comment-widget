import './emoji-button';
import { LitElement, css, html } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import {
  allowAnonymousCommentsContext,
  baseUrlContext,
  currentUserContext,
  groupContext,
  kindContext,
  nameContext,
} from './context';
import { state } from 'lit/decorators.js';
import type { User } from '@halo-dev/api-client';
import baseStyles from './styles/base';
import { consume } from '@lit/context';
import varStyles from './styles/var';

export class BaseForm extends LitElement {
  @consume({ context: baseUrlContext })
  @state()
  baseUrl = '';

  @consume({ context: currentUserContext, subscribe: true })
  @state()
  currentUser: User | undefined;

  @consume({ context: allowAnonymousCommentsContext, subscribe: true })
  @state()
  allowAnonymousComments = false;

  @consume({ context: groupContext })
  @state()
  group = '';

  @consume({ context: kindContext })
  @state()
  kind = '';

  @consume({ context: nameContext })
  @state()
  name = '';

  textareaRef: Ref<HTMLTextAreaElement> = createRef<HTMLTextAreaElement>();

  get customAccount() {
    return JSON.parse(localStorage.getItem('halo-comment-custom-account') || '{}');
  }

  get loginUrl() {
    const parentDomId = `#comment-${[this.group?.replaceAll('.', '-'), this.kind, this.name]
      .join('-')
      .replaceAll(/-+/g, '-')}`;

    return `/console/login?redirect_uri=${encodeURIComponent(window.location.href + parentDomId)}`;
  }

  handleOpenLoginPage() {
    window.location.href = this.loginUrl;
  }

  async handleLogout() {
    if (window.confirm('确定要退出登录吗？')) {
      try {
        const response = await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'X-Xsrf-Token':
              document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN'))
                ?.split('=')[1] || '',
          },
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Failed to logout');
        }

        window.location.reload();
      } catch (error) {
        console.error('Failed to logout', error);
      }
    }
  }

  renderAccountInfo() {
    return html`<div class="form__account-info">
      ${this.currentUser?.spec.avatar ? html`<img src=${this.currentUser.spec.avatar} />` : ''}
      <span> ${this.currentUser?.spec.displayName || this.currentUser?.metadata.name} </span>
      <button @click=${this.handleLogout} type="button" class="form__button--logout">
        退出登录
      </button>
    </div>`;
  }

  onContentInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    // reset height to auto to make sure it can grow
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }

  onEmojiSelect(e: CustomEvent) {
    const data = e.detail;
    if (this.textareaRef.value) {
      this.textareaRef.value.value += data.native;
      this.textareaRef.value.focus();
    }
  }

  override render() {
    return html`
      <form class="form" @submit="${this.onSubmit}">
        <textarea
          class="form__editor"
          ${ref(this.textareaRef)}
          placeholder="编写评论"
          rows="4"
          name="content"
          required
          @input=${this.onContentInput}
        ></textarea>

        ${!this.currentUser && this.allowAnonymousComments
          ? html`<div class="form__anonymous-inputs">
              <input
                name="displayName"
                value=${this.customAccount.displayName}
                type="text"
                placeholder="昵称"
                required
              />
              <input
                name="email"
                value=${this.customAccount.email}
                type="email"
                placeholder="电子邮件"
                required
              />
              <input
                name="website"
                value=${this.customAccount.website}
                type="url"
                placeholder="网站"
              />
              <a href=${this.loginUrl} rel="nofollow"> （已有该站点的账号） </a>
            </div>`
          : ''}

        <div class="form__footer">
          <div class="form-account">
            ${this.currentUser ? this.renderAccountInfo() : ''}
            ${!this.currentUser && !this.allowAnonymousComments
              ? html`<button
                  @click=${this.handleOpenLoginPage}
                  class="form__button--login"
                  type="button"
                >
                  登录
                </button> `
              : ''}
          </div>
          <div class="form__actions">
            <emoji-button @emoji-select=${this.onEmojiSelect}></emoji-button>
            <button type="submit" class="form__button--submit">
              <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" class="h-full w-full">
                <path
                  fill="currentColor"
                  d="M8 7.71L18 12L8 16.29v-3.34l7.14-.95L8 11.05V7.71M12 2a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8Z"
                ></path>
              </svg>
              提交评论
            </button>
          </div>
        </div>
      </form>
    `;
  }

  onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // store account info
    localStorage.setItem(
      'halo-comment-custom-account',
      JSON.stringify({
        displayName: data.displayName,
        email: data.email,
        website: data.website,
      })
    );

    const event = new CustomEvent('submit', {
      detail: data,
    });
    this.dispatchEvent(event);
  }

  resetForm() {
    const form = this.shadowRoot?.querySelector('form');
    form?.reset();
  }

  static override styles = [
    varStyles,
    baseStyles,
    css`
      .form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1em;
      }

      .form__editor {
        height: auto;
      }

      .form__anonymous-inputs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5em;
        align-items: center;
      }

      @media (max-width: 640px) {
        .form__anonymous-inputs {
          grid-template-columns: 1fr;
        }
      }

      .form__anonymous-inputs a {
        font-size: 0.75em;
        line-height: 1em;
        color: darkcyan;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
        user-select: none;
      }

      .form__anonymous-inputs a:hover {
        color: var(--base-color);
      }

      input,
      textarea {
        border-radius: var(--base-border-radius);
        background: var(--component-form-input-bg-color);
        color: var(--component-form-input-color);
        border: 0.05em solid var(--component-form-input-border-color);
        font-size: 0.875em;
        display: block;
        height: 2.25em;
        max-width: 100%;
        outline: 0;
        padding: 0.4em 0.75em;
        width: 100%;
        transition:
          background 0.2s,
          border 0.2s,
          box-shadow 0.2s,
          color 0.2s;
      }

      input:focus,
      textarea:focus {
        border-color: var(--component-form-input-border-color-focus);
        box-shadow: var(--component-form-input-box-shadow-focus);
      }

      .form__account-info {
        color: var(--base-color);
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75em;
      }

      .form__account-info img {
        height: 2em;
        width: 2em;
        border-radius: 9999px;
      }

      .form__account-info span {
        font-weight: 500;
        font-size: 0.9em;
      }

      .form__button--logout,
      .form__button--login {
        border-radius: var(--base-border-radius);
        background: var(--component-form-button-login-bg-color);
        border: 1px solid var(--component-form-button-login-border-color);
        font-size: 0.75em;
        outline: none;
        padding: 0.2rem 0.75em;
        user-select: none;
      }

      .form__button--logout:hover,
      .form__button--login:hover {
        background: var(--component-form-button-login-bg-color-hover);
      }

      .form__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .form__actions {
        display: flex;
        align-items: center;
        gap: 0.75em;
      }

      .form__button--submit {
        border-radius: var(--base-border-radius);
        background-color: var(--component-form-button-submit-bg-color);
        color: var(--component-form-button-submit-color);
        border: 1px solid var(--component-form-button-submit-border-color);
        font-size: 0.875em;
        display: inline-flex;
        flex-shrink: 0;
        user-select: none;
        align-items: center;
        justify-content: center;
        padding: 0.5em 1em;
        text-align: center;
        vertical-align: middle;
        text-decoration-line: none;
        outline-width: 0px;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 0.15s;
        gap: 0.5em;
      }

      .form__button--submit:hover {
        opacity: 0.8;
        border-color: var(--component-form-button-submit-border-color-hover);
      }

      .form__button--submit:active {
        opacity: 0.7;
      }

      .form__button--submit:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `,
  ];
}

customElements.get('base-form') || customElements.define('base-form', BaseForm);

declare global {
  interface HTMLElementTagNameMap {
    'base-form': BaseForm;
  }
}
