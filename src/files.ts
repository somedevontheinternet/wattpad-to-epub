import { Chapter } from ".";

export const mimetype = "application/epub+zip";

export const META_INF_container_xml = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>`;

export const content_opf = (
  title: string,
  chapters: Chapter[]
) => `<?xml version='1.0' encoding='utf-8'?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
  <metadata xmlns:calibre="http://calibre.kovidgoyal.net/2009/metadata" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>${title}</dc:title>
  </metadata>
   <manifest>
   	 <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
	 ${chapters
     .map(
       (_, i) =>
         `<item href="OEBPS/${(i + "").padStart(8, "0")}.html" id="${(
           i + ""
         ).padStart(8, "0")}" media-type="application/xhtml+xml"/>`
     )
     .join("")}
   </manifest>
  <spine toc="ncx">
  	${chapters
      .map((_, i) => `<itemref idref="${(i + "").padStart(8, "0")}"/>`)
      .join("")}
  </spine>
</package>
`;

export const toc_ncx = (
  chapters: Chapter[]
) => `<?xml version='1.0' encoding='utf-8'?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="eng">
  <head>
    <meta content="eb2934ae-bb1a-4652-bce7-9f78fc5ca496" name="dtb:uid"/>
    <meta content="2" name="dtb:depth"/>
    <meta content="calibre (3.21.0)" name="dtb:generator"/>
    <meta content="0" name="dtb:totalPageCount"/>
    <meta content="0" name="dtb:maxPageNumber"/>
  </head>
  <navMap>
    ${chapters
      .map(
        (c, i) => `<navPoint class="chapter" id="navPoint-${
          i + 1
        }" playOrder="${i + 1}">
	<navLabel>
	  <text>${c.title}</text>
	</navLabel>
	<content src="OEBPS/${(i + "").padStart(8, "0")}.html"/>
  </navPoint>`
      )
      .join("")}
  </navMap>
</ncx>`;

export const chapterContent = (
  content: string
) => `<?xml version='1.0' encoding='utf-8'?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  </head>
  <body class="calibre">
    ${content}
  </body>
</html>`;
