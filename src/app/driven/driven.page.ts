import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText
} from '@ionic/angular';

@Component({
  selector: 'app-driven',
  templateUrl: 'driven.page.html',
  styleUrls: ['driven.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonText
  ]
})
export class DrivenPage {

  public nombre = '';
  public email = '';
  public password = '';
  public fechaNacimiento = '';
  public enviado = signal<boolean>(false);

  public passwordPattern = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$';

  get fechaEsFutura(): boolean {
    if (!this.fechaNacimiento) {
      return false;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(this.fechaNacimiento) > hoy;
  }

  public onSubmit(form: NgForm): void {
    if (form.invalid || this.fechaEsFutura) {
      return;
    }
    console.log('Datos del formulario template-driven:', form.value);
    this.enviado.set(true);
    form.resetForm();
  }
}