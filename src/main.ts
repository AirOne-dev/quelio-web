import { createApp } from 'vue'
import './styles/main.css'
import App from './App.vue'
import moment from 'moment'

// Import et configure la locale française
import 'moment/dist/locale/fr'
moment.locale('fr')

createApp(App).mount('#app')
