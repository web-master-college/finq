<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionStatus from '../components/ActionStatus.vue'
import { useProfilesStore } from '../stores/profiles'

type ActionFeedback = 'idle' | 'loading' | 'success' | 'error'

const route = useRoute()
const router = useRouter()
const store = useProfilesStore()

const profileId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const origin = computed<'fetch' | 'history' | null>(() => {
  const from = route.query.from
  return from === 'fetch' || from === 'history' ? from : null
})

const status = ref<'loading' | 'ready' | 'missing' | 'error'>('loading')
const actionStatus = ref<ActionFeedback>('idle')
const actionMessage = ref('')
const pending = ref<'save' | 'update' | 'delete' | null>(null)
let actionTimer: ReturnType<typeof setTimeout> | undefined
const firstName = ref('')
const lastName = ref('')

const profile = computed(() => (profileId.value ? store.profileById(profileId.value) : undefined))
const saved = computed(() => (profileId.value ? store.isProfileSaved(profileId.value) : false))

let loadGeneration = 0

function clearActionTimer(): void {
  if (actionTimer === undefined) {
    return
  }

  clearTimeout(actionTimer)
  actionTimer = undefined
}

function resetActionFeedback(): void {
  clearActionTimer()
  actionStatus.value = 'idle'
  actionMessage.value = ''
}

function showActionSuccess(message: string): void {
  clearActionTimer()
  actionStatus.value = 'success'
  actionMessage.value = message
  actionTimer = setTimeout(() => {
    actionTimer = undefined
    actionStatus.value = 'idle'
    actionMessage.value = ''
  }, 2500)
}

onUnmounted(clearActionTimer)

async function loadProfile(): Promise<void> {
  const id = profileId.value
  const generation = ++loadGeneration
  resetActionFeedback()

  if (!id) {
    status.value = 'missing'
    return
  }

  if (store.isProfileSaved(id)) {
    status.value = 'ready'
    return
  }

  status.value = 'loading'
  const result = await store.loadSavedProfile(id)
  if (generation !== loadGeneration) {
    return
  }

  status.value = result
}

watch(profileId, () => {
  void loadProfile()
}, { immediate: true })

watch(
  profile,
  (value) => {
    if (!value || value.id !== profileId.value) {
      return
    }

    firstName.value = value.firstName
    lastName.value = value.lastName
  },
  { immediate: true },
)

function namesAreValid(): boolean {
  const first = firstName.value.trim()
  const last = lastName.value.trim()
  return first.length > 0 && first.length <= 100 && last.length > 0 && last.length <= 100
}

function backTarget(): string {
  if (origin.value === 'fetch') {
    return '/fetch'
  }
  if (origin.value === 'history') {
    return '/history'
  }
  return saved.value ? '/history' : '/fetch'
}

function goBack(): void {
  void router.push(backTarget())
}

async function save(): Promise<void> {
  const current = profile.value
  if (pending.value || saved.value || !current) {
    return
  }
  if (!namesAreValid()) {
    clearActionTimer()
    actionStatus.value = 'error'
    actionMessage.value = 'יש להזין שם פרטי ושם משפחה.'
    return
  }

  clearActionTimer()
  pending.value = 'save'
  actionStatus.value = 'loading'
  actionMessage.value = 'שומר…'
  try {
    await store.saveProfile({
      ...current,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
    })
    showActionSuccess('הפרופיל נשמר בהצלחה')
  } catch {
    actionStatus.value = 'error'
    actionMessage.value = 'לא ניתן לשמור את הפרופיל.'
  } finally {
    pending.value = null
  }
}

async function updateName(): Promise<void> {
  const current = profile.value
  if (pending.value || !current) {
    return
  }
  if (!namesAreValid()) {
    clearActionTimer()
    actionStatus.value = 'error'
    actionMessage.value = 'יש להזין שם פרטי ושם משפחה.'
    return
  }

  clearActionTimer()
  pending.value = 'update'
  actionStatus.value = 'loading'
  actionMessage.value = 'מעדכן…'
  try {
    await store.updateProfileName(current.id, firstName.value.trim(), lastName.value.trim())
    showActionSuccess('הפרופיל עודכן בהצלחה')
  } catch {
    actionStatus.value = 'error'
    actionMessage.value = 'לא ניתן לעדכן את השם.'
  } finally {
    pending.value = null
  }
}

async function remove(): Promise<void> {
  const current = profile.value
  if (pending.value || !saved.value || !current) {
    return
  }

  if (!window.confirm('האם למחוק את הפרופיל?')) return

  clearActionTimer()
  pending.value = 'delete'
  actionStatus.value = 'loading'
  actionMessage.value = 'מוחק…'
  const target = backTarget()
  try {
    await store.deleteSavedProfile(current.id)
    if (profileId.value === current.id) {
      await router.replace(target)
    }
  } catch {
    if (profileId.value === current.id) {
      actionStatus.value = 'error'
      actionMessage.value = 'לא ניתן למחוק את הפרופיל.'
    }
  } finally {
    pending.value = null
  }
}
</script>

