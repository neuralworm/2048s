<script>
    import { dev } from "$app/environment";
    import "../app.css";
    import { inject } from '@vercel/analytics';
  inject({
    mode: dev ? 'development' : 'production'
  })
  </script>
  <div class="mx-auto max-w-xl py-8 w-72">

    <slot />
  </div>