import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';

import App from './App';

// The site this app mirrors is Hebrew-first (dir="rtl"). Forcing RTL here mirrors
// that layout direction (row flex, text alignment) across the native app.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
