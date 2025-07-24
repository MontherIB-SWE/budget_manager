import { Component, AfterViewInit, ElementRef } from '@angular/core';

/**
 * GlobalBgComponent renders an animated SVG wave background.
 * It selects each <path> inside .bg-wrapper after view init
 * and applies randomized translation hops via CSS variables.
 */
@Component({
  selector   : 'app-global-bg',
  standalone : true,
  templateUrl: './global-bg.component.html',
  styleUrls  : ['./global-bg.component.css']
})
export class GlobalBgComponent implements AfterViewInit {
  /**
   * After Angular inserts the template, this runs once.
   * It locates all SVG paths and starts their recursive animations.
   */
  ngAfterViewInit(): void {
    // Select all <path> elements within the .bg-wrapper container
    const waves = document.querySelectorAll('.bg-wrapper path') as NodeListOf<SVGPathElement>;

    // Define random range for translation and animation duration
    const minTranslate = -120, maxTranslate = 120;
    const minDuration  = 1500, maxDuration = 4500;
    // Utility to get a random number between a and b
    const randomBetween = (a: number, b: number) => Math.random() * (b - a) + a;

    /**
     * Applies a hop animation to a single SVG path.
     * It updates CSS custom properties --tx and --ty,
     * sets a random transition duration, and schedules
     * the next hop after that duration.
     * @param el - SVGPathElement to animate
     */
    function hop(el: SVGPathElement): void {
      // Randomize translation offsets
      const tx = randomBetween(minTranslate, maxTranslate).toFixed(0) + 'px';
      const ty = randomBetween(minTranslate, maxTranslate).toFixed(0) + 'px';
      el.style.setProperty('--tx', tx);
      el.style.setProperty('--ty', ty);

      // Determine random duration for smooth transitions
      const duration = randomBetween(minDuration, maxDuration);
      el.style.transitionDuration = `${duration}ms`;

      // Recursively call hop after the current animation completes
      setTimeout(() => hop(el), duration);
    }

    // Kick off the animation for each SVG path
    waves.forEach(pathEl => hop(pathEl));
  }
}
