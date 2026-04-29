<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { UserSettings } from '@/types/index'
import { useAuthStore } from '@/stores/auth'

const store = useSettingsStore()
const authStore = useAuthStore()

const form = ref<UserSettings>(JSON.parse(JSON.stringify(store.settings)))

const saveError = ref('')
const saved = ref(false)
const loading = ref(false)

const activeSection = ref<'profile' | 'preferences' | 'notifications' | 'danger'>('profile')

async function save() {
  saveError.value = ''
  loading.value = true
  try {
    if (activeSection.value === 'profile') {
      await store.saveProfile(form.value.displayName, form.value.email)
    } else if (activeSection.value === 'preferences') {
      await store.savePreferences(form.value.currency, form.value.dateFormat)
      store.updateSettings({ theme: form.value.theme })
    } else if (activeSection.value === 'notifications') {
      store.updateNotifications(form.value.notifications)
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (e: any) {
    saveError.value = e.response?.data?.error ?? 'Failed to save'
  } finally {
    loading.value = false
  }
}

function reset() {
  form.value = JSON.parse(JSON.stringify(store.settings))
}

const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'JPY', 'CHF']
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System default' },
]

const sections = [
  { key: 'profile', label: 'Profile' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'danger', label: 'Danger zone' },
] as const
</script>

<template>
  <div class="settings">

    <div class="settings-header">
      <h2>Settings</h2>
      <p>Manage your account and application preferences.</p>
    </div>

    <div class="settings-layout">

      
      <aside class="settings-nav card">
        <button
          v-for="s in sections"
          :key="s.key"
          :class="['nav-item', { active: activeSection === s.key, danger: s.key === 'danger' }]"
          @click="activeSection = s.key"
        >
          {{ s.label }}
        </button>
      </aside>

      
      <div class="settings-content">

        
        <div v-if="activeSection === 'profile'" class="section card">
          <div class="section-title">
            <h3>Profile</h3>
            <p>Update your personal information.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Display name</label>
              <input v-model="form.displayName" type="text" placeholder="Your name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="you@example.com" />
            </div>
          </div>

          <div class="avatar-row">
            <div class="avatar-large">
              {{ form.displayName.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="avatar-name">{{ form.displayName }}</p>
              <p class="text-muted text-sm">{{ form.email }}</p>
            </div>
          </div>
        </div>

        
        <div v-if="activeSection === 'preferences'" class="section card">
          <div class="section-title">
            <h3>Preferences</h3>
            <p>Customize how the app looks and formats data.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Currency</label>
              <select v-model="form.currency">
                <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
              </select>
              <span class="hint">Used across all amounts in the app.</span>
            </div>

            <div class="form-group">
              <label>Date format</label>
              <select v-model="form.dateFormat">
                <option v-for="d in dateFormats" :key="d" :value="d">{{ d }}</option>
              </select>
              <span class="hint">How dates are displayed throughout the app.</span>
            </div>
          </div>

          <div class="form-group">
            <label>Theme</label>
            <div class="theme-options">
              <label
                v-for="t in themes"
                :key="t.value"
                :class="['theme-option', { active: form.theme === t.value }]"
              >
                <input
                  type="radio"
                  :value="t.value"
                  v-model="form.theme"
                  style="display: none;"
                />
                <span class="theme-preview" :data-theme="t.value"></span>
                <span class="text-sm">{{ t.label }}</span>
              </label>
            </div>
          </div>
        </div>

        
        <div v-if="activeSection === 'notifications'" class="section card">
          <div class="section-title">
            <h3>Notifications</h3>
            <p>Choose what you want to be notified about.</p>
          </div>

          <div class="toggle-list">
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">Budget alerts</span>
                <span class="toggle-desc">Get notified when you're approaching or over a budget limit.</span>
              </div>
              <button
                :class="['toggle', { on: form.notifications.budgetAlerts }]"
                @click="form.notifications.budgetAlerts = !form.notifications.budgetAlerts"
              >
                <span class="toggle-thumb"></span>
              </button>
            </div>

            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">Weekly report</span>
                <span class="toggle-desc">Receive a weekly summary of your spending.</span>
              </div>
              <button
                :class="['toggle', { on: form.notifications.weeklyReport }]"
                @click="form.notifications.weeklyReport = !form.notifications.weeklyReport"
              >
                <span class="toggle-thumb"></span>
              </button>
            </div>

            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">Monthly report</span>
                <span class="toggle-desc">Receive a full monthly breakdown at the end of each month.</span>
              </div>
              <button
                :class="['toggle', { on: form.notifications.monthlyReport }]"
                @click="form.notifications.monthlyReport = !form.notifications.monthlyReport"
              >
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>

        
        <div v-if="activeSection === 'danger'" class="section card danger-card">
          <div class="section-title">
            <h3 class="text-expense">Danger zone</h3>
            <p>These actions are irreversible. Please be certain.</p>
          </div>

          <div class="danger-row">
            <div>
              <p class="danger-label">Clear all transactions</p>
              <p class="text-muted text-sm">Permanently delete every transaction in your account.</p>
            </div>
            <button class="btn btn-danger">Clear transactions</button>
          </div>

          <div class="danger-row">
            <div>
              <p class="danger-label">Reset budgets</p>
              <p class="text-muted text-sm">Remove all budgets you have set.</p>
            </div>
            <button class="btn btn-danger">Reset budgets</button>
          </div>

          <div class="danger-row">
            <div>
              <p class="danger-label">Delete account</p>
              <p class="text-muted text-sm">Permanently delete your account and all associated data.</p>
            </div>
            <button class="btn btn-danger">Delete account</button>
          </div>
        </div>

        
        <div class="save-bar">
          <transition name="fade">
            <span v-if="saved" class="saved-msg text-income text-sm">Changes saved.</span>
            <span v-if="saveError" class="saved-msg text-expense text-sm">{{ saveError }}</span>
          </transition>
          <button class="btn" @click="reset">Reset</button>
          <button class="btn btn-primary" :disabled="loading" @click="save">
            {{ loading ? 'Saving...' : 'Save changes' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.settings { display: flex; flex-direction: column; gap: var(--space-6); }

.settings-header p { color: var(--color-text-muted); font-size: var(--text-sm); margin-top: var(--space-1); }

.settings-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-5);
  align-items: start;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
}
.nav-item {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.nav-item:hover { background: var(--color-bg-subtle); }
.nav-item.active { background: var(--color-bg-muted); color: var(--color-text-primary); font-weight: 500; }
.nav-item.danger { color: var(--color-expense); }
.nav-item.danger:hover { background: var(--color-expense-bg); }
.nav-item.danger.active { background: var(--color-expense-bg); }

.settings-content { display: flex; flex-direction: column; gap: var(--space-4); }

.section { display: flex; flex-direction: column; gap: var(--space-5); }
.section-title { display: flex; flex-direction: column; gap: var(--space-1); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-4); }
.section-title p { font-size: var(--text-sm); color: var(--color-text-muted); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.form-group { display: flex; flex-direction: column; gap: var(--space-1); }
.hint { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }

.avatar-row { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); background: var(--color-bg-subtle); border-radius: var(--radius-lg); }
.avatar-large {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--color-accent-bg); color: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-lg); font-weight: 600; flex-shrink: 0;
}
.avatar-name { font-weight: 500; font-size: var(--text-base); }

