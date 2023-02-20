<script>
  import TurndownService from 'turndown';

  export async function convert(html) {
    return new Promise(async (resolve, reject) => {
      const convertSettings = {
        headingStyle: 'atx',
        hr: '---',
        codeBlockStyle: 'fenced',
        emDelimiter: '*',
        bulletListMarker: '-',
        preformattedCode: 'false',
      };
      const turndownService = new TurndownService(convertSettings);

      turndownService.addRule('precode', {
        filter: ['pre'],
        replacement: function (content, node) {
          return '\n```' + node.getAttribute('lang') + '\n' + content + '```';
        },
      });

	  // em > bold
	  html = html.replaceAll('<em>', '<strong>');
	  html = html.replaceAll('</em>', '</strong>');

	  // CR LN > LN
	  html = html.replaceAll('\r\n', '\n');

	  // Reintroduce paragraphs
	  html = html.replaceAll('\n\n', '<p\>');

      // @ts-ignore
      let output = turndownService.turndown(html);

	  output = output.replaceAll('\\[', '[');
	  output = output.replaceAll('\\]', ']');
      resolve(output);
    });
  }
</script>
