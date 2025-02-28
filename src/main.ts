import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
import { setupSEO } from './plugins/seo'
import { FontAwesomeIcon } from './plugins/fontawesome'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(head)

// Enregistrement du composant FontAwesomeIcon globalement
app.component('FontAwesomeIcon', FontAwesomeIcon)

// Configurer le SEO global
setupSEO(router)

app.mount('#app')
