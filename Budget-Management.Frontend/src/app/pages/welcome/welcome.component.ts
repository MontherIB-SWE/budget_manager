import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

/**
 * WelcomeComponent displays the landing page with a video background
 * and controls for opening login/register modals. It handles autoplay
 * restrictions by listening for user interaction if needed.
 */
@Component({
  selector   : 'app-welcome',
  standalone : true,
  imports    : [
    CommonModule,       // Common directives (ngIf, ngFor)
    RouterModule,       // Enables routerLink usage
    LoginComponent,     // Login modal component
    RegisterComponent   // Registration modal component
  ],
  templateUrl: './welcome.component.html',
  styleUrls  : ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Reference to the video element for autoplay control
   */
  private videoElement: HTMLVideoElement | null = null;

  /**
   * Listener for the 'canplay' event to attempt autoplay
   */
  private canPlayListener: (() => void) | null = null;

  /**
   * Listener for first user interaction to retry playback
   */
  private interactionListener: (() => void) | null = null;

  /**
   * Flags controlling visibility of login and register modals
   */
  showLogin = false;
  showRegister = false;
  /**
   * Used to trigger closing animation before hiding modals
   */
  isClosing = false;

  /**
   * Inject ElementRef to query for video element in template
   */
  constructor(private el: ElementRef) { }

  /**
   * Lifecycle hook: no initialization logic needed here
   */
  ngOnInit(): void { }

  /**
   * After the view initializes, locate the video element and
   * set up event listeners for autoplay handling.
   */
  ngAfterViewInit(): void {
    // Delay to ensure DOM is ready
    setTimeout(() => {
      this.videoElement = this.el.nativeElement.querySelector('.video-background video');
      if (!this.videoElement) {
        console.error('WelcomeComponent: Video element not found.');
        return;
      }

      // Attempt to play when video can play
      this.canPlayListener = () => this.attemptToPlayVideo();
      this.videoElement.addEventListener('canplay', this.canPlayListener);
    }, 0);
  }

  /**
   * Tries to play the video. If autoplay is blocked, waits for user interaction.
   */
  private attemptToPlayVideo(): void {
    if (!this.videoElement) return;
    const playPromise = this.videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        if (error.name === 'NotAllowedError') {
          // Autoplay blocked: listen for first click/touch
          console.warn('Autoplay prevented; waiting for interaction.');
          this.interactionListener = () => {
            this.videoElement!.play()
              .then(() => console.log('Video playing after interaction.'))
              .catch(err => console.error('Playback failed post-interaction.', err));
            this.removeInteractionListener();
          };
          document.addEventListener('click', this.interactionListener);
          document.addEventListener('touchend', this.interactionListener);
        } else {
          console.error('Unexpected video playback error.', error);
        }
      });
    }
  }

  /**
   * Lifecycle hook: clean up event listeners to prevent leaks.
   */
  ngOnDestroy(): void {
    if (this.videoElement && this.canPlayListener) {
      this.videoElement.removeEventListener('canplay', this.canPlayListener);
    }
    this.removeInteractionListener();
  }

  /**
   * Removes the temporary interaction listeners.
   */
  private removeInteractionListener(): void {
    if (this.interactionListener) {
      document.removeEventListener('click', this.interactionListener);
      document.removeEventListener('touchend', this.interactionListener);
      this.interactionListener = null;
    }
  }

  /**
   * Opens the login modal and ensures register modal is hidden.
   */
  openLoginModal(): void {
    this.showRegister = false;
    this.showLogin = true;
    this.isClosing = false;
  }

  /**
   * Opens the registration modal and ensures login modal is hidden.
   */
  openRegisterModal(): void {
    this.showLogin = false;
    this.showRegister = true;
    this.isClosing = false;
  }

  /**
   * Closes any open modals with a short closing animation.
   */
  closeModals(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.showLogin = false;
      this.showRegister = false;
      this.isClosing = false;
    }, 300); // Match CSS animation duration
  }
}