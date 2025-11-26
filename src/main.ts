import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations'

bootstrapApplication(AppComponent, {
  ...appConfig,           // ⬅️ Mantenés tu config actual
  providers: [
    ...(appConfig.providers || []),  // ⬅️ Mantenés los que ya tenías
    provideAnimations()              // ⬅️ Agregás las animaciones acá
  ]
}).catch((err) => console.error(err));
