import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute, ActivationEnd, NavigationEnd } from '@angular/router';

/**
 * Root component for the application. Sets up global router event logging
 * and provides the <router-outlet> for rendering routed views.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],  // Enables <router-outlet> in the template
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Application title displayed in the header or title bar
  title = 'budget-management';

  /**
   * @param router - Angular Router to listen for navigation events
   * @param activatedRoute - Provides information on the current active route
   */
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  /**
   * On init, subscribe to router events and active route URL changes
   * for debugging or analytics purposes.
   */
  ngOnInit(): void {
    // Log each router event (e.g., NavigationStart, NavigationEnd)
    this.router.events.subscribe(event => {
      console.log('Router Event:', event);
    });

    // Log changes to the activated route's URL segments
    this.activatedRoute.url.subscribe(urlSegments => {
      console.log('Active Route URL:', urlSegments.map(segment => segment.path).join('/'));
    });
  }
}
