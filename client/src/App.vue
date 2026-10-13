<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div
    dir="ltr"
    class="min-h-screen bg-[#f4f6f8] font-['Segoe_UI',system-ui,sans-serif] text-[#1c2430]"
  >
    <header class="bg-[#16324f] py-5 ps-6 pe-6 text-white">
      <h1 class="m-0 text-[1.35rem] [font-weight:650]">Action Item — User Profiles</h1>
    </header>
    <main class="py-6 ps-6 pe-6">
      <RouterView />
    </main>
  </div>
</template>
