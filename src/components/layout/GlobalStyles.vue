<script setup lang="ts">
// This component contains only global styles that will be used throughout the application
</script>

<template>
  <!-- This component has no template, it only provides styles -->
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

/* Drawer specific styles */
.drawer-side aside {
  transition: width 0.3s ease, background 0.3s ease;
}
</style> 