/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-feature (base: hero).
 * Source: https://www.medtronic.com/en-us/our-company/stories.html (#featured-article)
 * Generated: 2026-09-16
 *
 * Library convention: 1 column, up to 3 rows (name / optional background image / text).
 * UE model (blocks/hero-feature/_hero-feature.json):
 *   - image     (reference)  -> optional background image, field:image
 *   - imageAlt  (collapsed)  -> alt attribute on the image, no hint
 *   - text      (richtext)   -> title + subheading + CTA, field:text
 *
 * Source #featured-article is text-only (no image), so only the text row is emitted.
 */
export default function parse(element, { document }) {
  // --- extract (selectors validated against source.html) ---
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img[src]');
  const eyebrow = element.querySelector('#featured-article-pretitle, .eyebrow');
  const title = element.querySelector('#featured-article-title, .text-heading-medium');
  const description = element.querySelector('#featured-article-description, .text-body-large');
  const cta = element.querySelector('.pill-btn a, .dark-background a, a[href]');

  const cells = [];

  // Row 2 (optional): background image
  if (image) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(image);
    cells.push([imgFrag]);
  }

  // Row 3: richtext content (title, subheading, CTA link)
  const textContent = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    textContent.push(p);
  }
  if (title) {
    const h = document.createElement('h2');
    h.textContent = title.textContent.trim();
    textContent.push(h);
  }
  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    textContent.push(p);
  }
  if (cta && cta.getAttribute('href')) {
    const a = document.createElement('a');
    a.setAttribute('href', cta.getAttribute('href'));
    a.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(a);
    textContent.push(p);
  }

  // Empty-block guard
  if (!image && textContent.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  textContent.forEach((node) => textFrag.appendChild(node));
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