.theme-options { display: flex; gap: var(--space-3); margin-top: var(--space-2); }
.theme-option {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  padding: var(--space-3); border-radius: var(--radius-lg);
  border: 1px solid var(--color-border); cursor: pointer;
  transition: border-color 0.15s;
  min-width: 80px;
}
.theme-option.active { border-color: var(--color-accent); }
.theme-preview {
  width: 48px; height: 32px; border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.theme-preview[data-theme="light"] { background: #ffffff; }
.theme-preview[data-theme="dark"] { background: #1a1a1a; }
.theme-preview[data-theme="system"] { background: linear-gradient(135deg, #ffffff 50%, #1a1a1a 50%); }

.toggle-list { display: flex; flex-direction: column; gap: 0; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-6); padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}
.toggle-row:last-child { border-bottom: none; }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-label { font-size: var(--text-sm); font-weight: 500; }
.toggle-desc { font-size: var(--text-xs); color: var(--color-text-muted); }

.toggle {
  width: 40px; height: 22px; border-radius: var(--radius-full);
  background: var(--color-bg-muted); border: 1px solid var(--color-border-strong);
  position: relative; cursor: pointer; flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
}
.toggle.on { background: var(--color-income); border-color: var(--color-income); }
.toggle-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.toggle.on .toggle-thumb { transform: translateX(18px); }

.danger-card { border-color: var(--color-expense-bg); }
.danger-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-6); padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}
.danger-row:last-child { border-bottom: none; }
.danger-label { font-size: var(--text-sm); font-weight: 500; margin-bottom: 2px; }

.save-bar {
  display: flex; align-items: center; justify-content: flex-end;
  gap: var(--space-3);
}
.saved-msg { margin-right: auto; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>