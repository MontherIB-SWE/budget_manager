// Entry point to bootstrap an Angular standalone application
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }        from '@angular/router';
import { provideHttpClient }    from '@angular/common/http';
import { importProvidersFrom }  from '@angular/core';
import { provideAnimations }    from '@angular/platform-browser/animations';
import { ToastrModule }         from 'ngx-toastr';
import { FormsModule }          from '@angular/forms';
import { NgxSpinnerModule }     from 'ngx-spinner';

import { AppComponent } from './app/app.component';   // Root component of the app
import { routes }       from './app/app.routes';      // Application route definitions

/**
 * Bootstraps the Angular application using standalone APIs.
 * Registers core providers for routing, HTTP, forms, UI animations,
 * toast notifications, and a global loading spinner.
 */
bootstrapApplication(AppComponent, {
  providers: [
    // 1. Router providers for handling in-app navigation
    provideRouter(routes),

    // 2. HTTP client provider for all HttpClient injections
    provideHttpClient(),

    // 3. Import FormsModule providers for template-driven forms
    importProvidersFrom(FormsModule),

    // 4. Global loading spinner configuration
    importProvidersFrom(
      NgxSpinnerModule.forRoot({
        type       : 'ball-spin-clockwise-fade', // spinner style preset
      })
    ),

    // 5. Browser animations are required by ngx-toastr
    provideAnimations(),

    // 6. Global toast notification configuration
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass : 'toast-bottom-right', // location on screen
        timeOut       : 3000,                 // auto-dismiss timeout (ms)
        closeButton   : true,                 // show a close button
        progressBar   : true                  // show a progress bar
      })
    )
  ]
}).catch(err => console.error('Bootstrap error:', err));
