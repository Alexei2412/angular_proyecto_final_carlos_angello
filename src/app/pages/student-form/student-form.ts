import { Component, computed, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormField, MatError, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentService } from '../../services/student-service';
import { CatalogService } from '../../services/catalog-service';
import { ContactNumber, Student } from '../../interfaces/student.model';
import {
  CustomValidators,
  DPI_PATTERN,
  EMAIL_PATTERN,
  NAME_PATTERN,
  PHONE_PATTERN,
  STUDENT_ID_PATTERN,
} from '../../validators/custom-validators';
import { getErrorMessage } from '../../utils/form-errors';

@Component({
  selector: 'app-student-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatHint,
    MatSelect,
    MatOption,
    MatRadioGroup,
    MatRadioButton,
    MatSlideToggle,
    MatButton,
    MatIconButton,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
  ],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
})
export class StudentForm implements OnInit {
  id = input<string>();
  isEdit = computed(() => !!this.id());

  private fb = inject(FormBuilder).nonNullable;
  private studentService = inject(StudentService);
  readonly catalogs = inject(CatalogService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly errorOf = getErrorMessage;

  studentForm = this.fb.group({
    id: [
      '',
      [
        Validators.required,
        Validators.pattern(STUDENT_ID_PATTERN),
        CustomValidators.uniqueStudentId((id) => this.studentService.exists(id)),
      ],
    ],
    nombres: [
      '',
      [
        Validators.required,
        CustomValidators.noWhitespace,
        Validators.minLength(2),
        Validators.maxLength(60),
        Validators.pattern(NAME_PATTERN),
      ],
    ],
    apellidos: [
      '',
      [
        Validators.required,
        CustomValidators.noWhitespace,
        Validators.minLength(2),
        Validators.maxLength(60),
        Validators.pattern(NAME_PATTERN),
      ],
    ],
    dpi: ['', [Validators.required, Validators.pattern(DPI_PATTERN)]],
    fechaNacimiento: ['', [Validators.required, CustomValidators.birthDate(15, 90)]],
    genero: ['', Validators.required],
    correo: [
      '',
      [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(100)],
    ],
    direccion: [
      '',
      [
        Validators.required,
        CustomValidators.noWhitespace,
        Validators.minLength(5),
        Validators.maxLength(150),
      ],
    ],
    carreraId: ['', Validators.required],
    jornadaId: ['', Validators.required],
    semestre: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    contactos: this.fb.array(
      [this.createContact()],
      [
        CustomValidators.minItems(1),
        CustomValidators.maxItems(5),
        CustomValidators.atLeastOneActive,
        CustomValidators.noDuplicateNumbers,
      ],
    ),
  });

  get f() {
    return this.studentForm.controls;
  }

  get contactos() {
    return this.studentForm.controls.contactos;
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    const student = this.studentService.getById(id);
    if (!student) {
      this.snackBar.open(`No se encontró el expediente del estudiante ${id}`, 'Cerrar', { duration: 4000 });
      this.router.navigate(['/estudiantes']);
      return;
    }
    this.contactos.clear();
    student.contactos.forEach((c) => this.contactos.push(this.createContact(c)));
    this.studentForm.patchValue(student);
    this.f.id.disable();
  }

  createContact(contact?: ContactNumber) {
    return this.fb.group({
      numero: [contact?.numero ?? '', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      tipo: [contact?.tipo ?? 'MOVIL', Validators.required],
      activo: [contact?.activo ?? true],
    });
  }

  addContact(): void {
    this.contactos.push(this.createContact());
  }

  removeContact(index: number): void {
    this.contactos.removeAt(index);
    this.contactos.markAsTouched();
  }

  upperCaseId(): void {
    const value = this.f.id.value;
    if (value !== value.toUpperCase()) {
      this.f.id.setValue(value.toUpperCase());
    }
  }

  save(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.snackBar.open('Complete o corrija los campos pendientes antes de guardar', 'Cerrar', { duration: 3000 });
      return;
    }

    const value = this.studentForm.getRawValue();
    const existing = this.isEdit() ? this.studentService.getById(value.id) : undefined;

    const student: Student = {
      ...value,
      id: value.id.trim().toUpperCase(),
      nombres: value.nombres.trim(),
      apellidos: value.apellidos.trim(),
      correo: value.correo.trim().toLowerCase(),
      direccion: value.direccion.trim(),
      contactos: value.contactos.map((c) => ({ ...c, numero: c.numero.trim() })),
      fechaRegistro: existing?.fechaRegistro ?? new Date().toISOString(),
    };

    try {
      if (this.isEdit()) {
        this.studentService.update(student);
        this.snackBar.open('Datos del estudiante actualizados correctamente', 'Cerrar', { duration: 3000 });
      } else {
        this.studentService.add(student);
        this.snackBar.open('Estudiante registrado correctamente', 'Cerrar', { duration: 3000 });
      }
      this.router.navigate(['/estudiantes', student.id]);
    } catch (error) {
      this.snackBar.open((error as Error).message, 'Cerrar', { duration: 4000 });
    }
  }
}
