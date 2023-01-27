<script>
  import HtmlConverter from './HtmlConverter.svelte';

  let converter;
  let md = '';
  let html = '';
  let errors = [];

  // Options

  $: if (html.length > 0) {
    // Convert md to html every time md changes
    convertToMarkdown();
  }

  function convertToMarkdown() {
    converter
      .convert(html)
      .then((output) => {
        md = output;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(md);
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function dropHtml(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.files[0];
    data.text().then((result) => {
      html = result;
    });
  }
</script>

<div class="column is-2-desktop is-12-tablet section is-hidden">
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">Settings</p>
    </header>
    <div class="card-content">
      <div class="content">
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" checked />
              Placeholder
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="column section">
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">HTML to Markdown converter</p>
    </header>
    <div class="card-content">
      <div class="content">
        <label for="" class="label">HTML</label>
        <textarea class="textarea is-small" id="html" name="html" rows="5" cols="100" bind:value={html} on:drop={dropHtml} on:dragover|preventDefault />
        <p class="help">Drag an html file above or paste html from the edit page (e.g. https://www.kodeco.com/wp-admin/post.php?post=00000&action=edit) on WordPress to start converting! You can do a manual re-conversion with the button below.</p>
        <p />
        <div class="columns is-mobile is-centered has-text-centered">
          <div class="column is-half">
            <button class="button is-primary" on:click={convertToMarkdown}>
              <span class="icon">
                <i class="fas fa-bolt" />
              </span>
              <span>Convert to Markdown</span></button
            >
          </div>
        </div>

        <HtmlConverter bind:this={converter} />

        {#if md.length > 0}
          <label for="" class="label">Markdown</label>
          <textarea class="textarea is-small" id="md" name="md" rows="5" cols="100" readonly placeholder="Markdown result will show up here" bind:value={md} />
          <p />
          <div class="columns is-mobile is-centered has-text-centered">
            <div class="column is-half">
              <button class="button is-primary" on:click={copyToClipboard}>
                <span class="icon">
                  <i class="fas fa-copy" />
                </span>
                <span>Copy to clipboard</span></button
              >
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
