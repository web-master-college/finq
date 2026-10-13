<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const navLinkClass =
  'rounded-full py-1 ps-3 pe-3 text-sm text-white/85 no-underline hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [&.router-link-exact-active]:bg-white [&.router-link-exact-active]:text-[#16324f] [&.router-link-exact-active]:[font-weight:650] [&.router-link-exact-active]:hover:bg-white'
</script>

<template>
  <div
    dir="ltr"
    class="min-h-screen bg-[#f4f6f8] font-['Segoe_UI',system-ui,sans-serif] text-[#1c2430]"
  >
    <header class="bg-[#16324f] py-5 ps-6 pe-6 text-white">
      <h1 class="m-0 text-[1.35rem] [font-weight:650]">Action Item — User Profiles</h1>
      <nav class="mt-4 flex flex-wrap gap-2" aria-label="Primary">
        <RouterLink :class="navLinkClass" to="/">Home</RouterLink>
        <RouterLink :class="navLinkClass" to="/fetch">Fetch</RouterLink>
        <RouterLink :class="navLinkClass" to="/history">History</RouterLink>
      </nav>
    </header>
    <main class="py-6 ps-6 pe-6">
      <RouterView />
    </main>
  </div>
</template>
