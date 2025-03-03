<script setup lang="ts">
import { ref } from 'vue';
import * as PhosphorIcons from '@phosphor-icons/vue';

// Props
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  isDisabled: boolean;
}>();

// State
const messageToSend = ref('');

// Emits
const emit = defineEmits<{
  'send-message': [message: string];
}>();

// Methods
const sendMessage = () => {
  if (!messageToSend.value) return;
  
  emit('send-message', messageToSend.value);
  messageToSend.value = '';
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl mb-4 border border-secondary/20">
    <div class="card-body">
      <h2 class="card-title text-secondary flex items-center gap-2">
        <PhosphorIcons.PhChatText :size="24" weight="bold" />
        Send Message
      </h2>
      
      <div class="join w-full">
        <input 
          v-model="messageToSend" 
          type="text" 
          placeholder="Enter message to send" 
          class="input input-bordered input-secondary join-item flex-1 focus:outline-none" 
          :disabled="isDisabled"
          @keyup.enter="sendMessage"
        />
        <button 
          @click="sendMessage" 
          class="btn btn-secondary join-item hover:brightness-110 transition-all" 
          :disabled="isDisabled"
        >
          <PhosphorIcons.PhPaperPlaneTilt :size="20" weight="bold" class="mr-2" />
          Send
        </button>
      </div>
    </div>
  </div>
</template> 