import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CatalogService } from './services/catalog-service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly catalogService = inject(CatalogService);
  private breakpointObserver = inject(BreakpointObserver);

  isHandset = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  menu = [
    { path: '/', icon: 'home', label: 'Inicio' },
    { path: '/estudiantes', icon: 'groups', label: 'Estudiantes' },
    { path: '/inscripciones', icon: 'assignment', label: 'Inscripciones' },
    { path: '/respaldo', icon: 'import_export', label: 'Importar / Exportar' },
  ];
}
