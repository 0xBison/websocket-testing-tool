<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as PhosphorIcons from '@phosphor-icons/vue';
import WebSocketSidebar from '../websocket/WebSocketSidebar.vue';

// Props
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  activeSessionId: string | null;
}>();

// Emits
const emit = defineEmits<{
  'toggle-sidebar': [];
  'set-active-session': [sessionId: string];
  'disconnect': [sessionId: string];
}>();

// State
const isSidebarCollapsed = ref(false);
const isLargeScreen = ref(false);

// Methods
const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1024;
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  emit('toggle-sidebar');
};

const setActiveSession = (sessionId: string) => {
  emit('set-active-session', sessionId);
};

const disconnect = (sessionId: string) => {
  emit('disconnect', sessionId);
};

// Lifecycle hooks
onMounted(() => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});

// Computed properties
const sidebarWidth = computed(() => isSidebarCollapsed.value ? '5rem' : '24rem');
const contentPadding = computed(() => {
  if (isLargeScreen.value) {
    return isSidebarCollapsed.value ? '6rem' : '25rem'; // Width + 1rem padding
  }
  return '1rem';
});
</script>

<template>
  <div class="drawer lg:drawer-open" data-theme="fantasy">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" :checked="!isSidebarCollapsed" />
    
    <!-- Page content -->
    <div class="drawer-content flex flex-col bg-gradient-to-br from-base-100 to-base-300 transition-all duration-300"
         :style="{ 'padding': '1rem', 'padding-left': contentPadding }">
      <div class="w-full navbar bg-primary text-primary-content rounded-box mb-4 shadow-lg">
        <div class="flex-none lg:hidden">
          <label for="my-drawer" class="btn btn-square btn-ghost drawer-button">
            <PhosphorIcons.PhListDashes :size="24" weight="bold" />
          </label>
        </div>
        <div class="flex-none hidden lg:block">
          <button @click="toggleSidebar" class="btn btn-square btn-ghost">
            <PhosphorIcons.PhListDashes :size="24" weight="bold" />
          </button>
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <PhosphorIcons.PhPlugsConnected :size="24" weight="bold" />
            WebSocket Testing Tool
          </h1>
        </div>
      </div>
      
      <!-- Main content area -->
      <slot></slot>
    </div>
    
    <!-- Sidebar -->
    <div class="drawer-side z-30">
      <label for="my-drawer" class="drawer-overlay"></label>
      <WebSocketSidebar 
        :isSidebarCollapsed="isSidebarCollapsed"
        :activeSessionId="activeSessionId"
        :sidebarWidth="sidebarWidth"
        @toggle-sidebar="toggleSidebar"
        @set-active-session="setActiveSession"
        @disconnect="disconnect"
      />
    </div>
  </div>
</template>

<style scoped>
/* Transitions */
.drawer-content {
  transition: padding-left 0.3s ease, background 0.3s ease;
}

/* Fix sidebar and content layout */
.drawer.lg\:drawer-open .drawer-content {
  margin-left: 0 !important;
  width: 100%;
  box-sizing: border-box;
}

/* Fix drawer behavior on large screens */
@media (min-width: 1024px) {
  .drawer.lg\:drawer-open .drawer-toggle {
    display: none;
  }
  
  .drawer.lg\:drawer-open .drawer-side {
    display: block;
    visibility: visible;
    pointer-events: auto;
    position: fixed;
    width: auto !important;
  }
  
  .drawer.lg\:drawer-open .drawer-overlay {
    display: none;
  }
}
</style> 