<template>
  <section v-if="status === 'loading'" dir="rtl" lang="he" class="grid gap-3">
    <p class="m-0" role="status">טוען פרופיל…</p>
  </section>

  <section v-else-if="status === 'error'" dir="rtl" lang="he" class="grid gap-3" role="alert">
    <p class="m-0">לא ניתן לטעון את הפרופיל.</p>
    <button
      type="button"
      class="w-fit rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3"
      @click="loadProfile()"
    >
      נסה שוב
    </button>
  </section>

  <section v-else-if="status === 'missing' || !profile" dir="rtl" lang="he" class="grid gap-3">
    <p class="m-0">הפרופיל אינו זמין.</p>
    <button
      type="button"
      class="w-fit rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3"
      @click="goBack"
    >
      חזרה
    </button>
  </section>

  <article
    v-else
    dir="rtl"
    lang="he"
    class="grid max-w-xl gap-4 rounded-lg border border-[#d5dde6] bg-white py-4 ps-4 pe-4"
  >
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3"
        :disabled="pending !== null"
        @click="goBack"
      >
        חזרה
      </button>
      <h2 class="m-0 text-xl [font-weight:650]">פרופיל</h2>
    </div>

    <img
      :src="profile.largeImageUrl"
      :alt="`${profile.title} ${profile.firstName} ${profile.lastName}`"
      width="128"
      height="128"
      class="size-32 rounded-lg object-cover"
    />

    <dl class="m-0 grid gap-3">
      <div class="grid gap-1">
        <dt class="text-sm text-[#5c6b7a]">מגדר</dt>
        <dd class="m-0 w-full text-right" dir="ltr" lang="en">{{ profile.gender }}</dd>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <label class="grid gap-1">
          <span class="text-sm text-[#5c6b7a]">שם פרטי</span>
          <input
            v-model="firstName"
            dir="ltr"
            lang="en"
            autocomplete="given-name"
            class="w-full rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3 text-right"
            :disabled="pending !== null"
          />
        </label>
        <label class="grid gap-1">
          <span class="text-sm text-[#5c6b7a]">שם משפחה</span>
          <input
            v-model="lastName"
            dir="ltr"
            lang="en"
            autocomplete="family-name"
            class="w-full rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3 text-right"
            :disabled="pending !== null"
          />
        </label>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <div class="grid gap-1">
          <dt class="text-sm text-[#5c6b7a]">גיל</dt>
          <dd class="m-0 w-full text-right" dir="ltr" lang="en">{{ profile.age }}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-sm text-[#5c6b7a]">שנת לידה</dt>
          <dd class="m-0 w-full text-right" dir="ltr" lang="en">{{ profile.birthYear }}</dd>
        </div>
      </div>

      <div class="grid gap-1">
        <dt class="text-sm text-[#5c6b7a]">רחוב</dt>
        <dd class="m-0 w-full text-right" dir="ltr" lang="en">
          {{ profile.streetNumber }} {{ profile.streetName }}
        </dd>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        <div class="grid gap-1">
          <dt class="text-sm text-[#5c6b7a]">עיר</dt>
          <dd class="m-0 w-full text-right" dir="ltr" lang="en">{{ profile.city }}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-sm text-[#5c6b7a]">מחוז</dt>
          <dd class="m-0 w-full text-right" dir="ltr" lang="en">{{ profile.state }}</dd>
        </div>
      </div>

      <div class="grid gap-1">
        <dt class="text-sm text-[#5c6b7a]">אימייל</dt>
        <dd class="m-0 w-full break-all text-right" dir="ltr" lang="en">{{ profile.email }}</dd>
      </div>
      <div class="grid gap-1">
        <dt class="text-sm text-[#5c6b7a]">טלפון</dt>
        <dd class="m-0 w-full text-right" dir="ltr" lang="en">{{ profile.phone }}</dd>
      </div>
    </dl>

    <ActionStatus :status="actionStatus" :message="actionMessage" />
    <div class="flex flex-wrap gap-3">
      <button
        v-if="!saved"
        type="button"
        class="min-w-36 rounded-lg bg-[#16324f] py-2 ps-4 pe-4 text-center text-white disabled:opacity-60"
        :disabled="pending !== null"
        @click="save"
      >
        שמור
      </button>
      <button
        v-else
        type="button"
        class="min-w-36 rounded-lg border border-[#e7c5c0] bg-white py-2 ps-4 pe-4 text-center text-[#c0392b] disabled:opacity-60"
        :disabled="pending !== null"
        @click="remove"
      >
        מחק
      </button>
      <button
        type="button"
        class="min-w-36 rounded-lg border border-[#d5dde6] bg-white py-2 ps-4 pe-4 text-center disabled:opacity-60"
        :disabled="pending !== null"
        @click="updateName"
      >
        עדכן
      </button>
    </div>
  </article>
</template>
