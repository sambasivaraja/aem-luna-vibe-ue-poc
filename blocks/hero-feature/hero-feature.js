import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the hero-feature block
 *
 * Structure (rows):
 *   row 1 → background image (a <picture> / <img> cell)
 *   row 2 → text content (eyebrow + headline + paragraph + CTA), authored as rich text
 *
 * The image becomes a full-bleed background; the text content is grouped in an
 * overlay container so the design pass can position it over the image.
 * Authors may omit the image (renders on the section/inherited background) or
 * omit individual text pieces — the block tolerates both.
 *
 * @param {Element} block The hero-feature block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Identify the image row: the first row whose only meaningful content is a picture/img.
  let imageRow = null;
  const contentRows = [];
  rows.forEach((row) => {
    const picture = row.querySelector('picture, img');
    const hasText = row.textContent.trim().length > 0;
    if (picture && !hasText && !imageRow) {
      imageRow = row;
    } else {
      contentRows.push(row);
    }
  });

  // Background image
  if (imageRow) {
    imageRow.classList.add('hero-feature-bg');
    const img = imageRow.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(
        img.src,
        img.getAttribute('alt') || '',
        true,
        [{ width: '2000' }],
      );
      const existing = imageRow.querySelector('picture');
      if (existing) existing.replaceWith(optimized);
      else imageRow.append(optimized);
    }
  }

  // Text content overlay
  const content = document.createElement('div');
  content.className = 'hero-feature-content';
  contentRows.forEach((row) => {
    // unwrap the row's inner cell(s) into the content container
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });
  if (content.childNodes.length) {
    block.append(content);
  }
}
