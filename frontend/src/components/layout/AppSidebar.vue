<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Budget', path: '/budget' },
  { label: 'Reports', path: '/reports' },
  { label: 'Categories', path: '/categories' },
  { label: 'Settings', path: '/settings' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="wordmark">FinTrax</span>
      <span class="tagline">Personal Finance</span>
    </div>
    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="['nav-item', { active: route.path === item.path }]"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar">JD</div>
        <div>
          <div class="user-name">Jane Doe</div>
          <div class="user-role">Free plan</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-logo {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
}
.wordmark { font-size: 15px; font-weight: 500; }
.tagline { font-size: 12px; color: #999; margin-top: 2px; }
.nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  color: #666;
}
.nav-item:hover { background: #f4f4f4; color: #000; }
.nav-item.active { background: #f4f4f4; color: #000; font-weight: 500; }
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid #eee;
}
.user-chip { display: flex; align-items: center; gap: 10px; padding: 8px 12px; }
.avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #e8f0fe; color: #1a56db;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 500; flex-shrink: 0;
}
.user-name { font-size: 13px; font-weight: 500; }
.user-role { font-size: 11px; color: #999; }
</style>