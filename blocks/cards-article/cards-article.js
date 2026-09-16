import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the cards-article block
 *
 * Each row is one article card. The authored structure is an optional image cell
 * plus a text cell holding an eyebrow/category label, a headline (link), a short
 * description, and a CTA link. The card is flattened into a single column so the
 * eyebrow sits above the image, then headline, description, and CTA — matching the
 * source "Editor's picks" layout. Renders as a responsive 2-column grid.
 *
 * @param {Element} block The cards-article block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-article-card';
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const picture = row.querySelector('picture');
    // the text cell is the last cell; the (optional) image lives in an earlier cell
    const textCell = cells[cells.length - 1];

    let eyebrow;
    let title;
    let desc;
    let cta;

    if (textCell) {
      [...textCell.children].forEach((el) => {
        if (/^H[1-6]$/.test(el.tagName)) {
          title = el;
        } else if (el.tagName === 'P' && el.querySelector('a')) {
          cta = el;
        } else if (el.tagName === 'P' && !title) {
          eyebrow = el;
        } else if (el.tagName === 'P') {
          desc = el;
        }
      });
    }

    if (eyebrow) {
      eyebrow.className = 'cards-article-card-eyebrow';
      li.append(eyebrow);
    }

    if (picture) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'cards-article-card-image';
      imageWrap.append(picture.closest('p') || picture);
      li.append(imageWrap);
    }

    if (title) {
      title.className = 'cards-article-card-title';
      li.append(title);
    }
    if (desc) {
      desc.className = 'cards-article-card-desc';
      li.append(desc);
    }
    if (cta) {
      cta.className = 'cards-article-card-cta';
      const link = cta.querySelector('a');
      if (link) {
        link.className = '';
        link.removeAttribute('title');
      }
      li.append(cta);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
