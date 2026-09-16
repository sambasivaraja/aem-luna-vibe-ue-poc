/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article (base: cards).
 * Source: https://www.medtronic.com/en-us/our-company/stories.html
 *         (.marc-v2-cards-container .column-Container.grid-6-6.marc2-combined-column)
 * Generated: 2026-09-16
 *
 * Container block. First row = block name; each article card = one row.
 * Each card row has two cells (image + text); an empty image cell is still
 * included (some cards have no teaser image).
 * UE item model (blocks/cards-article/_cards-article.json -> cards-article-item):
 *   - image (reference) -> card image, field:image
 *   - text  (richtext)  -> eyebrow + title + description + CTA, field:text
 */
export default function parse(element, { document }) {
  const all = Array.from(element.querySelectorAll('.cardcontainer'));
  // Keep only top-level card containers (drop nested duplicates).
  const cards = all.filter((c) => !all.some((other) => other !== c && other.contains(c)));

  const cells = [];

  cards.forEach((card) => {
    const img = card.querySelector('.cmp-teaser__image img, .cmp-image__image, img[src]');
    const eyebrow = card.querySelector('.marc-card-eyebrow');
    const titleLink = card.querySelector('.cmp-teaser__title-link, .cmp-teaser__title a');
    const description = card.querySelector('.cmp-teaser__description');
    const cta = card.querySelector('.cmp-teaser__action-link');

    if (!titleLink && !img) return; // skip empty cards

    // Column 1: image (empty cell if absent — cell still included, no hint)
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Column 2: text (eyebrow, title link as heading, description, CTA) as richtext
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.trim();
      textCell.appendChild(p);
    }
    if (titleLink) {
      const h = document.createElement('h3');
      const href = titleLink.getAttribute('href');
      const titleText = titleLink.textContent.replace(/\s+/g, ' ').trim();
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        h.appendChild(a);
      } else {
        h.textContent = titleText;
      }
      textCell.appendChild(h);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.replace(/\s+/g, ' ').trim();
      textCell.appendChild(p);
    }
    if (cta && cta.getAttribute('href')) {
      const a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href'));
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.appendChild(a);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
