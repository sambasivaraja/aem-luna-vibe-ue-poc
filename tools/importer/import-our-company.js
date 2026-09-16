/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFeatureParser from './parsers/hero-feature.js';
import carouselStoriesParser from './parsers/carousel-stories.js';
import cardsQuizParser from './parsers/cards-quiz.js';
import cardsArticleParser from './parsers/cards-article.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/medtronic-cleanup.js';
import sectionsTransformer from './transformers/medtronic-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'our-company',
  description: "Our Company story-hub landing page: dark hero, stories carousel, interactive quiz cards, editor's picks article grid, and an about text section.",
  urls: [
    'https://www.medtronic.com/en-us/our-company/stories.html',
  ],
  blocks: [
    {
      name: 'hero-feature',
      instances: ['#featured-article'],
    },
    {
      name: 'carousel-stories',
      instances: ['.carousel.marc-carousel', '.marc-carousel .cmp-carousel__content'],
    },
    {
      name: 'cards-quiz',
      instances: ['.column-Container.grid-4-4-4.marc2-combined-column'],
    },
    {
      name: 'cards-article',
      instances: ['.marc-v2-cards-container .column-Container.grid-6-6.marc2-combined-column', '.marc-v2-cards-container'],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero',
      selector: ['#featured-article'],
      style: null,
      blocks: ['hero-feature'],
      defaultContent: [],
    },
    {
      id: 'stories-carousel',
      name: 'Stories Carousel',
      selector: ['.marc-carousel', '.carousel.marc-carousel'],
      style: null,
      blocks: ['carousel-stories'],
      defaultContent: ['#stories'],
    },
    {
      id: 'quiz',
      name: 'Quiz',
      selector: ['.cmp-container.bg-atmospheric-white', '.column-Container.grid-4-4-4.marc2-combined-column'],
      style: 'grey',
      blocks: ['cards-quiz'],
      defaultContent: ['#quiz'],
    },
    {
      id: 'editors-picks',
      name: "Editor's Picks",
      selector: ['.marc-v2-cards-container'],
      style: null,
      blocks: ['cards-article'],
      defaultContent: ['#icymi'],
    },
    {
      id: 'about',
      name: 'About',
      selector: ['.mdt-marc-container'],
      style: 'grey',
      blocks: [],
      defaultContent: ['.mdt-marc-container .cmp-text'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-feature': heroFeatureParser,
  'carousel-stories': carouselStoriesParser,
  'cards-quiz': cardsQuizParser,
  'cards-article': cardsArticleParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates when multiple selectors match the same element, and skips a
 * match that is contained within an already-found block of the same name.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    const foundForBlock = [];
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // skip if already captured (same element) or nested within/containing a prior match
        const duplicate = foundForBlock.some((prev) => prev === element
          || prev.contains(element)
          || element.contains(prev));
        if (!duplicate) {
          foundForBlock.push(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        }
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup + section-break markers)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
