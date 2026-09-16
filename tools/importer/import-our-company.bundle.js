/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-our-company.js
  var import_our_company_exports = {};
  __export(import_our_company_exports, {
    default: () => import_our_company_default
  });

  // tools/importer/parsers/hero-feature.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image__image, img[src]");
    const eyebrow = element.querySelector("#featured-article-pretitle, .eyebrow");
    const title = element.querySelector("#featured-article-title, .text-heading-medium");
    const description = element.querySelector("#featured-article-description, .text-body-large");
    const cta = element.querySelector(".pill-btn a, .dark-background a, a[href]");
    const cells = [];
    if (image) {
      const imgFrag = document2.createDocumentFragment();
      imgFrag.appendChild(document2.createComment(" field:image "));
      imgFrag.appendChild(image);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textContent = [];
    if (eyebrow) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      textContent.push(p);
    }
    if (title) {
      const h = document2.createElement("h2");
      h.textContent = title.textContent.trim();
      textContent.push(h);
    }
    if (description) {
      const p = document2.createElement("p");
      p.textContent = description.textContent.trim();
      textContent.push(p);
    }
    if (cta && cta.getAttribute("href")) {
      const a = document2.createElement("a");
      a.setAttribute("href", cta.getAttribute("href"));
      a.textContent = cta.textContent.trim();
      const p = document2.createElement("p");
      p.appendChild(a);
      textContent.push(p);
    }
    if (!image && textContent.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textFrag = document2.createDocumentFragment();
    textFrag.appendChild(document2.createComment(" field:text "));
    textContent.forEach((node) => textFrag.appendChild(node));
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-stories.js
  function parse2(element, { document: document2 }) {
    const slides = element.querySelectorAll(".cmp-carousel__item").length ? Array.from(element.querySelectorAll(".cmp-carousel__item")) : Array.from(element.querySelectorAll(".teaser"));
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".cmp-teaser__image img, .cmp-image__image, img[src]");
      const link = slide.querySelector(".cmp-teaser__title-link, .cmp-teaser__title a, a[href]");
      if (!img && !link) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:media_image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:content_text "));
      if (link && link.getAttribute("href")) {
        const h = document2.createElement("h2");
        const a = document2.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = link.textContent.trim();
        h.appendChild(a);
        textCell.appendChild(h);
      } else if (link) {
        const h = document2.createElement("h2");
        h.textContent = link.textContent.trim();
        textCell.appendChild(h);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-stories", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-quiz.js
  function parse3(element, { document: document2 }) {
    const all = Array.from(element.querySelectorAll(".cardcontainer"));
    const cards = all.filter((c) => !all.some((other) => other !== c && other.contains(c)));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".cmp-quizcard__image img, .cmp_quiz__image_marc2, img[src]");
      const eyebrow = card.querySelector(".marc-card-eyebrow");
      const question = card.querySelector(".quiz-question, .cmp-quiz__title h2");
      const options = Array.from(card.querySelectorAll(".cmp-quiz-card-option"));
      const submit = card.querySelector(".cmp-quiz__action-link, .cmp-find-button");
      if (!img && !question) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (eyebrow) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        textCell.appendChild(p);
      }
      if (question) {
        const h = document2.createElement("h2");
        h.textContent = question.textContent.replace(/\s+/g, " ").trim();
        textCell.appendChild(h);
      }
      if (options.length) {
        const ul = document2.createElement("ul");
        options.forEach((opt) => {
          const li = document2.createElement("li");
          li.textContent = opt.textContent.replace(/\s+/g, " ").trim();
          ul.appendChild(li);
        });
        textCell.appendChild(ul);
      }
      if (submit) {
        const p = document2.createElement("p");
        p.textContent = submit.textContent.replace(/\s+/g, " ").trim();
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-quiz", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse4(element, { document: document2 }) {
    const all = Array.from(element.querySelectorAll(".cardcontainer"));
    const cards = all.filter((c) => !all.some((other) => other !== c && other.contains(c)));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".cmp-teaser__image img, .cmp-image__image, img[src]");
      const eyebrow = card.querySelector(".marc-card-eyebrow");
      const titleLink = card.querySelector(".cmp-teaser__title-link, .cmp-teaser__title a");
      const description = card.querySelector(".cmp-teaser__description");
      const cta = card.querySelector(".cmp-teaser__action-link");
      if (!titleLink && !img) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (eyebrow) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        textCell.appendChild(p);
      }
      if (titleLink) {
        const h = document2.createElement("h3");
        const href = titleLink.getAttribute("href");
        const titleText = titleLink.textContent.replace(/\s+/g, " ").trim();
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          h.appendChild(a);
        } else {
          h.textContent = titleText;
        }
        textCell.appendChild(h);
      }
      if (description) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.replace(/\s+/g, " ").trim();
        textCell.appendChild(p);
      }
      if (cta && cta.getAttribute("href")) {
        const a = document2.createElement("a");
        a.setAttribute("href", cta.getAttribute("href"));
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        const p = document2.createElement("p");
        p.appendChild(a);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/medtronic-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".quiz-modal",
        "button.skip-main"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".com-header-container",
        ".mdt-header-section",
        ".breadcrumb",
        "footer",
        "meta",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/medtronic-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-our-company.js
  var PAGE_TEMPLATE = {
    name: "our-company",
    description: "Our Company story-hub landing page: dark hero, stories carousel, interactive quiz cards, editor's picks article grid, and an about text section.",
    urls: [
      "https://www.medtronic.com/en-us/our-company/stories.html"
    ],
    blocks: [
      {
        name: "hero-feature",
        instances: ["#featured-article"]
      },
      {
        name: "carousel-stories",
        instances: [".carousel.marc-carousel", ".marc-carousel .cmp-carousel__content"]
      },
      {
        name: "cards-quiz",
        instances: [".column-Container.grid-4-4-4.marc2-combined-column"]
      },
      {
        name: "cards-article",
        instances: [".marc-v2-cards-container .column-Container.grid-6-6.marc2-combined-column", ".marc-v2-cards-container"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero",
        selector: ["#featured-article"],
        style: null,
        blocks: ["hero-feature"],
        defaultContent: []
      },
      {
        id: "stories-carousel",
        name: "Stories Carousel",
        selector: [".marc-carousel", ".carousel.marc-carousel"],
        style: null,
        blocks: ["carousel-stories"],
        defaultContent: ["#stories"]
      },
      {
        id: "quiz",
        name: "Quiz",
        selector: [".cmp-container.bg-atmospheric-white", ".column-Container.grid-4-4-4.marc2-combined-column"],
        style: "grey",
        blocks: ["cards-quiz"],
        defaultContent: ["#quiz"]
      },
      {
        id: "editors-picks",
        name: "Editor's Picks",
        selector: [".marc-v2-cards-container"],
        style: null,
        blocks: ["cards-article"],
        defaultContent: ["#icymi"]
      },
      {
        id: "about",
        name: "About",
        selector: [".mdt-marc-container"],
        style: "grey",
        blocks: [],
        defaultContent: [".mdt-marc-container .cmp-text"]
      }
    ]
  };
  var parsers = {
    "hero-feature": parse,
    "carousel-stories": parse2,
    "cards-quiz": parse3,
    "cards-article": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      const foundForBlock = [];
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          const duplicate = foundForBlock.some((prev) => prev === element || prev.contains(element) || element.contains(prev));
          if (!duplicate) {
            foundForBlock.push(element);
            pageBlocks.push({
              name: blockDef.name,
              selector,
              element,
              section: blockDef.section || null
            });
          }
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_our_company_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_our_company_exports);
})();
