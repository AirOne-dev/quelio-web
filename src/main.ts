import { createApp } from 'vue'
import './styles/main.css'
import App from './App.vue'
import moment from 'moment'
import 'moment/dist/locale/fr'
import { useTheme } from './composables/useTheme'

moment.locale('fr')

useTheme().loadTheme().then(() => {
  createApp(App).mount('#app')
});
