<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const pageTitle = computed(() => {
  const name = route.name?.toString() ?? ''
  return name.charAt(0).toUpperCase() + name.slice(1)
})
</script>

<template>
  <header class="topbar">
    <span class="page-title">{{ pageTitle }}</span>
  </header>
</template>

<style scoped>
.topbar {
  height: 56px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.page-title { font-size: 16px; font-weight: 500; }
.btn-primary {
  padding: 7px 16px;
  border-radius: 6px;
  border: none;
  background: #000;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.btn-primary:hover { background: #222; }
</style>