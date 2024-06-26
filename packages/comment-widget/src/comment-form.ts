import { Comment, CommentRequest, User } from '@halo-dev/api-client';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import './base-form';
import { BaseForm } from './base-form';
import {
  allowAnonymousCommentsContext,
  baseUrlContext,
  currentUserContext,
  groupContext,
  kindContext,
  nameContext,
  toastContext,
  versionContext,
} from './context';
import { ToastManager } from './lit-toast';
import { getCaptchaCodeHeader, isRequireCaptcha } from './utils/captcha';

export class CommentForm extends LitElement {
  @consume({ context: baseUrlContext })
  @state()
  baseUrl = '';

  @consume({ context: currentUserContext, subscribe: true })
  @state()
  currentUser: User | undefined;

  @consume({ context: groupContext })
  @state()
  group = '';

  @consume({ context: kindContext })
  @state()
  kind = '';

  @consume({ context: nameContext })
  @state()
  name = '';

  @consume({ context: versionContext })
  @state()
  version = 'v1alpha1';

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

    const commentRequest: CommentRequest = {
      raw: content,
      content: content,
      // TODO: support user input
      allowNotification: true,
      subjectRef: {
        group: this.group,
        kind: this.kind,
        name: this.name,
        version: this.version,
      },
    };

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
        commentRequest.owner = {
          displayName: displayName,
          email: email,
          website: website,
        };
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/apis/api.halo.run/v1alpha1/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCaptchaCodeHeader(data.captchaCode),
        },
        body: JSON.stringify(commentRequest),
      });

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

      const newComment = (await response.json()) as Comment;

      if (newComment.spec.approved) {
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

customElements.get('comment-form') || customElements.define('comment-form', CommentForm);

declare global {
  interface HTMLElementTagNameMap {
    'comment-form': CommentForm;
  }
}
