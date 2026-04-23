<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const passwordRules = computed(() => ({
  length: password.value.length >= 8,
  uppercase: /[A-Z]/.test(password.value),
  lowercase: /[a-z]/.test(password.value),
  number: /[0-9]/.test(password.value),
  special: /[^A-Za-z0-9]/.test(password.value),
}))

const passwordStrength = computed(() => {
  const passed = Object.values(passwordRules.value).filter(Boolean).length
  if (passed <= 2) return { label: 'Weak', color: 'var(--color-expense)' }
  if (passed <= 3) return { label: 'Fair', color: '#d97706' }
  if (passed <= 4) return { label: 'Good', color: '#2563eb' }
  return { label: 'Strong', color: 'var(--color-income)' }
})

const passwordsMatch = computed(() =>
  confirmPassword.value === '' || password.value === confirmPassword.value
)

const isValid = computed(() =>
  Object.values(passwordRules.value).every(Boolean) &&
  password.value === confirmPassword.value &&
  displayName.value !== '' &&
  email.value !== ''
)

async function submit() {
  if (!isValid.value) return
  error.value = ''
  loading.value = true
  try {
    await authStore.register(displayName.value, email.value, password.value)
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
        <p>Create your account</p>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <div class="form-group">
        <label>Display name</label>
        <input v-model="displayName" type="text" placeholder="Jane Doe" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Min. 8 characters" />

        
        <div v-if="password.length > 0" class="strength-bar-wrap">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :style="{
                width: `${(Object.values(passwordRules).filter(Boolean).length / 5) * 100}%`,
                background: passwordStrength.color
              }"
            ></div>
          </div>
          <span class="strength-label" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.label }}
          </span>
        </div>

        
        <ul v-if="password.length > 0" class="rules-list">
          <li :class="{ passed: passwordRules.length }">At least 8 characters</li>
          <li :class="{ passed: passwordRules.uppercase }">One uppercase letter</li>
          <li :class="{ passed: passwordRules.lowercase }">One lowercase letter</li>
          <li :class="{ passed: passwordRules.number }">One number</li>
          <li :class="{ passed: passwordRules.special }">One special character</li>
        </ul>
      </div>

      <div class="form-group">
        <label>Confirm password</label>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          :class="{ 'input-error': !passwordsMatch }"
        />
        <span v-if="!passwordsMatch" class="field-error">Passwords do not match</span>
      </div>

      <button
        class="btn btn-primary full-width"
        :disabled="loading || !isValid"
        @click="submit"
      >
        {{ loading ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="auth-footer">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
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
  max-width: 420px;
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

.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--color-bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease, background 0.3s ease;
}
.strength-label { font-size: var(--text-xs); font-weight: 500; min-width: 40px; }

.rules-list {
  list-style: none;
  margin-top: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rules-list li {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding-left: 16px;
  position: relative;
}
.rules-list li::before {
  content: '✕';
  position: absolute;
  left: 0;
  color: var(--color-expense);
  font-size: 10px;
}
.rules-list li.passed { color: var(--color-income); }
.rules-list li.passed::before { content: '✓'; color: var(--color-income); }

.input-error { border-color: var(--color-expense) !important; }
.field-error { font-size: var(--text-xs); color: var(--color-expense); margin-top: 2px; }

.full-width { width: 100%; justify-content: center; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-footer { text-align: center; font-size: var(--text-sm); color: var(--color-text-muted); }
</style>