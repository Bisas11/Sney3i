import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';

import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { SendRequestDialogComponent } from './components/send-request-dialog/send-request-dialog.component';

const materialModules = [
  MatToolbarModule, MatSidenavModule, MatCardModule, MatFormFieldModule,
  MatInputModule, MatButtonModule, MatIconModule, MatDialogModule,
  MatTableModule, MatTabsModule, MatChipsModule, MatMenuModule,
  MatListModule, MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule,
  MatDividerModule, MatBadgeModule, MatTooltipModule, MatGridListModule,
  MatDatepickerModule, MatNativeDateModule, MatPaginatorModule
];

@NgModule({
  declarations: [
    StarRatingComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    SendRequestDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules,
    StarRatingComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent
  ]
})
export class SharedModule {}
