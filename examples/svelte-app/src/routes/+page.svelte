<!--
  Signal-Σ Universal Plugin System
  Welcome page with navigation to demos
-->

<script>
  import { onMount } from 'svelte';

  // Redirect to plugin demo
  onMount(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/plugin-demo';
    }
  });
</script>

<div class="welcome">
  <h1>🔌 Signal-Σ Universal Plugin System</h1>
  <p>Redirecting to plugin demo...</p>
  <p>If you're not redirected, <a href="/plugin-demo">click here</a></p>
</div>

<style>
  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  h1 {
    color: #2563eb;
    margin-bottom: 1rem;
  }

  a {
    color: #2563eb;
    text-decoration: underline;
  }
</style>
