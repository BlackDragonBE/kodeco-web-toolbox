<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { each } from 'svelte/internal';

  let settingsFilledIn;

  let apiKey = localStorage.getItem('apiKey') || '';
  let token = localStorage.getItem('token') || '';
  let boardId = localStorage.getItem('boardId') || '';

  let boardLists = [];
  let reportLists = [];
  let reportListsText = '';
  let ignoredCards = [];
  let ignoredCardsText = '';

  if (localStorage.getItem('reportLists')) {
    reportLists = JSON.parse(localStorage.getItem('reportLists'));
    reportLists.forEach((list) => {
      reportListsText += list + '\n';
    });
    reportListsText = reportListsText.trim();
  } else {
    reportLists = ['Author: Outline', 'Author: Sample Project', 'Author: Writing', 'FPE: Spot Check', 'Tech Editor: Tech Edit', 'Editor: Edit', 'FPE: Final Pass Edit', 'Team Lead: Review & Schedule'];
    reportLists.forEach((list) => {
      reportListsText += list.trim() + '\n';
    });
    reportListsText = reportListsText.trim();
  }

  if (localStorage.getItem('ignoredCards')) {
    ignoredCards = JSON.parse(localStorage.getItem('ignoredCards'));
    ignoredCards.forEach((list) => {
      ignoredCardsText += list + '\n';
    });
    ignoredCardsText = ignoredCardsText.trim();
  } else {
    ignoredCards = [];
    ignoredCards.forEach((list) => {
      ignoredCardsText += list.trim() + '\n';
    });
    ignoredCardsText = ignoredCardsText.trim();
  }

  $: localStorage.setItem('apiKey', apiKey);
  $: localStorage.setItem('token', token);
  $: localStorage.setItem('boardId', boardId);

  $: if (reportListsText.length > 0) {
    reportLists = reportListsText.split('\n');
    localStorage.setItem('reportLists', JSON.stringify(reportLists));
  }

  $: if (ignoredCardsText.length > 0) {
    ignoredCards = ignoredCardsText.split('\n');
    localStorage.setItem('ignoredCards', JSON.stringify(ignoredCards));
  }

  $: settingsFilledIn = apiKey.length > 10 && token.length > 10 && boardId.length > 4;



  function createBoardReport() {
    boardLists = [];
    // Get Lists
    fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}&cards=open&filter=open`)
      .then((response) => response.json())
      .then((lists) => {
        boardLists = lists;
        writeSimpleReport();
      });
  }

  function formatDate(date) {
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  function writeSimpleReport() {
    let newWin = open('url', 'windowName', 'height=600,width=800');
    newWin.document.write(`<style>body{font-family: Arial, Helvetica, sans-serif;font-size:small}</style>`);
    boardLists.forEach((list) => {
      if (reportLists.includes(list.name)) {
        newWin.document.write(`<h4>${list.name}</h4>`);
        // console.log('- ', list.name);
        if (list.cards.length == 0) {
          //   newWin.document.write(`None<br>`);
        }
        list.cards.forEach((card) => {
          if (!ignoredCards.includes(card.name)) {
            newWin.document.write(`- <a href= "${card.url}">${card.name}</a>`);
            if (card.due != null) {
              let daysDiff = dateDiffInDays(new Date(Date.now()), new Date(card.due));
              let dueDate = formatDate(new Date(card.due));

              if (daysDiff > 0) {
                newWin.document.write(` Due: ${dueDate} (in ${daysDiff} days)`);
              } else {
                newWin.document.write(` Due: ${dueDate} (${daysDiff} days ago)`);
              }

              newWin.document.write('<br>');
            }
          }
        });
      }
    });

    newWin.document.close();
  }
</script>

<div class="column is-3-desktop is-12-tablet section">
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">Settings</p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="help">
          Go to <a href="https://trello.com/app-key">https://trello.com/app-key</a> and paste the personal key in the Trello API Key field.<br />
          To get the token, click the Token link and paste the token you get in the Trello Token field.
        </p>
        <div class="field">
          <label for="" class="label">Trello API Key</label>
          <div class="control">
            <input class="input" bind:value={apiKey} />
          </div>
        </div>
        <div class="field">
          <label for="" class="label">Trello Token</label>
          <div class="control">
            <input class="input" bind:value={token} />
          </div>
        </div>
        <p class="help">The board ID is in the URL of the Trello board: https://trello.com/b/[BOARD ID]</p>
        <div class="field">
          <label for="" class="label">Board ID</label>
          <div class="control">
            <input class="input" bind:value={boardId} />
          </div>
        </div>
        <div class="field">
          <label for="" class="label">Board lists to report</label>
          <textarea rows="10" class="textarea is-small auto_height" bind:value={reportListsText} />
        </div>
        <div class="field">
          <label for="" class="label">Cards names to ignore</label>
          <p class="help">The card names in this list won't be included in the report.</p>
          <textarea rows="10" class="textarea is-small auto_height" bind:value={ignoredCardsText} />
        </div>
      </div>
    </div>
  </div>
</div>

<div class="column section">
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">Trello Reporter</p>
    </header>
    <div class="card-content">
      <div class="content">
        {#if settingsFilledIn}
          <p>Use the button below to generate a board report and open it in a new window. The report can be used in emails to give a simple overview of the team status.</p>
          <div class="columns is-mobile is-centered has-text-centered">
            <div class="column">
              <button class="button is-primary" on:click={createBoardReport}>
                <span class="icon">
                  <i class="fas fa-bolt" />
                </span>
                <span>Create board report</span></button
              >
            </div>
          </div>
        {:else}
          <article class="message is-info is-small">
            <div class="message-header">
              <p>Missing information</p>
            </div>
            <div class="message-body">Fill in these missing settings first:
				<ul>
				{#if apiKey.length < 10}
				<li>API Key</li>	
				{/if}
				{#if token.length < 10}
				<li>Token</li>	
				{/if}
				{#if boardId.length < 4}
				<li>Board ID</li>	
				{/if}
				</ul>
			</div>
          </article>
        {/if}
      </div>
    </div>
  </div>
</div>
