<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import WebSocketService from './services/WebSocketService';

// Import components
import AppLayout from './components/layout/AppLayout.vue';
import GlobalStyles from './components/layout/GlobalStyles.vue';
import ConnectionForm from './components/websocket/ConnectionForm.vue';
import MessageSender from './components/websocket/MessageSender.vue';
import MessagesTable from './components/websocket/MessagesTable.vue';

// Connection URL and name
const connectionName = ref('');

// Sidebar control
const isSidebarCollapsed = ref(false);

// Error handling
const error = ref<string | null>(null);
const showError = ref(false);

// Add window resize handling for responsive layout
const isLargeScreen = ref(false);

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1024;
};

onMounted(() => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});

const activeSession = computed(() => WebSocketService.getActiveSession());
const activeSessionId = computed(() => WebSocketService.activeSessionId.value);

// Connect to a WebSocket
const connect = async (url: string, name: string) => {
  try {
    error.value = null;
    showError.value = false;
    
    // Create a new session
    const sessionId = WebSocketService.createSession(url, name);
    
    // Connect to the WebSocket and set as active
    await WebSocketService.connect(sessionId);
    WebSocketService.setActiveSession(sessionId);
    
    // Reset form
    connectionName.value = '';
  } catch (err) {
    // Don't show error in the top alert, it will be shown in the messages table
    console.error("Connection error:", err);
  }
};

// Disconnect from a WebSocket
const disconnect = (sessionId: string) => {
  WebSocketService.disconnect(sessionId);
};

// Send a message
const sendMessage = (message: string) => {
  if (!activeSessionId.value) return;
  
  WebSocketService.sendMessage(activeSessionId.value, message);
};

// Set the active session
const setActiveSession = (sessionId: string) => {
  WebSocketService.setActiveSession(sessionId);
  if (isSidebarCollapsed.value) {
    isSidebarCollapsed.value = false;
  }
};

// Toggle sidebar event handler (not used directly but required by the component interface)
const handleToggleSidebar = () => {
  // This is handled internally by the AppLayout component
  // We just need to provide the handler for the event
};
</script>

<template>
  <!-- Global styles -->
  <GlobalStyles />
  
  <!-- Main application layout -->
  <AppLayout 
    :activeSessionId="activeSessionId"
    @toggle-sidebar="handleToggleSidebar"
    @set-active-session="setActiveSession"
    @disconnect="disconnect"
  >
    <!-- Connection form -->
    <ConnectionForm @connect="connect" />
    
    <!-- Message sender (only when there's an active session) -->
    <MessageSender 
      v-if="activeSession"
      :isDisabled="!activeSession || activeSession.status !== 'connected'"
      @send-message="sendMessage"
    />
    
    <!-- Messages table -->
    <MessagesTable :activeSession="activeSession" />
  </AppLayout>
</template>

<style>
/* Custom scrollbar for code blocks */
pre::-webkit-scrollbar {
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Animation for active connection */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transitions */
.drawer-content {
  transition: padding-left 0.3s ease, background 0.3s ease;
}

.drawer-side aside {
  transition: width 0.3s ease, background 0.3s ease;
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
