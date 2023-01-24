<script>
  import svelteLogo from './assets/svelte.svg';
  import Counter from './lib/Counter.svelte';
  import MdToHtml from './lib/MdToHtml.svelte';
</script>

<main>
  <h1 class="title">Kodeco Web Toolbox</h1>
  <div class="columns is-centered">
    <div class="column is-half">
      <div class="card">
		<header class="card-header">
			<p class="card-header-title">
			  Markdown to HTML 
			</p></header>
        <div class="card-content">
          <MdToHtml />
        </div>
      </div>
    </div>
  </div>
</main>
