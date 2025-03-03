<script setup lang="ts">
import { ref, computed } from 'vue';
import * as PhosphorIcons from '@phosphor-icons/vue';
import WebSocketService from '../../services/WebSocketService';

// Props
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  isSidebarCollapsed: boolean;
  activeSessionId: string | null;
  sidebarWidth: string;
}>();

// Emits
const emit = defineEmits<{
  'toggle-sidebar': [];
  'set-active-session': [sessionId: string];
  'disconnect': [sessionId: string];
}>();

// State
const sidebarSearchTerm = ref('');
const isEditingSessionId = ref<string | null>(null);
const editSessionName = ref('');
const hoveredSessionId = ref<string | null>(null);

// Computed
const sessions = computed(() => WebSocketService.getSessions());
const filteredSessions = computed(() => {
  const allSessions = WebSocketService.getSessions();
  if (!sidebarSearchTerm.value.trim()) return allSessions;
  
  const searchTerm = sidebarSearchTerm.value.toLowerCase();
  const filteredEntries = Object.entries(allSessions).filter(([_, session]) => {
    return session.name.toLowerCase().includes(searchTerm) || 
           session.url.toLowerCase().includes(searchTerm);
  });
  
  return Object.fromEntries(filteredEntries);
});

// Methods
const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const setActiveSession = (sessionId: string) => {
  emit('set-active-session', sessionId);
};

const disconnect = (sessionId: string) => {
  emit('disconnect', sessionId);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleTimeString();
};

const getLastMessageTime = (sessionId: string) => {
  const session = WebSocketService.getSession(sessionId);
  if (!session || session.messages.length === 0) {
    return null;
  }
  
  // Get most recent message
  const messages = [...session.messages].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return formatDate(messages[0].timestamp);
};

const startEditSessionName = (sessionId: string, currentName: string) => {
  isEditingSessionId.value = sessionId;
  editSessionName.value = currentName;
};

const saveSessionName = () => {
  if (isEditingSessionId.value && editSessionName.value.trim()) {
    WebSocketService.updateSessionName(isEditingSessionId.value, editSessionName.value.trim());
    isEditingSessionId.value = null;
    editSessionName.value = '';
  }
};

const cancelEditSessionName = () => {
  isEditingSessionId.value = null;
  editSessionName.value = '';
};

const setHoveredSession = (sessionId: string | null) => {
  hoveredSessionId.value = sessionId;
};
</script>

