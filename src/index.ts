import JSZip from "jszip";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import he from "he";
import {
  META_INF_container_xml,
  chapterContent,
  content_opf,
  mimetype,
  toc_ncx,
} from "./files";

export interface Chapter {
  title: string;
  content: string;
}

function generateEpub(title: string, chapters: Chapter[]) {
  const zip = new JSZip();

  zip.file("mimetype", mimetype);
  zip.file("META-INF/container.xml", META_INF_container_xml);
  zip.file("content.opf", content_opf(title, chapters));
  zip.file("toc.ncx", toc_ncx(chapters));
  chapters.forEach((chapter, i) => {
    zip.file(
      `OEBPS/${(i + "").padStart(8, "0")}.html`,
      chapterContent(chapter.content)
    );
  });

  zip
    .generateAsync({ type: "blob" })
    .then(async (content) => {
      const arrayBuffer = await content.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync("book.epub", buffer);
      console.log("OK");
    })
    .catch((error) => {
      console.log(error);
    });
}

async function fetchMeta(page: string): Promise<any> {
  const resp = await fetch(page);
  const text = await resp.text();
  const contentRegex =
    /<script type="text\/javascript">\s+window.prefetched = (.*);\s+<\/script>/gm;
  const matches = contentRegex.exec(text);
  if (!matches) return;
  const data = JSON.parse(matches[1]);
  return data[Object.keys(data)[0]].data;
}

function fetchContent(page: any): string {
  const storyText = page.storyText;
  const escaped = he.decode(storyText);
  const doc = new JSDOM(`<div>${escaped}</div>`);
  let chapterContent = "";
  const recurse = (n: any) => {
    if (n.children.length === 0) {
      chapterContent += n.textContent + "\n";
    }
    Array.from(n.children).forEach(recurse);
  };
  recurse(doc.window.document);
  return chapterContent;
}

(async () => {
  const storyURL =
    process.argv[2] ??
    "https://www.wattpad.com/722755897-another-life-another-me-1-where%27s-my-compensation";
  const story = await fetchMeta(storyURL);
  const parts = story.group.parts;
  const bookTitle = story.group.title;
  console.log(bookTitle);

  const chapters = [];
  for (const part of parts) {
    const meta = await fetchMeta(part.url);
    const content = fetchContent(meta);
    chapters.push({ title: part.title, content });
  }
  generateEpub(bookTitle, chapters);
})();
