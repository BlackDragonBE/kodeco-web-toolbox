<script>
  import svelteLogo from './assets/svelte.svg';
  import MdToHtml from './lib/MdToHtml.svelte';
</script>

<main>
  <h1>Kodeco Web Toolbox</h1>

  <div class="card">
    <MdToHtml />
  </div>
</main>

<style>
  .logo {
    height: 3em;
    padding: 0.5em;
    will-change: filter;
  }
</style>
