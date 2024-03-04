import { LitElement, css, html } from 'lit';
import './icons/icon-loading';

export class LoadingBlock extends LitElement {
  override render() {
    return html` <div class="loading-block">
      <icon-loading></icon-loading>
    </div>`;
  }

  static override styles = css`
    .loading-block {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1em;
    }
  `;
}

customElements.get('loading-block') || customElements.define('loading-block', LoadingBlock);

declare global {
  interface HTMLElementTagNameMap {
    'loading-block': LoadingBlock;
  }
}
