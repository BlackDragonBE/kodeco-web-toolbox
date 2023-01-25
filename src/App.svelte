<script>
  import svelteLogo from './assets/svelte.svg';
  import Counter from './lib/Counter.svelte';
  import MdToHtml from './lib/MdToHtml.svelte';

  const Mode = {
    MdToHtml: Symbol('md_to_html'),
    HtmlToMd: Symbol('html_to_md'),
    About: Symbol('about'),
  };

  let appMode = Mode.MdToHtml;
</script>

<!-- <h1 class="title">Kodeco Web Toolbox</h1> -->

<div class="columns">
  <aside class="column is-narrow section">
    <p class="menu-label is-hidden-touch">Menu</p>
    <ul class="menu-list">
      <li>
        <a href="#" class="is-active">
          <span class="icon"><i class="fa-brands fa-markdown" /></span> Markdown to HTML
        </a>
      </li>
      <li>
        <a href="#" class="is-hidden">
          <span class="icon"><i class="fa-brands fa-html5" /></span> HTML to Markdown
        </a>
      </li>
      <li>
        <a href="#" class="is-hidden">
          <span class="icon"><i class="fa fa-info" /></span> About
        </a>
      </li>
    </ul>
  </aside>

  <MdToHtml />

</div>
