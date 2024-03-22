import './base-form';
import { CommentVo, Reply, ReplyRequest, ReplyVo, User } from '@halo-dev/api-client';
import { LitElement, html } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import {
  allowAnonymousCommentsContext,
  baseUrlContext,
  currentUserContext,
  toastContext,
} from './context';
import { property, state } from 'lit/decorators.js';
import { BaseForm } from './base-form';
import { consume } from '@lit/context';
import { ToastManager } from './lit-toast';

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

  baseFormRef: Ref<BaseForm> = createRef<BaseForm>();

  override connectedCallback(): void {
    super.connectedCallback();

    setTimeout(() => {
      this.scrollIntoView({ block: 'center', inline: 'start', behavior: 'smooth' });
      this.baseFormRef.value?.setFocus();
    }, 0);
  }

  override render() {
    return html`<base-form ${ref(this.baseFormRef)} @submit="${this.onSubmit}"></base-form>`;
  }

  async onSubmit(e: CustomEvent) {
    e.preventDefault();
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
      return;
    }

    if (!this.currentUser && this.allowAnonymousComments) {
      if (!displayName || !email) {
        this.toastManager?.warn('请先登录或者完善信息');
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
          },
          body: JSON.stringify(replyRequest),
        }
      );

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
    }
  }
}

customElements.get('reply-form') || customElements.define('reply-form', ReplyForm);

declare global {
  interface HTMLElementTagNameMap {
    'reply-form': ReplyForm;
  }
}
