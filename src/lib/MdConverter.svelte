<script>
  import { Converter, setOption } from 'showdown';
  import TurndownService from 'turndown';

  let progress = 0;

  export async function convert(markdown, year, month) {
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
      let imageConvertOutput = await convertLocalPathsToUrls(doc, year, month);
      doc = imageConvertOutput.doc;
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

  function convertLocalPathsToUrls(doc, year, month) {
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

      //   const today = new Date();
      //   const year = today.getFullYear();
      //   const month = today.getMonth() + 1; // getMonth() returns a 0-based index, so we need to add 1 to get the actual month number
      //   const formattedDate = year + '/' + (month < 10 ? '0' + month : month);

      let mediaUrl = 'https://files.koenig.kodeco.com/uploads/' + year + '/' + month + '/';

      let totalPromises = imgElements.length;
      let resolvedPromises = 0;
      let errorUrls = [];

      for (let i = 0; i < imgElements.length; i++) {
        let urlParts = imgElements[i].src.split('/');
        let fileName = urlParts[urlParts.length - 1];

        // Replace local with remote image url
        if (!imgElements[i].src.startsWith('http') || !imgElements[i].src.startsWith('www')) {
          imgElements[i].src = mediaUrl + fileName;
        }

        // Add image classes
        imgElements[i].className = 'aligncenter bordered size-full';

        imageExists(mediaUrl + fileName).then(function (exists) {
          resolvedPromises++;
          progress = (resolvedPromises / imgElements.length) * 100;

          if (!exists) {
            errorUrls.push(mediaUrl + fileName);
          }

          if (resolvedPromises === totalPromises) {
            //All promises have been resolved
            console.log('All images checked');

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

  function imageExists(url) {
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

  function performFinalCleanup(html) {
    html = html.replaceAll('<br>', '');
    html = html.trim();
    return html;
  }

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

    //   console.log(problemsFound);
      resolve(problemsFound);
    });
  }
</script>

{#if progress > 0 && progress < 100}
  <progress class="progress is-success" max="100" value={progress}> {progress}% </progress>
{/if}