<template>
  <aside class="bg-gradient-to-b from-base-200 to-base-300 h-full transition-all duration-300 fixed top-0 bottom-0" 
         :style="{ width: sidebarWidth }">
    <div class="p-4 border-b bg-base-300/50 flex justify-between items-center">
      <h2 class="text-xl font-bold text-primary flex items-center gap-2" v-if="!isSidebarCollapsed">
        <PhosphorIcons.PhBrowsers :size="24" weight="bold" />
        Sessions
      </h2>
      <button @click="toggleSidebar" class="btn btn-sm btn-ghost">
        <PhosphorIcons.PhArrowLeft :size="20" weight="bold" v-if="!isSidebarCollapsed" />
        <PhosphorIcons.PhArrowRight :size="20" weight="bold" v-else />
      </button>
    </div>
    
    <!-- Search input for sidebar -->
    <div class="p-4 border-b bg-base-300/30" v-if="!isSidebarCollapsed">
      <div class="relative">
        <input 
          v-model="sidebarSearchTerm" 
          type="text" 
          placeholder="Search connections..." 
          class="input input-bordered input-sm w-full pr-10 focus:outline-none" 
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <PhosphorIcons.PhMagnifyingGlass :size="16" weight="bold" class="text-base-content/60" />
        </div>
      </div>
    </div>
    
    <ul class="menu p-4 w-full gap-2" v-if="!isSidebarCollapsed">
      <li v-for="(session, id) in filteredSessions" :key="id" :class="{ 'bordered': activeSessionId === id }">
        <a @click="setActiveSession(id)" :class="{ 'active bg-primary/10 text-primary': activeSessionId === id }" class="rounded-lg transition-all hover:bg-base-100">
          <div class="flex flex-col w-full">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <div class="badge badge-sm" :class="session.status === 'connected' ? 'badge-success animate-pulse' : 'badge-error'"></div>
                <!-- Display session name with edit functionality -->
                <div v-if="isEditingSessionId !== id" class="flex items-center gap-1">
                  <span class="font-medium">{{ session.name }}</span>
                  <button 
                    @click.stop="startEditSessionName(id, session.name)" 
                    class="btn btn-xs btn-ghost btn-circle"
                  >
                    <PhosphorIcons.PhPencil :size="14" weight="bold" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-1">
                  <input 
                    v-model="editSessionName" 
                    @click.stop 
                    @keyup.enter="saveSessionName" 
                    @keyup.esc="cancelEditSessionName"
                    type="text" 
                    class="input input-xs input-bordered w-32 focus:outline-none" 
                  />
                  <button 
                    @click.stop="saveSessionName" 
                    class="btn btn-xs btn-ghost btn-circle text-success"
                  >
                    <PhosphorIcons.PhCheck :size="14" weight="bold" />
                  </button>
                  <button 
                    @click.stop="cancelEditSessionName" 
                    class="btn btn-xs btn-ghost btn-circle text-error"
                  >
                    <PhosphorIcons.PhX :size="14" weight="bold" />
                  </button>
                </div>
              </div>
              <button 
                v-if="session.status === 'connected'" 
                @click.stop="disconnect(session.id)" 
                class="btn btn-xs btn-error hover:brightness-110 transition-all"
              >
                <PhosphorIcons.PhPower :size="14" weight="bold" class="mr-1" />
                Disconnect
              </button>
            </div>
            <div class="text-xs opacity-70 mt-1 truncate">
              {{ session.url }}
            </div>
            <div class="text-xs opacity-70">
              Started: {{ formatDate(session.createdAt) }}
            </div>
            <div class="text-xs opacity-70" v-if="getLastMessageTime(id)">
              Last activity: {{ getLastMessageTime(id) }}
            </div>
          </div>
        </a>
      </li>
      <li v-if="Object.keys(filteredSessions).length === 0 && sidebarSearchTerm">
        <div class="p-4 text-center text-base-content/60 bg-base-100 rounded-lg">
          <div class="flex justify-center mb-2">
            <PhosphorIcons.PhMagnifyingGlass :size="24" weight="thin" class="opacity-50" />
          </div>
          No matching connections found
        </div>
      </li>
      <li v-else-if="Object.keys(sessions).length === 0">
        <div class="p-4 text-center text-base-content/60 bg-base-100 rounded-lg">
          <div class="flex justify-center mb-2">
            <PhosphorIcons.PhBrowsers :size="24" weight="thin" class="opacity-50" />
          </div>
          No connections yet
        </div>
      </li>
    </ul>
    
    <!-- Collapsed sidebar with just icons and tooltips -->
    <div class="flex flex-col items-center p-2 gap-2" v-else>
      <div 
        v-for="(session, id) in sessions" 
        :key="id" 
        @click="setActiveSession(id)"
        @mouseenter="setHoveredSession(id)"
        @mouseleave="setHoveredSession(null)"
        class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-base-100 relative"
        :class="{ 'bg-primary/20': activeSessionId === id }"
      >
        <!-- Connection status indicator -->
        <div 
          class="w-3 h-3 rounded-full"
          :class="session.status === 'connected' ? 'bg-success animate-pulse' : 'bg-error'"
        ></div>
        
        <!-- Tooltip on hover -->
        <div 
          v-if="hoveredSessionId === id" 
          class="absolute left-14 z-50 card card-compact w-60 bg-base-100 shadow-xl"
        >
          <div class="card-body p-3">
            <h3 class="card-title text-sm flex items-center gap-1.5">
              <div class="badge badge-xs" :class="session.status === 'connected' ? 'badge-success' : 'badge-error'"></div>
              {{ session.name }}
            </h3>
            <div class="text-xs opacity-70 truncate">{{ session.url }}</div>
            <div class="text-xs opacity-70 mt-1">
              Started: {{ formatDate(session.createdAt) }}
            </div>
            <div class="text-xs opacity-70" v-if="getLastMessageTime(id)">
              Last activity: {{ getLastMessageTime(id) }}
            </div>
            <div class="text-xs opacity-70" v-if="session.status === 'connected'">
              Status: <span class="text-success font-medium">Connected</span>
            </div>
            <div class="text-xs opacity-70" v-else>
              Status: <span class="text-error font-medium">Disconnected</span>
            </div>
            <div class="flex justify-between items-center mt-1" v-if="session.status === 'connected'">
              <button @click.stop="disconnect(id)" class="btn btn-xs btn-error btn-outline">
                <PhosphorIcons.PhPower :size="12" weight="bold" class="mr-1" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="Object.keys(sessions).length === 0" class="p-2 text-center">
        <PhosphorIcons.PhMagnifyingGlass :size="20" weight="thin" class="opacity-50" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* The tooltip wrapper */
.tooltip-wrapper {
  position: relative;
}

/* Add animations for tooltip */
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.absolute.left-14 {
  animation: fadeIn 0.2s ease-out;
}
</style> 