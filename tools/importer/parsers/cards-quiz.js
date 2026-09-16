/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quiz (base: cards).
 * Source: https://www.medtronic.com/en-us/our-company/stories.html
 *         (.column-Container.grid-4-4-4.marc2-combined-column)
 * Generated: 2026-09-16
 *
 * Container block. First row = block name; each quiz card = one row.
 * Each card row has two cells (image + text); an empty cell is still included.
 * UE item model (blocks/cards-quiz/_cards-quiz.json -> cards-quiz-item):
 *   - image (reference) -> card image, field:image
 *   - text  (richtext)  -> eyebrow + question + answer options + CTA, field:text
 */
export default function parse(element, { document }) {
  const all = Array.from(element.querySelectorAll('.cardcontainer'));
  // Keep only top-level card containers (drop nested duplicates).
  const cards = all.filter((c) => !all.some((other) => other !== c && other.contains(c)));

  const cells = [];

  cards.forEach((card) => {
    const img = card.querySelector('.cmp-quizcard__image img, .cmp_quiz__image_marc2, img[src]');
    const eyebrow = card.querySelector('.marc-card-eyebrow');
    const question = card.querySelector('.quiz-question, .cmp-quiz__title h2');
    const options = Array.from(card.querySelectorAll('.cmp-quiz-card-option'));
    const submit = card.querySelector('.cmp-quiz__action-link, .cmp-find-button');

    if (!img && !question) return; // skip empty cards

    // Column 1: image (empty cell if absent — cell still included, no hint)
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Column 2: text (eyebrow heading, question, answer options, CTA) as richtext
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.trim();
      textCell.appendChild(p);
    }
    if (question) {
      const h = document.createElement('h2');
      h.textContent = question.textContent.replace(/\s+/g, ' ').trim();
      textCell.appendChild(h);
    }
    if (options.length) {
      const ul = document.createElement('ul');
      options.forEach((opt) => {
        const li = document.createElement('li');
        li.textContent = opt.textContent.replace(/\s+/g, ' ').trim();
        ul.appendChild(li);
      });
      textCell.appendChild(ul);
    }
    if (submit) {
      const p = document.createElement('p');
      p.textContent = submit.textContent.replace(/\s+/g, ' ').trim();
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quiz', cells });
  element.replaceWith(block);
}
