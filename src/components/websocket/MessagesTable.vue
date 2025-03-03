<script setup lang="ts">
import { computed } from 'vue';
import * as PhosphorIcons from '@phosphor-icons/vue';
import type { WebSocketSession } from '../../services/WebSocketService';

// Props
const props = defineProps<{
  activeSession: WebSocketSession | null;
}>();

// Computed
const reversedMessages = computed(() => {
  if (!props.activeSession) return [];
  return [...props.activeSession.messages].reverse();
});

// Methods
const formatDate = (date: Date) => {
  return new Date(date).toLocaleTimeString();
};

// Syntax highlighting for JSON
const formatMessageContent = (content: string) => {
  try {
    // Try to parse as JSON for pretty display
    const parsed = JSON.parse(content);
    return syntaxHighlightJson(parsed);
  } catch {
    // If not JSON, return as is
    return content;
  }
};

// Function to add syntax highlighting to JSON
const syntaxHighlightJson = (json: any): string => {
  const jsonString = JSON.stringify(json, null, 2);
  return jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-secondary';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-primary font-bold';
        } else {
          cls = 'text-success';
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-warning';
      } else if (/null/.test(match)) {
        cls = 'text-error';
      } else if (/^-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?$/.test(match)) {
        cls = 'text-info';
      }
      return `<span class="${cls}">${match}</span>`;
    });
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl flex-1 overflow-hidden border border-accent/20" v-if="activeSession">
    <div class="card-body p-0 overflow-auto">
      <div class="p-4 border-b bg-base-200">
        <div class="flex justify-between items-center">
          <h2 class="card-title text-accent flex items-center gap-2">
            <PhosphorIcons.PhChartBar :size="24" weight="bold" />
            Messages - {{ activeSession.name }} ({{ activeSession.url }})
          </h2>
          <div class="badge badge-lg" :class="activeSession.status === 'connected' ? 'badge-success' : 'badge-error'">
            <div class="flex items-center gap-1">
              <PhosphorIcons.PhCircle :size="16" weight="fill" v-if="activeSession.status === 'connected'" class="animate-pulse" />
              <PhosphorIcons.PhProhibit :size="16" weight="fill" v-else />
              {{ activeSession.status === 'connected' ? 'Connected' : 'Disconnected' }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto h-full">
        <table class="table table-zebra">
          <thead class="sticky top-0 bg-base-200 z-10">
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="message in reversedMessages" :key="message.id" 
                :class="{ 
                  'bg-accent/5': message.type === 'system' && message.systemType !== 'error',
                  'bg-error/10': message.systemType === 'error'
                }">
              <td class="whitespace-nowrap">{{ formatDate(message.timestamp) }}</td>
              <td>
                <div class="badge badge-primary flex items-center gap-1" v-if="message.type === 'sent'">
                  <PhosphorIcons.PhArrowRight :size="14" weight="bold" />
                  Sent
                </div>
                <div class="badge badge-secondary flex items-center gap-1" v-else-if="message.type === 'received'">
                  <PhosphorIcons.PhArrowLeft :size="14" weight="bold" />
                  Received
                </div>
                <div class="badge badge-accent flex items-center gap-1" v-else-if="message.systemType === 'connection'">
                  <PhosphorIcons.PhPlugsConnected :size="14" weight="bold" />
                  Connected
                </div>
                <div class="badge badge-ghost flex items-center gap-1" v-else-if="message.systemType === 'disconnection'">
                  <PhosphorIcons.PhPower :size="14" weight="bold" />
                  Disconnected
                </div>
                <div class="badge badge-error flex items-center gap-1" v-else-if="message.systemType === 'error'">
                  <PhosphorIcons.PhWarning :size="14" weight="bold" />
                  Failed
                </div>
              </td>
              <td class="max-w-md overflow-x-auto">
                <pre class="text-xs rounded bg-base-300 p-2" v-if="message.type !== 'system'" v-html="formatMessageContent(message.content)"></pre>
                <span v-else :class="{ 'text-base-content/70 italic': message.systemType !== 'error', 'text-error font-medium': message.systemType === 'error' }">
                  {{ message.content }}
                </span>
              </td>
            </tr>
            <tr v-if="activeSession.messages.length === 0">
              <td colspan="3" class="text-center py-4">No messages yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <div class="card bg-base-100 shadow-xl flex-1 border border-accent/20" v-else>
    <div class="card-body flex items-center justify-center">
      <h2 class="text-xl text-center text-base-content/60 flex flex-col items-center gap-4">
        <PhosphorIcons.PhPlugs :size="64" weight="thin" class="opacity-30" />
        Select a session from the sidebar or create a new connection
      </h2>
    </div>
  </div>
</template>

<style scoped>
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
</style> 