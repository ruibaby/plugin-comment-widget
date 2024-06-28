import { CommentWidget } from '@halo-dev/comment-widget';
import '@halo-dev/comment-widget/var.css';

export { CommentWidget };

interface Props {
  group: string;
  kind: string;
  name: string;
  size?: number;
  replySize?: number;
  withReplies?: boolean;
  withReplySize?: number;
  useAvatarProvider: boolean;
  avatarProvider?: string;
  avatarProviderMirror?: string;
  avatarPolicy?: string;
  captchaEnabled: boolean;
}

export function init(el: string, props: Props) {
  const parent = document.querySelector(el) as HTMLElement;

  if (!parent) {
    console.error('Element not found', el);
  }

  const commentWidget = document.createElement(
    'comment-widget'
  ) as CommentWidget;

  commentWidget.kind = props.kind;
  commentWidget.group = props.group;
  commentWidget.version = 'v1alpha1';
  commentWidget.name = props.name;
  commentWidget.size = props.size || 20;
  commentWidget.replySize = props.replySize || 10;
  commentWidget.withReplies = props.withReplies || false;
  commentWidget.withReplySize = props.withReplySize || 10;
  commentWidget.emojiDataUrl =
    '/plugins/PluginCommentWidget/assets/static/emoji/native.json';
  commentWidget.useAvatarProvider = props.useAvatarProvider || false;
  commentWidget.avatarProvider = props.avatarProvider || '';
  commentWidget.avatarProviderMirror = props.avatarProviderMirror || '';
  commentWidget.avatarPolicy = props.avatarPolicy || '';
  commentWidget.captchaEnabled = props.captchaEnabled || false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && parent.childElementCount === 0) {
        parent.appendChild(commentWidget);

        parent.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          fill: 'forwards',
        });
      }
    });
  });
  observer.observe(parent as Element);
}
