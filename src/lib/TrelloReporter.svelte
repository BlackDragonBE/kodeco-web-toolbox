<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { each, element } from 'svelte/internal';

  let settingsFilledIn;

  let apiKey = localStorage.getItem('apiKey') || '';
  let token = localStorage.getItem('token') || '';
  let boardId = localStorage.getItem('boardId') || '';

  let boardLists = [];
  let reportLists = [];
  let reportListsText = '';
  let ignoredCards = [];
  let ignoredCardsText = '';

  let showTokenPass = false;

  let reportHtml = '';
  let iframeHeight = 0;

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

  function resizeIframe() {
    const iframe = document.querySelector('iframe');
    iframeHeight = iframe.contentWindow.document.body.scrollHeight + 50;
  }

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
	reportHtml = '';

    reportHtml = '<html><body style="background-color:#FFFFFF;">';
    reportHtml += `<style>body{font-family: Arial, Helvetica, sans-serif;font-size:small}</style>`;
    boardLists.forEach((list) => {
      if (reportLists.includes(list.name)) {
        reportHtml += `<h4>${list.name}</h4>`;

        // console.log('- ', list.name);
        if (list.cards.length == 0) {
        }
        list.cards.forEach((card) => {
          if (!ignoredCards.includes(card.name)) {
            reportHtml += `- <a href= "${card.url}">${card.name}</a>`;
            if (card.due != null) {
              let daysDiff = dateDiffInDays(new Date(Date.now()), new Date(card.due));
              let dueDate = formatDate(new Date(card.due));

              if (daysDiff > 0) {
                reportHtml += ` Due: ${dueDate} (in ${daysDiff} days)`;
              } else {
                reportHtml += ` Due: ${dueDate} (${daysDiff} days ago)`;
              }

              reportHtml += '<br>';
            }
          }
        });
      }
    });

    reportHtml += '</body></html>';
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
          <div class="control has-icons-right">
            {#if showTokenPass}
              <input class="input" type="text" bind:value={token} />
            {:else}
              <input class="input" type="password" bind:value={token} />
            {/if}
            <span class="icon is-small is-right" style="pointer-events: all; cursor: pointer" on:keydown={() => (showTokenPass = !showTokenPass)} on:click={() => (showTokenPass = !showTokenPass)}>
              <i class={showTokenPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
            </span>
          </div>
        </div>
        <div class="field">
          <label for="" class="label">Board ID</label>
          <p class="help">The board ID is in the URL of the Trello board: https://trello.com/b/[BOARD ID]</p>
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
          <p>Use the button below to generate a board report and show it below. The report can be used in emails to give a simple overview of the team status.</p>
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
		  {#if reportHtml.length > 0}
          <iframe id="reportFrame" title="Report" width="100%" style="height: {iframeHeight}px;" srcdoc={reportHtml} on:load={resizeIframe} />
		  {/if}
        {:else}
          <article class="message is-info is-small">
            <div class="message-header">
              <p>Missing information</p>
            </div>
            <div class="message-body">
              Fill in these missing settings first:
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
