import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
import { setupSEO } from './plugins/seo'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(head)

// Configurer le SEO global
setupSEO(router)

app.mount('#app')
