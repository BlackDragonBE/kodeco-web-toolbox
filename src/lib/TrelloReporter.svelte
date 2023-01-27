<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  let settingsFilledIn;

  let apiKey = localStorage.getItem('apiKey') || '';
  let token = localStorage.getItem('token') || '';
  let boardId = localStorage.getItem('boardId') || '';
  let reportLists = [];
  let reportListsText = '';

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

  $: localStorage.setItem('apiKey', apiKey);
  $: localStorage.setItem('token', token);
  $: localStorage.setItem('boardId', boardId);
  $: if (reportListsText.length > 0) {
    reportLists = reportListsText.split('\n');
    localStorage.setItem('reportLists', JSON.stringify(reportLists));
  }

  $: settingsFilledIn = apiKey.length > 10 && token.length > 10 && boardId.length > 4;

  let boardMembers = [];
  let boardLists = [];

  // Any card with a name in this list will be ignored. This is useful to filter out utility or informational cards.
  let ignoredCardTitles = ['How do I do an FPE Spot Check?', 'How to Assign An Editor'];

  function createBoardReport() {
    // Members
    // fetch(`https://api.trello.com/1/boards/${boardId}/members?key=${apiKey}&token=${token}`)
    //   .then((response) => response.json())
    //   .then((members) => {
    //     boardMembers = members;
    //     console.log(boardMembers);
    //   });

    // Lists
    fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}&cards=all&filter=open`)
      .then((response) => response.json())
      .then((lists) => {
        boardLists = lists;
        console.log(boardLists);
      });
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
        <article class="message is-warning is-small">
          <div class="message-header">
            <p>
              <span class="icon">
                <i class="fas fa-circle-exclamation" />
              </span>Here be dragons
            </p>
          </div>
          <div class="message-body">This feature isn't fully implemented yet.</div>
        </article>

        {#if settingsFilledIn}
          <div class="columns is-mobile is-centered has-text-centered">
            <div class="column">
              <button class="button is-primary" on:click={createBoardReport}>
                <span class="icon">
                  <i class="fas fa-bolt" />
                </span>
                <span>Create board report</span></button
              >
              {#each boardLists as list}
                <div class="card listcard p-2 my-2">{list.name}</div>
              {/each}
            </div>
          </div>
        {:else}
          <article class="message is-info is-small">
            <div class="message-header">
              <p>Missing information</p>
            </div>
            <div class="message-body">Fill in the settings first.</div>
          </article>
        {/if}
      </div>
    </div>
  </div>
</div>
