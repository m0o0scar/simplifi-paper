import { simplifyPapers } from './common';

function findAllPaperAnchors() {
  return [
    ...document.querySelectorAll('#articles > dt > a[title="Abstract"]'),
  ] as HTMLAnchorElement[];
}

function updateListItem(
  url: string,
  updater: (titleElement: HTMLDivElement, title: string) => void,
) {
  const { pathname } = new URL(url);
  const anchor = document.querySelector(`#articles a[href="${pathname}"]`);
  if (anchor instanceof HTMLAnchorElement) {
    const infoElement = anchor.parentElement!.nextElementSibling!;
    const titleElement = infoElement.querySelector('.list-title') as HTMLDivElement;
    const title = titleElement.textContent!.trim().replace(/^Title:\s*/, '');

    updater(titleElement, title);
  }
}

function insertRifmLinks() {
  const anchors = findAllPaperAnchors();
  for (const anchor of anchors) {
    const parent = anchor.parentElement;
    const lastChild = parent!.lastChild;

    const comma = document.createElement('span');
    comma.textContent = ', ';

    const link = document.createElement('a');
    link.innerText = '📖 rifm';
    link.target = '_blank';
    link.href = `https://rifm.vercel.app?source=${encodeURIComponent(anchor.href)}`;

    parent!.insertBefore(comma, lastChild);
    parent!.insertBefore(link, lastChild);
  }
}

async function simplifiedPapersInList() {
  const anchors = findAllPaperAnchors();

  // find all the paper urls
  const urls = [...new Set(anchors.map((anchor) => anchor.href))];
  let remainingUrls = [...urls];

  // show loading
  urls.forEach((url) =>
    updateListItem(url, (titleElement, title) => {
      titleElement.innerText = `⏳ ${title}`;
    }),
  );

  // simplify these papers
  for await (const paper of simplifyPapers(urls)) {
    updateListItem(paper.url, (titleElement, title) => {
      titleElement.outerHTML = `
      <div class="list-title" style="background-color: rgba(255,255,0,0.2)">${paper.title}</div>
      <div class="list-title" style="opacity: 50%">${title.replace(/^⏳ /, '')}</div>
    `;
    });

    remainingUrls = remainingUrls.filter((url) => url !== paper.url);
  }

  // show error on missing urls
  remainingUrls.forEach((url) =>
    updateListItem(url, (titleElement, title) => {
      titleElement.innerText = `😵 ${title.replace(/^⏳ /, '')}`;
    }),
  );
}

insertRifmLinks();
simplifiedPapersInList();
