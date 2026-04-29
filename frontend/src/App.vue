<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="main">
      <AppTopbar />
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
</style>

<style scoped>
.app-shell { display: flex; height: 100vh; }
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.content { flex: 1; overflow-y: auto; padding: 28px; }
</style>