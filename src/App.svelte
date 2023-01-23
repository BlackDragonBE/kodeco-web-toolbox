<script>
  import svelteLogo from './assets/svelte.svg';
  import Counter from './lib/Counter.svelte';
  import MdToHtml from './lib/MdToHtml.svelte';
</script>

<main>
  <h1>Markdown to HTML</h1>

  <div class="card">
    <MdToHtml />
  </div>

  <a href="https://svelte.dev" target="_blank" rel="noreferrer">
	Powered by Svelte<br>
    <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
  </a>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
</style>
