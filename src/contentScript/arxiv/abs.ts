import { simplifyPaper } from './common';

// get original title and abstract
const titleElement = document.querySelector('#content .title')!;
const abstractElement = document.querySelector('#content .abstract')!;
const title = titleElement.textContent!.trim().replace(/^Title:\s*/, '');
const abstract = abstractElement.textContent!.trim().replace(/^Abstract:\s*/, '');

function insertRifmLink() {
  const rifmLink = document.createElement('a');
  rifmLink.classList.add('abs-button');
  rifmLink.href = `https://rifm.vercel.app?source=${encodeURIComponent(location.href)}`;
  rifmLink.target = '_blank';
  rifmLink.textContent = '📖 Read it for me';

  const rifmLi = document.createElement('li');
  rifmLi.appendChild(rifmLink);

  const downloadPdfButtonLi = document.querySelector('li:has(> a.download-pdf)') as HTMLLIElement;
  downloadPdfButtonLi.parentElement?.appendChild(rifmLi);
}

async function main() {
  titleElement.textContent = `⏳ ${title}`;
  abstractElement.textContent = `⏳ ${abstract}`;

  const url = location.href;
  const simplified = await simplifyPaper(url, { url, title, abstract });

  titleElement.outerHTML = `
    <h1 class="title" style="background-color: rgba(255,255,0,0.2)">${simplified.title}</h1>
    <h1 class="title" style="opacity: 50%;">${title}</h1>
  `;

  abstractElement.outerHTML = `
    <blockquote class="abstract" style="background-color: rgba(255,255,0,0.2)">${simplified.abstract}</blockquote>
    <blockquote class="abstract" style="opacity: 50%">${abstract}</blockquote>
  `;
}

insertRifmLink();
main();
