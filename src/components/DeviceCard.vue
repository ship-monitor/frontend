<template>
    <Transition name="fade" mode="out-in">
        <RouterLink :to="route.sensorDetails(deviceId)" v-if="!error"
            class="rounded-lg border grow p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.98]"
            :class="{ 'bg-gray-200': !online?.value, 'bg-white': online?.value }">
            <div class="flex justify-between items-start mb-3">
                <div class="min-w-0 flex-1 mr-2">
                    <h3 class="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {{ device.name }}
                    </h3>
                    <p class="text-xs text-gray-400 font-mono truncate">
                        {{ device.id }}
                    </p>
                </div>
                <span :class="statusBadgeClass(online)">
                    {{ statusLabel(online) }}
                </span>
            </div>
            <!-- Температура -->
            <div class="text-center py-3">
                <div class="text-3xl sm:text-4xl font-bold mb-1" :class="tempColor(temp)">
                    {{
                        temp?.value
                            ? Number(temp.value).toFixed(1) + "°C"
                            : "--"
                    }}
                </div>
                <div class="text-xs text-gray-400" v-if="temp">
                    {{ new Date(temp.timestamp).toLocaleDateString("ru") }}
                    {{ new Date(temp.timestamp).toLocaleTimeString("ru") }}
                </div>
            </div>
            <!-- Организация и стабильность
        <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400 truncate mr-2">{{
                sensor.organizationName
            }}</span>
            <span v-if="sensor.pingHistory.length > 0" class="flex items-center gap-0.5 shrink-0">
                <span v-for="(ping, i) in sensor.pingHistory" :key="i" class="w-1.5 h-1.5 rounded-full"
                    :class="ping ? 'bg-green-400' : 'bg-red-400'" :title="ping ? 'В сети' : 'Не в сети'"></span>
            </span>
        </div> -->
        </RouterLink>
    </Transition>
</template>
<script setup lang="ts">
import { route, } from '@/constants/routes';
import { getDeviceById, getDeviceState, type Device, type DeviceStateRecord } from '@/data';
import { getLastTemperature, } from '@/utils/utils';

import { useAsyncState } from "@vueuse/core"

const props = defineProps<{ deviceId: string }>()

const { state: device, isReady, error } = useAsyncState(async () => await getDeviceById(props.deviceId), {} as Device)
const { state: online } = useAsyncState(async () => await getDeviceState<boolean>(props.deviceId, "online"), { value: false } as DeviceStateRecord<boolean>)
const { state: temp } = useAsyncState(async () => await getLastTemperature(props.deviceId), {} as DeviceStateRecord<number>)

const tempColor = (temp: DeviceStateRecord<number> | null) => {
    if (temp === null) return "text-gray-400";

    let min = -99;
    let max = 99;

    const t = temp.value;
    if (t < min || t > max) return "text-red-600";
    if (t < -20) return "text-blue-600";
    if (t < 0) return "text-cyan-500";
    if (t < 15) return "text-green-500";
    return "text-orange-500";
}
function statusLabel(record: DeviceStateRecord<boolean> | null) {
    if (!record) return "Не в сети";

    if (record.value) return "В сети";
    else return "Не в сети"
}
function statusBadgeClass(record: DeviceStateRecord<boolean> | null) {
    if (!record)
        return "px-2.5 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-600";

    if (record.value)
        return "px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800";
    else
        return "px-2.5 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800 border border-red-200";
}

</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
