import { CommentWidget } from '@halo-dev/comment-widget';
import '@halo-dev/comment-widget/var.css';

export { CommentWidget };

export function init(el: string, props: Record<string, unknown>) {
  const parent = document.querySelector(el) as HTMLElement;

  if (!parent) {
    console.error('Element not found', el);
  }

  const commentWidget = document.createElement(
    'comment-widget'
  ) as CommentWidget;

  commentWidget.kind = props.kind as string;
  commentWidget.group = props.group as string;
  commentWidget.version = 'v1alpha1';
  commentWidget.name = props.name as string;
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
