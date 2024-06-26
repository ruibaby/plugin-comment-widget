import { CommentVo, Reply, ReplyRequest, ReplyVo, User } from '@halo-dev/api-client';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import './base-form';
import { BaseForm } from './base-form';
import {
  allowAnonymousCommentsContext,
  baseUrlContext,
  currentUserContext,
  toastContext,
} from './context';
import { ToastManager } from './lit-toast';
import { getCaptchaCodeHeader, isRequireCaptcha } from './utils/captcha';

export class ReplyForm extends LitElement {
  @consume({ context: baseUrlContext })
  @state()
  baseUrl = '';

  @consume({ context: currentUserContext, subscribe: true })
  @state()
  currentUser: User | undefined;

  @property({ type: Object })
  comment: CommentVo | undefined;

  @property({ type: Object })
  quoteReply: ReplyVo | undefined;

  @consume({ context: allowAnonymousCommentsContext, subscribe: true })
  @state()
  allowAnonymousComments = false;

  @consume({ context: toastContext, subscribe: true })
  @state()
  toastManager: ToastManager | undefined;

  @state()
  submitting = false;

  @state()
  captcha = '';

  baseFormRef: Ref<BaseForm> = createRef<BaseForm>();

  override connectedCallback(): void {
    super.connectedCallback();

    setTimeout(() => {
      this.scrollIntoView({ block: 'center', inline: 'start', behavior: 'smooth' });
      this.baseFormRef.value?.setFocus();
    }, 0);
  }

  override render() {
    return html` <base-form
      .submitting=${this.submitting}
      .captcha=${this.captcha}
      ${ref(this.baseFormRef)}
      @submit="${this.onSubmit}"
    ></base-form>`;
  }

  async onSubmit(e: CustomEvent) {
    e.preventDefault();

    this.submitting = true;

    const data = e.detail;

    const { displayName, email, website, content } = data || {};

    const replyRequest: ReplyRequest = {
      raw: content,
      content: content,
      // TODO: support user input
      allowNotification: true,
    };

    if (this.quoteReply) {
      replyRequest.quoteReply = this.quoteReply.metadata.name;
    }

    if (!this.currentUser && !this.allowAnonymousComments) {
      this.toastManager?.warn('请先登录');
      this.submitting = false;
      return;
    }

    if (!this.currentUser && this.allowAnonymousComments) {
      if (!displayName || !email) {
        this.toastManager?.warn('请先登录或者完善信息');
        this.submitting = false;
        return;
      } else {
        replyRequest.owner = {
          displayName: displayName,
          email: email,
          website: website,
        };
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/apis/api.halo.run/v1alpha1/comments/${this.comment?.metadata.name}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCaptchaCodeHeader(data.captchaCode),
          },
          body: JSON.stringify(replyRequest),
        }
      );

      if (isRequireCaptcha(response)) {
        const { captcha, detail } = await response.json();
        this.captcha = captcha;
        this.toastManager?.warn(detail);
        return;
      }

      this.baseFormRef.value?.handleFetchCaptcha();

      if (!response.ok) {
        throw new Error('评论失败，请稍后重试');
      }

      const newReply = (await response.json()) as Reply;

      if (newReply.spec.approved) {
        this.toastManager?.success('评论成功');
      } else {
        this.toastManager?.success('评论成功，等待审核');
      }

      this.dispatchEvent(new CustomEvent('reload'));
      this.baseFormRef.value?.resetForm();
    } catch (error) {
      if (error instanceof Error) {
        this.toastManager?.error(error.message);
      }
    } finally {
      this.submitting = false;
    }
  }
}

customElements.get('reply-form') || customElements.define('reply-form', ReplyForm);

declare global {
  interface HTMLElementTagNameMap {
    'reply-form': ReplyForm;
  }
}
