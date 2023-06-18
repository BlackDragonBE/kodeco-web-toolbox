<script>
  import { Converter, setOption } from 'showdown';
  import TurndownService from 'turndown';

  let progress = 0;

  export async function convert(markdown, year, month, imageBorders) {
    return new Promise(async (resolve, reject) => {
      progress = 0;

      let converter = new Converter();
      converter.setOption('noHeaderId', true);
      //   converter.setOption('ghCodeBlocks', false);
      converter.setFlavor('github');

      let html = '';
      html = converter.makeHtml(markdown);

      // Simple replaces
      html = performSimpleReplacements(html);

      // DOM manipulation
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');
      let imageConvertOutput = await convertLocalPathsToUrls(doc, year, month, imageBorders);
      doc = imageConvertOutput.doc;
      doc = await addLinkAttributes(doc);
      let errorUrls = imageConvertOutput.errorUrls;

      let scanErrors = await scanMarkdown(markdown);

      html = doc.body.innerHTML;
      html = performFinalCleanup(html);

      //   const turndownService = new TurndownService();
      //   @ts-ignore
      //   console.log(turndownService.turndown(html));

      let output = {
        html: html,
        errorUrls: errorUrls,
        scanErrors: scanErrors,
      };

      resolve(output);
    });
  }

  function performSimpleReplacements(html) {
    html = html.replaceAll('<pre><code class=', '\n<pre lang=');
    // html = html.replaceAll('lang-', '');
    html = html.replaceAll(/\slanguage-[a-z]+/g, '');
    html = html.replaceAll('</code></pre>', '</pre>\n');
    html = html.replaceAll('<em>', '<i>');
    html = html.replaceAll('<em>', '<i>');
    html = html.replaceAll('<em>', '<i>');
    html = html.replaceAll('</em>', '</i>');
    html = html.replaceAll('<strong>', '<em>');
    html = html.replaceAll('</strong>', '</em>');
    html = html.replaceAll('<br>', '');
    html = html.replaceAll('<p>', '');
    html = html.replaceAll('</p>', '\n');
    html = html.replaceAll('</ul>', '</ul>\n');
    html = html.replaceAll('\n</blockquote>', '</div>\n');
    html = html.replaceAll('<blockquote>\n  <em>Note', '<div class="note">\n<em>Note');
    html = html.replaceAll('<blockquote>', '<div>');
    return html;
  }

  /**
   * Converts local image paths in a document to URLs pointing to remote images
   * @param {Document} doc - The document to modify
   * @param {number} year - The year of the remote image URL
   * @param {number} month - The month of the remote image URL
   * @param {boolean} imageBorders - Whether or not to add borders to images
   * @returns {Promise<{doc: Document, errorUrls: string[]}>} - A promise that resolves with the modified document and a list of any image URLs that could not be loaded
   */
  function convertLocalPathsToUrls(doc, year, month, imageBorders) {
    return new Promise((resolve, reject) => {
      let imgElements = doc.getElementsByTagName('img');

      // If there are no images, return
      if (imgElements.length < 1) {
        var output = {
          doc: doc,
          errorUrls: [],
        };
        resolve(output);
      }

      let mediaUrl = 'https://files.koenig.kodeco.com/uploads/' + year + '/' + month + '/';

      let totalPromises = imgElements.length;
      let resolvedPromises = 0;
      let errorUrls = [];

      // Iterate over all image elements in the document
      for (let i = 0; i < imgElements.length; i++) {
        let urlParts = imgElements[i].src.split('/');
        let fileName = urlParts[urlParts.length - 1];

        // Replace local with remote image url
        if (!imgElements[i].src.includes('/uploads/')) {
          imgElements[i].src = mediaUrl + fileName;
        }

        // Add image classes
        imgElements[i].className = 'aligncenter size-full';

        if (imageBorders) {
          imgElements[i].className += ' bordered';
        }

        // Wrap the img element in an a tag
        let aElement = document.createElement('a');
        aElement.href = imgElements[i].src;
        imgElements[i].parentNode.insertBefore(aElement, imgElements[i]);
        aElement.appendChild(imgElements[i]);

        // Check if image exists
        checkIfImageExists(imgElements[i].src).then(function (exists) {
          resolvedPromises++;
          progress = (resolvedPromises / imgElements.length) * 100;

          if (!exists) {
            errorUrls.push(imgElements[i].src);
          }

          if (resolvedPromises === totalPromises) {
            //All promises have been resolved
            // console.log('All images checked');

            var output = {
              doc: doc,
              errorUrls: errorUrls,
            };

            resolve(output);
          }
        });
      }
    });
  }

  // Check if image exists
  function checkIfImageExists(url) {
    return new Promise(function (resolve, reject) {
      let image = new Image();
      image.onload = function () {
        if (image.width > 0) {
          resolve(true);
        }
      };
      image.onerror = function () {
        resolve(false);
      };
      image.src = url;
    });
  }

  function addLinkAttributes(doc) {
    return new Promise((resolve, reject) => {
      let links = doc.getElementsByTagName('a');

      for (let i = 0; i < links.length; i++) {
        links[i].target = '_blank';
        links[i].rel = 'noopener noreferrer nofollow';
      }

      resolve(doc);
    });
  }

  function performFinalCleanup(html) {
    html = html.replaceAll('<br>', '');
    html = html.trim();
    return html;
  }

  // Scan markdown
  async function scanMarkdown(markdown) {
    return new Promise(async (resolve, reject) => {
      let problemsFound = [];

      // Load british word dict
      let britishAmericanWordsDict = await fetch('markdown-scanner/british-american.csv')
        .then((response) => response.text())
        .then((data) => {
          const rows = data.split('\n');
          const csvAsDict = rows.reduce((acc, row) => {
            const [key, value] = row.split(',');
            acc[key] = value;
            return acc;
          }, {});
          return csvAsDict;
        });

      // Load misspelling word dict
      let misspellingDict = await fetch('markdown-scanner/misspelling.csv')
        .then((response) => response.text())
        .then((data) => {
          const rows = data.split('\n');
          const csvAsDict = rows.reduce((acc, row) => {
            const [key, value] = row.split(',');
            acc[key] = value;
            return acc;
          }, {});
          return csvAsDict;
        });

      // Scan words
      let words = markdown.match(/[\w']+/g);
      console.log(words.length);

      // British > American
      let britishWordProblems = words
        .map(function (word) {
          if (word.toLowerCase() in britishAmericanWordsDict) {
            let american = britishAmericanWordsDict[word.toLowerCase()];
            return "British word found: '" + word + "'. Please replace this with '" + american + "'.";
          }
          return null;
        })
        .filter((p) => p != null);
      problemsFound.push(...britishWordProblems);

      // Misspelled > correct
      let spellingProblems = words
        .map(function (word) {
          if (word.toLowerCase() in misspellingDict) {
            let correctSpelling = misspellingDict[word.toLowerCase()];
            return "Misspelled word found: '" + word + "'. Please replace this with '" + correctSpelling + "'.";
          }
          return null;
        })
        .filter((p) => p != null);
      problemsFound.push(...spellingProblems);

      // Sections
      if (!markdown.includes('Where to Go From Here')) {
        problemsFound.push('Section not found: Where to Go From Here. Please add this section.');
      }

      resolve(problemsFound);
    });
  }
</script>

{#if progress > 0 && progress < 100}
  <progress class="progress is-success" max="100" value={progress}> {progress}% </progress>
{/if}
