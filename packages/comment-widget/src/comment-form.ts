import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { consume } from '@lit/context';
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
import { CommentRequest, User, Comment } from '@halo-dev/api-client';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { BaseForm } from './base-form';
import './base-form';
import { ToastManager } from './lit-toast';

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

  baseFormRef: Ref<BaseForm> = createRef<BaseForm>();

  override render() {
    return html`<base-form ${ref(this.baseFormRef)} @submit="${this.onSubmit}"></base-form>`;
  }

  async onSubmit(e: CustomEvent) {
    e.preventDefault();

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
      return;
    }

    if (!this.currentUser && this.allowAnonymousComments) {
      if (!displayName || !email) {
        this.toastManager?.warn('请先登录或者完善信息');
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
        },
        body: JSON.stringify(commentRequest),
      });

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
    }
  }
}

customElements.get('comment-form') || customElements.define('comment-form', CommentForm);

declare global {
  interface HTMLElementTagNameMap {
    'comment-form': CommentForm;
  }
}
