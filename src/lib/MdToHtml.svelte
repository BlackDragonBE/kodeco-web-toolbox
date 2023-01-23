<script>
  import { Converter, setOption } from 'showdown';

  var text = '';
  var html = '';

  const convert = () => {
    var converter = new Converter();
    converter.setOption('noHeaderId', true);
    converter.setFlavor('github');
    html = converter.makeHtml(text);
	html = html.replaceAll('<em>', '<i>');
	html = html.replaceAll('</em>', '</i>');
  };
</script>

<textarea id="md" name="md" rows="10" cols="100" bind:value={text} />
<p />
<textarea id="html" name="html" rows="10" cols="100" bind:value={html} />
<p />
<button on:click={convert}> Convert </button>
