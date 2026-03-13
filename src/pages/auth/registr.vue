<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import textbox from '../../components/textbox.vue';

const router = useRouter();

// Используем reactive для удобства, как в твоей ошибке (formData)
const formData = reactive({
    name: '',
    email: '',
    password: ''
});

const handleRegister = async () => {
    try {
        const response = await axios.post('/api/auth/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password
        });
        
        console.log('Регистрация успешна!', response.data);
        
        // После регистрации обычно отправляем на логин
        router.push('/auth');
    } catch (error: any) {
        console.error('Ошибка регистрации:', error.response?.data || error.message);
    }
};
</script>

<template>
  <div class="registr-container">
    <textbox v-model="formData.name" placeholder="Имя" />
    <textbox v-model="formData.email" placeholder="Email" class="mt-4" />
    <textbox v-model="formData.password" placeholder="Пароль" type="password" class="mt-4" />
    
    <!-- ОШИБКА БЫЛА ТУТ: убедись, что вызывается handleRegister -->
    <button @click="handleRegister" class="mt-6">
      Зарегистрироваться
    </button>
  </div>
</template>
