import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';  
import { RouterOutlet } from '@angular/router';              
import { GlobalBgComponent } from "../../shared/global-bg/global-bg.component"; 

/**
 * LayoutComponent wraps the entire application UI.
 * It renders the Header, a global background, and the RouterOutlet
 * where all child routes/components are displayed.
 */
@Component({
  selector   : 'app-layout',
  standalone : true,
  imports    : [HeaderComponent, RouterOutlet, GlobalBgComponent],
  templateUrl: './layout.component.html',
  styleUrls  : ['./layout.component.css']
})
export class LayoutComponent {
  // No additional logic needed; purely a container component
}
