import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { WelcomeScreenComponent } from "./components/welcome-screen/welcome-screen.component";
import { ComponentViewerComponent } from "./components/component-viewer/component-viewer.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    WelcomeScreenComponent,
    ComponentViewerComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar
        [activeComponent]="activeComponent"
        (selectComponent)="setComponent($event)"
      ></app-sidebar>

      <main class="app-main">
        <app-welcome-screen
          *ngIf="activeComponent === 'welcome'"
          (selectComponent)="setComponent($event)"
        ></app-welcome-screen>
        
        <app-component-viewer
          *ngIf="activeComponent !== 'welcome'"
          [activeComponent]="activeComponent"
        ></app-component-viewer>
      </main>
    </div>
  `,
})
export class AppComponent {
  activeComponent = "welcome";

  setComponent(key: string) {
    this.activeComponent = key;
  }
}
