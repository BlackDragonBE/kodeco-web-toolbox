<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { each, element } from 'svelte/internal';

  // Based on https://developers.asana.com/reference/rest-api-reference

  let settingsFilledIn;

  let asana_personal_token = localStorage.getItem('asana_personal_token') || '';
  let asana_project_id = localStorage.getItem('asana_project_id') || '';

  let projectTasks = [];
  let ignoredTasks = [];
  let ignoredTasksText = '';

  let showTokenPass = false;

  let reportHtml = '';
  let iframeHeight = 0;
  let progress = 0;

  if (localStorage.getItem('ignoredTasks')) {
    ignoredTasks = JSON.parse(localStorage.getItem('ignoredTasks'));
    ignoredTasks.forEach((list) => {
      ignoredTasksText += list + '\n';
    });
    ignoredTasksText = ignoredTasksText.trim();
  } else {
    ignoredTasks = [];
    ignoredTasks.forEach((list) => {
      ignoredTasksText += list.trim() + '\n';
    });
    ignoredTasksText = ignoredTasksText.trim();
  }

  // Update local storage when settings change
  $: localStorage.setItem('asana_personal_token', asana_personal_token);
  $: localStorage.setItem('asana_project_id', asana_project_id);

  $: if (ignoredTasksText.length > 0) {
    ignoredTasks = ignoredTasksText.split('\n');
    localStorage.setItem('ignoredTasks', JSON.stringify(ignoredTasks));
  }

  $: settingsFilledIn = asana_personal_token.length > 60 && asana_project_id.length > 10;

  function resizeIframe() {
    const iframe = document.querySelector('iframe');
    iframeHeight = iframe.contentWindow.document.body.scrollHeight + 50;
  }

  async function createProjectReport() {
    try {
      console.log('Creating project report');

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: 'Bearer ' + asana_personal_token,
        },
      };

      // Get an array of tasks from the project that are incomplete
      const projectTasksResponse = await fetch('https://app.asana.com/api/1.0/projects/' + asana_project_id + '/tasks?completed_since=now', options);
      const projectTasksData = await projectTasksResponse.json();
      projectTasks = projectTasksData.data;
      console.log(projectTasks);

      // Remove ignored tasks
      projectTasks.forEach((task) => {
        if (ignoredTasks.includes(task.name)) {
          projectTasks.splice(projectTasks.indexOf(task), 1);
        }
      });

      let progressCounter = 1;
      progress = Math.round((progressCounter / projectTasks.length) * 100);
      // Iterate over tasks
      for (const task of projectTasks) {
        // Get task info
        const taskResponse = await fetch('https://app.asana.com/api/1.0/tasks/' + task.gid, options);
        const taskData = await taskResponse.json();
        const taskInfo = taskData.data;
        // console.log(taskInfo.name);

        // Get subtasks from task
        const subtaskResponse = await fetch('https://app.asana.com/api/1.0/tasks/' + taskInfo.gid + '/subtasks?opt_fields=completed,name,due_on,assignee.name', options);
        const subtasks = await subtaskResponse.json();
        task.subtasks = subtasks.data;
        // console.log(subtasks);

        // Iterate over subtasks until the first one that's not completed and store it
        let lastUncompletedSubtask;
        for (const subtask of subtasks.data) {
          if (!subtask.completed) {
            lastUncompletedSubtask = subtask;
            // console.log('Last uncompleted subtask: ' + lastUncompletedSubtask.name + ' (' + lastUncompletedSubtask.due_on + ')');
            task.lastUncompletedSubtask = lastUncompletedSubtask;
            break;
          }
        }

        // Log progress
        console.log('Progress: ' + progressCounter + '/' + projectTasks.length);

        // Set URL
        task.url = 'https://app.asana.com/0/' + asana_project_id + '/' + taskInfo.gid;

        // If due date is null, set it to 'No due date set', else set it to the formatted date
        if (task.lastUncompletedSubtask.due_on == null) {
          task.lastUncompletedSubtask.due_on = 'No due date set';
        } else {
          task.lastUncompletedSubtask.due_on = formatDate(new Date(task.lastUncompletedSubtask.due_on));
        }

        // If assignee is null, set it to 'Unassigned', else set it to the assignee name
        if (task.lastUncompletedSubtask.assignee == null) {
          task.lastUncompletedSubtask.assignee = 'Unassigned';
        } else {
          task.lastUncompletedSubtask.assignee = task.lastUncompletedSubtask.assignee.name;
        }

        console.log(task.name + ' - ' + task.url + '\nPhase: ' + task.lastUncompletedSubtask.name + ' (' + task.lastUncompletedSubtask.assignee + ', ' + task.lastUncompletedSubtask.due_on + ')');

        progressCounter++;
        progress = Math.round((progressCounter / projectTasks.length) * 100);
      }
    } catch (err) {
      console.error(err);
    }

    writeSimpleReport();
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
    projectTasks.forEach((task) => {
      reportHtml += `<h4><a href= "${task.url}">${task.name}</a></h4>`;
      reportHtml += `<b>Current phase: ${task.lastUncompletedSubtask.name}</b><br>Assigned: ${task.lastUncompletedSubtask.assignee}<br>Due: ${task.lastUncompletedSubtask.due_on}`;
      reportHtml += `<br />`;
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
          Go to <a href="https://app.asana.com/0/my-apps">https://app.asana.com/0/my-apps</a> and create a personal token. Paste the key in the Asana Personal Token field.<br />
        </p>
        <div class="field">
          <label for="" class="label">Asana Personal Token</label>
          <div class="control has-icons-right">
            {#if showTokenPass}
              <input class="input" type="text" bind:value={asana_personal_token} />
            {:else}
              <input class="input" type="password" bind:value={asana_personal_token} />
            {/if}
            <span class="icon is-small is-right" style="pointer-events: all; cursor: pointer" on:keydown={() => (showTokenPass = !showTokenPass)} on:click={() => (showTokenPass = !showTokenPass)}>
              <i class={showTokenPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
            </span>
          </div>
        </div>
        <div class="field">
          <label for="" class="label">Project ID</label>
          <p class="help">The project ID is in the URL of the Asana project, it's the second large number: https://app.asana.com/0/[PROJECT ID]/XXXXXX</p>
          <div class="control">
            <input class="input" bind:value={asana_project_id} />
          </div>
        </div>
        <div class="field">
          <label for="" class="label">Task names to ignore</label>
          <p class="help">The tasks in this list won't be included in the report.</p>
          <textarea rows="10" class="textarea is-small auto_height" bind:value={ignoredTasksText} />
        </div>
      </div>
    </div>
  </div>
</div>

<div class="column section">
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">Asana Reporter</p>
    </header>
    <div class="card-content">
      <div class="content">
        {#if settingsFilledIn}
          <p>Use the button below to generate a project report. The report can be used in emails to give a simple overview of the team status.</p>
          <div class="columns is-mobile is-centered has-text-centered">
            <div class="column">
              <button class="button is-primary" on:click={createProjectReport}>
                <span class="icon">
                  <i class="fas fa-bolt" />
                </span>
                <span>Create project report</span>
              </button>
            </div>
          </div>
          {#if progress > 0 && progress < 100}
            <progress class="progress is-success" max="100" value={progress}> {progress}% </progress>
          {/if}
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
                {#if asana_personal_token.length < 60}
                  <li>Asana Personal Token</li>
                {/if}
                {#if asana_project_id.length < 10}
                  <li>Project ID</li>
                {/if}
              </ul>
            </div>
          </article>
        {/if}
      </div>
    </div>
  </div>
</div>
