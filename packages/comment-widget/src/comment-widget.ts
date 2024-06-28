import { CommentVoList, User } from '@halo-dev/api-client';
import { provide } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  AllUserPolicy,
  AnonymousUserPolicy,
  AvatarPolicyEnum,
  NoAvatarUserPolicy,
  setPolicyInstance,
} from './avatar/avatar-policy';
import { setAvatarProvider } from './avatar/providers';
import './comment-form';
import './comment-item';
import './comment-pagination';
import {
  allowAnonymousCommentsContext,
  avatarPolicyContext,
  avatarProviderContext,
  avatarProviderMirrorContext,
  baseUrlContext,
  captchaEnabledContext,
  currentUserContext,
  emojiDataUrlContext,
  groupContext,
  kindContext,
  nameContext,
  replySizeContext,
  toastContext,
  useAvatarProviderContext,
  versionContext,
  withRepliesContext,
} from './context';
import { ToastManager } from './lit-toast';
import baseStyles from './styles/base';
import varStyles from './styles/var';

export class CommentWidget extends LitElement {
  @provide({ context: baseUrlContext })
  @property({ type: String, attribute: 'base-url' })
  baseUrl = '';

  @provide({ context: kindContext })
  @property({ type: String })
  kind = '';

  @provide({ context: groupContext })
  @property({ type: String })
  group = '';

  @provide({ context: versionContext })
  @property({ type: String })
  version = '';

  @provide({ context: nameContext })
  @property({ type: String })
  name = '';

  @property({ type: Number, attribute: 'size' })
  size: number = 20;

  @provide({ context: replySizeContext })
  @property({ type: Number, attribute: 'reply-size' })
  replySize: number = 10;

  @provide({ context: withRepliesContext })
  @property({ type: Boolean, attribute: 'with-replies' })
  withReplies = false;

  @property({ type: Number, attribute: 'with-reply-size' })
  withReplySize = 10;

  @provide({ context: useAvatarProviderContext })
  @property({ type: Boolean, attribute: 'use-avatar-provider' })
  useAvatarProvider = false;

  @provide({ context: avatarProviderContext })
  @property({ type: String, attribute: 'avatar-provider' })
  avatarProvider = '';

  @provide({ context: avatarProviderMirrorContext })
  @property({ type: String, attribute: 'avatar-provider-mirror' })
  avatarProviderMirror = '';

  @provide({ context: avatarPolicyContext })
  @property({ type: String, attribute: 'avatar-policy' })
  avatarPolicy = '';

  @provide({ context: emojiDataUrlContext })
  @property({ type: String, attribute: 'emoji-data-url' })
  emojiDataUrl = 'https://unpkg.com/@emoji-mart/data';

  @provide({ context: currentUserContext })
  @state()
  currentUser: User | undefined;

  @provide({ context: allowAnonymousCommentsContext })
  @state()
  allowAnonymousComments = false;

  @provide({ context: captchaEnabledContext })
  @property({ type: Boolean, attribute: 'enable-captcha' })
  captchaEnabled = false;

  @provide({ context: toastContext })
  @state()
  toastManager: ToastManager | undefined;

  @state()
  comments: CommentVoList = {
    page: 1,
    size: 20,
    total: 0,
    items: [],
    first: true,
    last: false,
    hasNext: false,
    hasPrevious: false,
    totalPages: 0,
  };

  @state()
  loading = false;

  get shouldDisplayPagination() {
    if (this.loading) {
      return false;
    }

    return this.comments.hasNext || this.comments.hasPrevious;
  }

