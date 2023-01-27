<script>
  import About from './lib/About.svelte';
  import Counter from './lib/Counter.svelte';
  import HtmlToMd from './lib/HtmlToMd.svelte';
  import MdToHtml from './lib/MdToHtml.svelte';
  import { onMount } from 'svelte';

  const Mode = {
    MdToHtml: Symbol('md_to_html'),
    HtmlToMd: Symbol('html_to_md'),
    About: Symbol('about'),
  };

  let appMode = Mode.MdToHtml;

  onMount(async () => {

  });
</script>

<!-- <h1 class="title">Kodeco Web Toolbox</h1> -->

<div class="columns is-desktop">
  <aside class="column is-narrow section">
    <p class="menu-label is-hidden-touch">Menu</p>
    <ul class="menu-list">
      <li>
        <a
          href="#/"
          class:is-active={appMode == Mode.MdToHtml}
          on:click={() => {
            appMode = Mode.MdToHtml;
          }}
        >
          <span class="icon"><i class="fa-brands fa-markdown" /></span> MD <span class="icon"><i class="fas fa-arrow-right" /></span> HTML
        </a>
      </li>
      <li>
        <a
          href="#/"
          class="is-hidden"
          class:is-active={appMode == Mode.HtmlToMd}
          on:click={() => {
            appMode = Mode.HtmlToMd;
          }}
        >
          <span class="icon"><i class="fa-brands fa-html5" /></span> HTML <span class="icon"><i class="fas fa-arrow-right" /></span> MD
        </a>
      </li>
      <li>
        <a
          href="#/"
          class:is-active={appMode == Mode.About}
          on:click={() => {
            appMode = Mode.About;
          }}
        >
          <span class="icon"><i class="fa fa-info" /></span> About
        </a>
      </li>
    </ul>
  </aside>

  {#if appMode == Mode.MdToHtml}
    <MdToHtml />
  {:else if appMode == Mode.HtmlToMd}
    <HtmlToMd />
  {:else if appMode == Mode.About}
    <About />
  {/if}
</div>
