import { createApp } from 'vue'
import './styles/main.css'
import './styles/scrollbar.css'
import App from './App.vue'
import moment from 'moment'
import 'moment/locale/fr'

moment.locale('fr')

createApp(App).mount('#app')
