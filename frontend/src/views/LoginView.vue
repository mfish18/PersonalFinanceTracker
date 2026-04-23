<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.error ?? 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <h1>Fintrack</h1>
        <p>Sign in to your account</p>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" @keyup.enter="submit" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="submit" />
      </div>

      <button class="btn btn-primary full-width" :disabled="loading" @click="submit">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>

      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/register">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
}
.auth-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.auth-header { text-align: center; margin-bottom: var(--space-2); }
.auth-header p { color: var(--color-text-muted); font-size: var(--text-sm); margin-top: var(--space-1); }
.error-banner {
  background: var(--color-expense-bg);
  color: var(--color-expense);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}
.full-width { width: 100%; justify-content: center; }
.auth-footer { text-align: center; font-size: var(--text-sm); color: var(--color-text-muted); }
</style>