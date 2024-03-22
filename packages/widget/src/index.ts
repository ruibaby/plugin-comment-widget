import { CommentWidget } from '@halo-dev/comment-widget';
import '@halo-dev/comment-widget/var.css';

export { CommentWidget };

interface Props {
  group: string;
  kind: string;
  name: string;
  withReplies?: boolean;
  replySize?: number;
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
  commentWidget.withReplies = props.withReplies || false;
  commentWidget.replySize = props.replySize || 10;
  commentWidget.emojiDataUrl =
    '/plugins/PluginCommentWidget/assets/static/emoji/native.json';

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
