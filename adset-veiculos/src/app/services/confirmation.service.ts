import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';


export interface ConfirmationConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private _defaultConfig: ConfirmationConfig = {
    title: 'Confirmar ação',
    message: 'Você tem certeza de que deseja confirmar esta ação?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    dismissible: false
  };

  constructor(private _matDialog: MatDialog) { }

  open(config: ConfirmationConfig = {}): MatDialogRef<ConfirmDialogComponent> {
    // Merge da configuração do usuário com a configuração padrão
    const userConfig = { ...this._defaultConfig, ...config };

    // Abre o diálogo
    return this._matDialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      disableClose: !userConfig.dismissible,
      data: {
        title: userConfig.title,
        message: userConfig.message,
        confirmText: userConfig.confirmText,
        cancelText: userConfig.cancelText
      } as ConfirmDialogData,
      panelClass: 'confirmation-dialog-panel'
    });
  }
}
