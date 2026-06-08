<template>
    <div class="mb-6">
        <button @click="$router.back()"
            class="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 touch-target">
            &larr; Назад
        </button>
        <div class="flex flex-wrap justify-between items-start gap-3">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">{{ name }}</h1>
                <p class="text-xs text-gray-400 font-mono">ID: {{ deviceId }}</p>
                <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                    <span v-for="tag in tags" :key="tag"
                        class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {{ tag }}
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button @click="$emit('ping')" :disabled="statusLoading"
                    class="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 touch-target">
                    {{ statusLoading ? 'Проверка...' : 'Проверить связь' }}
                </button>
                <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                    {{ isConnected ? 'В сети' : 'Не в сети' }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    name: string
    deviceId: string
    isConnected: boolean
    statusLoading: boolean
    tags: string[]
}>()

defineEmits<{
    ping: []
}>()
</script>