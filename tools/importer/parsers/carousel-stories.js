/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-stories (base: carousel).
 * Source: https://www.medtronic.com/en-us/our-company/stories.html (.carousel.marc-carousel)
 * Generated: 2026-09-16
 *
 * Container block. First row = block name; each subsequent row = one slide.
 * UE item model (blocks/carousel-stories/_carousel-stories.json -> carousel-stories-item):
 *   - media_image    (reference) -> slide image, field:media_image
 *   - media_imageAlt (collapsed) -> alt attribute on the image, no hint
 *   - content_text   (richtext)  -> slide title/link, field:content_text
 *
 * Two cells per slide row: image cell (media_*) + text cell (content_text).
 */
export default function parse(element, { document }) {
  // Prefer carousel items; fall back to teasers if the item wrapper is absent.
  const slides = element.querySelectorAll('.cmp-carousel__item').length
    ? Array.from(element.querySelectorAll('.cmp-carousel__item'))
    : Array.from(element.querySelectorAll('.teaser'));

  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('.cmp-teaser__image img, .cmp-image__image, img[src]');
    const link = slide.querySelector('.cmp-teaser__title-link, .cmp-teaser__title a, a[href]');

    if (!img && !link) return; // skip empty slides

    // Column 1: media_image (media_* group; alt collapses onto the img element)
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(img);
    }

    // Column 2: content_text (slide title as a linked heading)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:content_text '));
    if (link && link.getAttribute('href')) {
      const h = document.createElement('h2');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = link.textContent.trim();
      h.appendChild(a);
      textCell.appendChild(h);
    } else if (link) {
      const h = document.createElement('h2');
      h.textContent = link.textContent.trim();
      textCell.appendChild(h);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-stories', cells });
  element.replaceWith(block);
}
