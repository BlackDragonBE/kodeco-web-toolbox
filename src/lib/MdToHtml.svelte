<script>
  import MdConverter from './MdConverter.svelte';

  let converter;
  let md = '';
  let html = '';
  let errors = [];

  $: if (md.length > 0) {
    // Convert md to html every time md changes
    convertToHtml();
  }

  function convertToHtml() {
    converter
      .convert(md)
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
    let data = ev.dataTransfer.files[0];
    data.text().then((result) => {
      md = result;
    });
  }
</script>

<div class="content">
<h4 class="m-1">Markdown</h4>
<textarea class="textarea" id="md" name="md" rows="10" cols="100" placeholder="Paste markdown here or drag a markdown file to this area" bind:value={md} on:drop={dropMarkdown} on:dragover={allowDrop} />
<p />
<MdConverter bind:this={converter} />
<h4>HTML</h4>
<textarea class="textarea" id="html" name="html" rows="10" cols="100" readonly placeholder="HTML result will show up here" bind:value={html} />
<p />

{#if html.length > 0}
  <button class="button" on:click={copyToClipboard}> Copy HTML to clipboard</button>
{/if}

{#if errors.length > 0}
  <p>The URLs below couldn't be found. Make sure you've uploaded your images to the <a href="https://www.kodeco.com/wp-admin/upload.php">Media Library</a> before converting.</p>
  <ul>
  {#each errors as err}
      <li>{err}</li>
  {/each}
  </ul>
{/if}
</div>