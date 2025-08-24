import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * HeaderComponent renders the application header including
 * navigation links. It toggles visibility of the nav menu
 * based on the `showNav` flag.
 */
@Component({
  selector   : 'app-header',
  standalone : true,
  imports    : [RouterModule], // Enables usage of <a routerLink> within the template
  templateUrl: './header.component.html',
  styleUrls  : ['./header.component.css']
})
export class HeaderComponent {
  /**
   * Controls whether the navigation menu is shown.
   * Can be toggled to collapse/expand the nav links.
   */
  showNav = false;

  /**
   * Toggles the visibility of the navigation menu.
   * Call this from a menu button click to show/hide nav links.
   */
  toggleNav(): void {
    this.showNav = !this.showNav;
  }

  /**
   * Ensure correct state on viewport changes so menu behaves across resizes.
   * - On desktop (>=768px) ensure menu is visible.
   * - On mobile (<768px) keep it collapsed until toggled.
   */
  onResize(): void {
    if (window.innerWidth >= 768) {
      this.showNav = true;
    } else {
      this.showNav = false;
    }
  }

  constructor() {
    // Initialize based on current viewport
    this.onResize();
    // Listen to viewport resize
    window.addEventListener('resize', () => this.onResize());
  }
}
