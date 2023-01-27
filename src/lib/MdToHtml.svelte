<script>
  import MdConverter from './MdConverter.svelte';

  let converter;
  let md = '';
  let html = '';
  let urlErrors = [];
  let scanErrors = [];

  // Options
  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1; // getMonth() returns a 0-based index, so we need to add 1 to get the actual month number
  const formattedDate = thisYear + '-' + (thisMonth < 10 ? '0' + thisMonth : thisMonth);
  let imageUploadMonth = formattedDate;
  let selectedYear;
  let selectedMonth;

  // Update selected year and month when month selection changes
  $: {
    selectedYear = imageUploadMonth.split('-')[0];
    selectedMonth = imageUploadMonth.split('-')[1];
  }

  $: if (md.length > 0) {
    // Convert md to html every time md changes
    convertToHtml();
  }

  function convertToHtml() {
    converter
      .convert(md, selectedYear, selectedMonth)
      .then((output) => {
        html = output.html;
        urlErrors = output.errorUrls;
        scanErrors = output.scanErrors;
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

  function dropMarkdown(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.files[0];
    data.text().then((result) => {
      md = result;
    });
  }
</script>

<div class="column is-2-desktop is-12-tablet section">
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
              Add border to all images
            </label>
          </div>
        </div>
        <div class="field">
          <label for="" class="label">Image upload month</label>
          <div class="control">
            <input class="input" type="month" bind:value={imageUploadMonth} />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="column section">
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">Markdown to HTML converter</p>
    </header>
    <div class="card-content">
      <div class="content">
        <label for="" class="label">Markdown</label>
        <textarea class="textarea is-small" id="md" name="md" rows="5" cols="100" bind:value={md} on:drop={dropMarkdown} on:dragover|preventDefault />
        <p class="help">Drag a markdown file above or paste markdown to start converting! You can do a manual re-conversion with the button below.</p>
        <p />
        <div class="columns is-mobile is-centered has-text-centered">
          <div class="column is-half">
            <button class="button is-primary" on:click={convertToHtml}>
              <span class="icon">
                <i class="fas fa-bolt" />
              </span>
              <span>Convert to HTML</span></button
            >
          </div>
        </div>

        <MdConverter bind:this={converter} />

        {#if html.length > 0}
          <label for="" class="label">HTML</label>
          <textarea class="textarea is-small" id="html" name="html" rows="5" cols="100" readonly placeholder="HTML result will show up here" bind:value={html} />
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

        {#if urlErrors.length > 0}
          <article class="message is-danger is-small">
            <div class="message-header">
              <p>
                <span class="icon">
                  <i class="fas fa-circle-exclamation" />
                </span>URL Errors
              </p>
            </div>
            <div class="message-body">
              The URLs below couldn't be found.<br />
              Make sure you've uploaded your images to the <a href="https://www.kodeco.com/wp-admin/upload.php">Media Library</a> before converting and set up the correct upload month in the settings.
              {#each urlErrors as err}
                <div class="card listcard p-2 my-2">{err}</div>
              {/each}
            </div>
          </article>
        {/if}

        {#if scanErrors.length > 0}
          <article class="message is-danger is-small">
            <div class="message-header">
              <p>
                <span class="icon">
                  <i class="fas fa-circle-exclamation" />
                </span>Markdown Scanner Errors
              </p>
            </div>
            <div class="message-body">
              While scanning the content of the markdown, the following errors were found:
              {#each scanErrors as err}
                <div class="card listcard p-2 my-2">{err}</div>
              {/each}
            </div>
          </article>
        {/if}
      </div>
    </div>
  </div>
</div>
