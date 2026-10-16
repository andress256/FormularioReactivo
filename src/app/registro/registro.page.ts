import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
  IonToast,
  IonIcon
} from '@ionic/angular';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline, downloadOutline } from 'ionicons/icons';
import jsPDF from 'jspdf';

addIcons({ 'moon-outline': moonOutline, 'sunny-outline': sunnyOutline, 'download-outline': downloadOutline });

function fechaNoFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaIntroducida = new Date(control.value);
  return fechaIntroducida > hoy ? { fechaFutura: true } : null;
}

async function cifrarTexto(texto: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-registro',
  templateUrl: 'registro.page.html',
  styleUrls: ['registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
    IonToast,
    IonIcon
  ]
})
export class RegistroPage {

  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public showToast = signal<boolean>(false);
  public isDarkMode = signal<boolean>(false);
  public lastSubmission = signal<any>(null);

  constructor(private fb: FormBuilder) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]],
      fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidator]]
    });
  }

  get f() { return this.registroForm.controls; }

  public toggleDarkMode(): void {
    this.isDarkMode.update(v => !v);
    document.body.classList.toggle('dark-theme', this.isDarkMode());
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
      const formData = this.registroForm.value;
      const passwordCifrada = await cifrarTexto(formData.password);

      console.log('Payload a enviar a la API REST:', {
        ...formData,
        password: passwordCifrada
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      this.lastSubmission.set(formData);
      this.registroForm.reset();
      this.showToast.set(true);
    } catch (error) {
      console.error('Error al persistir los datos', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public descargarPdf(): void {
    const datos = this.lastSubmission();
    if (!datos) {
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Datos del formulario enviado', 20, 20);

    doc.setFontSize(12);
    doc.text(`Nombre: ${datos.nombre}`, 20, 40);
    doc.text(`Email: ${datos.email}`, 20, 50);
    doc.text(`Fecha de nacimiento: ${datos.fechaNacimiento}`, 20, 60);

    doc.save('datos-formulario.pdf');
  }
}