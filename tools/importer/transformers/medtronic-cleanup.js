/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: medtronic.com site-wide cleanup.
 * Removes non-authorable site chrome and widgets.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent / OneTrust widget (cleaned.html: <div id="onetrust-consent-sdk">).
    // Hidden quiz modals appended after footer (cleaned.html: <div class="quiz-modal hidden">).
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.quiz-modal',
      'button.skip-main',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (cleaned.html):
    //  - header shell: <div class="... com-header-container ...">, <div class="mdt-header-section">
    //  - breadcrumb: <div class="breadcrumb">
    //  - footer: <footer>
    //  - leftover embed/link/meta artifacts.
    WebImporter.DOMUtils.remove(element, [
      '.com-header-container',
      '.mdt-header-section',
      '.breadcrumb',
      'footer',
      'meta',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
