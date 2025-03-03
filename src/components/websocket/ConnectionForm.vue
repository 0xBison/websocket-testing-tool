<script setup lang="ts">
import { ref } from 'vue';
import * as PhosphorIcons from '@phosphor-icons/vue';

// State
const connectionUrl = ref('wss://echo.websocket.org/');
const connectionName = ref('');

// Emits
const emit = defineEmits<{
  'connect': [url: string, name: string];
}>();

// Methods
const connect = async () => {
  emit('connect', connectionUrl.value, connectionName.value);
  // Reset the name field after connection
  connectionName.value = '';
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl mb-4 border border-primary/20">
    <div class="card-body">
      <h2 class="card-title text-primary flex items-center gap-2">
        <PhosphorIcons.PhPlus :size="24" weight="bold" />
        Create New Connection
      </h2>
      
      <div class="flex flex-col gap-3">
        <!-- Responsive layout: side-by-side on desktop, stacked on mobile -->
        <div class="flex flex-col md:flex-row gap-3">
          <!-- WebSocket URL field first -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">WebSocket URL</span>
            </label>
            <div class="join w-full">
              <input v-model="connectionUrl" type="text" placeholder="e.g., wss://echo.websocket.org/" class="input input-bordered input-primary join-item flex-1 focus:outline-none" />
              <button @click="connect" class="btn btn-primary join-item hover:brightness-110 transition-all">
                <PhosphorIcons.PhPlugsConnected :size="20" weight="bold" class="mr-2" />
                Connect
              </button>
            </div>
          </div>
          
          <!-- Connection Name field second (since it's optional) -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Connection Name (optional)</span>
            </label>
            <input v-model="connectionName" type="text" placeholder="Enter a name" class="input input-bordered input-primary w-full focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 