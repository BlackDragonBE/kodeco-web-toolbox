<script>
  import { convert } from './MdConverter.js';
  var md = '';
  var html = '';
  let errors = [];

  function convertToHtml() {
    convert(md)
      .then((output) => {
        html = output.html;
        errors = output.errorUrls;
        console.log('Errors');
        console.log(errors);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(html);
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function dropMarkdown(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.files[0];
    data.text().then((result) => {
      md = result;
    });
  }
</script>

<h2>Markdown to HTML</h2>

<h3>Markdown</h3>
<textarea id="md" name="md" rows="10" cols="100" placeholder="Paste markdown here or drag a markdown file to this area" bind:value={md} on:drop={dropMarkdown} on:dragover={allowDrop} />
<p />
<button on:click={convertToHtml}> Convert markdown to Kodeco HTML</button>
<p />
<h3>HTML</h3>
<textarea id="html" name="html" rows="10" cols="100" readonly placeholder="HTML result will show up here" bind:value={html} />
<p />
{#if html.length > 0}
  <button on:click={copyToClipboard}> Copy HTML to clipboard</button>
{/if}

{#if errors.length > 0}
  <p>URL Errors:</p>
  {#each errors as err}
    <div>
      URL not found: {err}
    </div>
  {/each}
{/if}