  override render() {
    return html` <div class="comment-widget">
      <comment-form
        @reload="${() => this.fetchComments({ page: 1, scrollIntoView: true })}"
      ></comment-form>
      ${this.loading
        ? html` <loading-block></loading-block>`
        : html`
            <div class="comment-widget__wrapper">
              <div class="comment-widget__stats">
                <span>${this.comments.total} 条评论</span>
              </div>

              <div class="comment-widget__list">
                ${repeat(
                  this.comments.items,
                  (item) => item.metadata.name,
                  (item) => html` <comment-item .comment=${item}></comment-item>`
                )}
              </div>
            </div>
          `}
      ${this.shouldDisplayPagination
        ? html`
            <comment-pagination
              .total=${this.comments.total}
              .page=${this.comments.page}
              .size=${this.comments.size}
              @page-change=${this.onPageChange}
            ></comment-pagination>
          `
        : ''}
    </div>`;
  }

  async fetchGlobalInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/actuator/globalinfo`, {
        method: 'get',
        credentials: 'same-origin',
      });

      const data = await response.json();
      this.allowAnonymousComments = data.allowAnonymousComments;
    } catch (error) {
      console.error('Failed to fetch global info', error);
    }
  }

  async fetchCurrentUser() {
    const response = await fetch(`${this.baseUrl}/apis/api.console.halo.run/v1alpha1/users/-`);
    const data = await response.json();
    this.currentUser = data.user.metadata.name === 'anonymousUser' ? undefined : data.user;
  }

  async fetchComments(options?: { page?: number; scrollIntoView?: boolean }) {
    const { page, scrollIntoView } = options || {};
    try {
      if (this.comments.items.length === 0) {
        this.loading = true;
      }

      if (page) {
        this.comments.page = page;
      }

      const queryParams = [
        `group=${this.group}`,
        `kind=${this.kind}`,
        `name=${this.name}`,
        `page=${this.comments.page}`,
        `size=${this.size}`,
        `version=${this.version}`,
        `withReplies=${this.withReplies}`,
        `replySize=${this.withReplySize}`,
      ];

      const response = await fetch(
        `${this.baseUrl}/apis/api.halo.run/v1alpha1/comments?${queryParams.join('&')}`
      );

      if (!response.ok) {
        throw new Error('评论列表加载失败，请稍后重试');
      }

      this.comments = await response.json();
    } catch (error) {
      if (error instanceof Error) {
        this.toastManager?.error(error.message);
      }
    } finally {
      this.loading = false;

      if (scrollIntoView) {
        this.scrollIntoView({ block: 'start', inline: 'start', behavior: 'smooth' });
      }
    }
  }

  async onPageChange(e: CustomEvent) {
    const data = e.detail;
    this.comments.page = data.page;
    await this.fetchComments({ scrollIntoView: true });
  }

  initAvatarProvider() {
    if (!this.useAvatarProvider) {
      return;
    }
    setAvatarProvider(this.avatarProvider, this.avatarProviderMirror);
  }

  initAvatarPolicy() {
    if (!this.useAvatarProvider) {
      console.log(this.useAvatarProvider);
      setPolicyInstance(undefined);
      return;
    }
    switch (this.avatarPolicy) {
      case AvatarPolicyEnum.ALL_USER_POLICY: {
        setPolicyInstance(new AllUserPolicy());
        break;
      }
      case AvatarPolicyEnum.NO_AVATAR_USER_POLICY: {
        setPolicyInstance(new NoAvatarUserPolicy());
        break;
      }
      case AvatarPolicyEnum.ANONYMOUS_USER_POLICY:
      default:
        setPolicyInstance(new AnonymousUserPolicy());
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.toastManager = new ToastManager();
    this.fetchCurrentUser();
    this.fetchComments();
    this.fetchGlobalInfo();
    this.initAvatarProvider();
    this.initAvatarPolicy();
  }

  static override styles = [
    varStyles,
    baseStyles,
    css`
      :host {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .comment-widget {
        width: 100%;
      }

      .comment-widget__wrapper {
        margin-top: 1.2em;
      }

      .comment-widget__stats {
        color: var(--base-color);
        font-size: 0.875em;
        margin: 0.875em 0;
        font-weight: 500;
      }
    `,
  ];
}

customElements.get('comment-widget') || customElements.define('comment-widget', CommentWidget);

declare global {
  interface HTMLElementTagNameMap {
    'comment-widget': CommentWidget;
  }
}
