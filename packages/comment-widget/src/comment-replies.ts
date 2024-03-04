import { CommentVo, ReplyVo } from '@halo-dev/api-client';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { consume } from '@lit/context';
import { baseUrlContext, toastContext } from './context';
import './reply-item';
import './loading-block';
import './reply-form';
import varStyles from './styles/var';
import baseStyles from './styles/base';
import { ToastManager } from './lit-toast';

export class CommentReplies extends LitElement {
  @consume({ context: baseUrlContext })
  @property({ attribute: false })
  baseUrl = '';

  @property({ type: Object })
  comment: CommentVo | undefined;

  @state()
  replies: ReplyVo[] = [];

  @state()
  loading = false;

  @state()
  activeQuoteReply: ReplyVo | undefined = undefined;

  @consume({ context: toastContext, subscribe: true })
  @state()
  toastManager: ToastManager | undefined;

  override render() {
    return html`<div class="replies__wrapper">
      <reply-form @reload=${this.fetchReplies} .comment=${this.comment}></reply-form>
      ${this.loading
        ? html`<loading-block></loading-block>`
        : html`
            <div class="replies__list">
              ${repeat(
                this.replies,
                (item) => item.metadata.name,
                (item) =>
                  html`<reply-item
                    .comment=${this.comment}
                    .reply="${item}"
                    .replies=${this.replies}
                    .activeQuoteReply=${this.activeQuoteReply}
                    @set-active-quote-reply=${this.onSetActiveQuoteReply}
                    @reload=${this.fetchReplies}
                  ></reply-item>`
              )}
            </div>
          `}
    </div>`;
  }

  onSetActiveQuoteReply(event: CustomEvent) {
    this.activeQuoteReply = event.detail.quoteReply;
  }

  async fetchReplies() {
    if (this.replies.length === 0) {
      this.loading = true;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/apis/api.halo.run/v1alpha1/comments/${this.comment?.metadata.name}/reply`
      );

      if (!response.ok) {
        throw new Error('加载回复列表失败，请稍后重试');
      }

      const data = await response.json();
      this.replies = data.items;
    } catch (error) {
      if (error instanceof Error) {
        this.toastManager?.error(error.message);
      }
    }

    this.loading = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.fetchReplies();
  }

  static override styles = [
    varStyles,
    baseStyles,
    css`
      .replies__wrapper {
        margin-top: 0.5em;
      }

      .replies__list {
        margin-top: 0.875em;
      }
    `,
  ];
}

customElements.get('comment-replies') || customElements.define('comment-replies', CommentReplies);

declare global {
  interface HTMLElementTagNameMap {
    'comment-replies': CommentReplies;
  }
}
