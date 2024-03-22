import { CommentVo, ReplyVo, ReplyVoList } from '@halo-dev/api-client';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { consume } from '@lit/context';
import { baseUrlContext, replySizeContext, toastContext, withRepliesContext } from './context';
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

  @consume({ context: withRepliesContext, subscribe: true })
  @state()
  withReplies = false;

  @consume({ context: replySizeContext, subscribe: true })
  @state()
  replySize = 10;

  @property({ type: Object })
  comment: CommentVo | undefined;

  @property({ type: Boolean })
  showReplyForm = false;

  @state()
  replies: ReplyVo[] = [];

  @state()
  page = 1;

  @state()
  hasNext = false;

  @state()
  loading = false;

  @state()
  activeQuoteReply: ReplyVo | undefined = undefined;

  @consume({ context: toastContext, subscribe: true })
  @state()
  toastManager: ToastManager | undefined;

  override render() {
    return html`<div class="replies__wrapper">
      ${this.replies.length
        ? html`
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
          `
        : ''}
      ${this.loading ? html`<loading-block></loading-block>` : ''}
      ${this.hasNext && !this.loading
        ? html`<div class="replies__next-wrapper">
            <button @click=${this.fetchNext}>加载更多</button>
          </div>`
        : ''}
    </div>`;
  }

  onSetActiveQuoteReply(event: CustomEvent) {
    this.activeQuoteReply = event.detail.quoteReply;
  }

  async fetchReplies(options?: { append: boolean }) {
    try {
      this.loading = true;

      // Reload replies list
      if (!options?.append) {
        this.page = 1;
      }

      const queryParams = [`page=${this.page || 0}`, `size=${this.replySize}`];

      const response = await fetch(
        `${this.baseUrl}/apis/api.halo.run/v1alpha1/comments/${this.comment?.metadata.name}/reply?${queryParams.join('&')}`
      );

      if (!response.ok) {
        throw new Error('加载回复列表失败，请稍后重试');
      }

      const data = (await response.json()) as ReplyVoList;

      if (options?.append) {
        this.replies = this.replies.concat(data.items);
      } else {
        this.replies = data.items;
      }

      this.hasNext = data.hasNext;
      this.page = data.page;
    } catch (error) {
      if (error instanceof Error) {
        this.toastManager?.error(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async fetchNext() {
    this.page++;
    this.fetchReplies({ append: true });
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.withReplies) {
      // TODO: Fix ts error
      // Needs @halo-dev/api-client@2.14.0
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.replies = this.comment?.replies.items;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.page = this.comment?.replies.page;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.hasNext = this.comment?.replies.hasNext;
    } else {
      this.fetchReplies();
    }
  }

  static override styles = [
    varStyles,
    baseStyles,
    css`
      .replies__list {
        margin-top: 0.875em;
      }

      .replies__next-wrapper {
        display: flex;
        justify-content: center;
        margin: 0.5em 0;
      }

      .replies__next-wrapper button {
        border-radius: var(--base-border-radius);
        color: var(--base-color);
        font-size: 0.875em;
        display: inline-flex;
        align-items: center;
        font-weight: 600;
        padding: 0.4em 0.875em;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 0.15s;
        border: 1px solid transparent;
      }

      .replies__next-wrapper button:hover {
        background-color: var(--component-pagination-button-bg-color-hover);
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
