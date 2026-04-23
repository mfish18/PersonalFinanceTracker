<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Budget', path: '/budget' },
  { label: 'Reports', path: '/reports' },
  { label: 'Categories', path: '/categories' },
  { label: 'Settings', path: '/settings' },
]

function logout() {
  authStore.logout()
  router.push('/login')
}

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="wordmark">Fintrack</span>
      <span class="tagline">Personal finance</span>
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
        <div class="avatar">{{ initials(authStore.user?.display_name ?? 'U') }}</div>
        <div class="user-info">
          <div class="user-name">{{ authStore.user?.display_name }}</div>
          <div class="user-role">{{ authStore.user?.email }}</div>
        </div>
      </div>
      <button class="btn logout-btn" @click="logout">Sign out</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-logo {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}
.wordmark { font-size: 15px; font-weight: 500; }
.tagline { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
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
  color: var(--color-text-secondary);
}
.nav-item:hover { background: var(--color-bg-subtle); color: var(--color-text-primary); }
.nav-item.active { background: var(--color-bg-muted); color: var(--color-text-primary); font-weight: 500; }
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.user-chip { display: flex; align-items: center; gap: 10px; padding: 8px 12px; }
.avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-accent-bg); color: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 500; flex-shrink: 0;
}
.user-info { overflow: hidden; }
.user-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.logout-btn { width: 100%; justify-content: center; font-size: var(--text-sm); }
</style>