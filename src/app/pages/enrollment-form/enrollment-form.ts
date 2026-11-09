import {Component, computed, inject, input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatFormField, MatError, MatInput, MatLabel, MatHint} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EnrollmentService, MAX_COURSES, MAX_CREDITS} from '../../services/enrollment-service';
import {StudentService} from '../../services/student-service';
import {CatalogService} from '../../services/catalog-service';
import {Enrollment} from '../../interfaces/enrollment.model';
import {EnrollmentStatus} from '../../enums/enrollment-status';
import {CustomValidators} from '../../validators/custom-validators';
import {getErrorMessage} from '../../utils/form-errors';



@Component({
  selector: 'app-enrollment-form',
  imports: [ ReactiveFormsModule, RouterLink,
    MatFormField, MatLabel, MatInput, MatError, MatHint, MatSelect, MatOption,
    MatRadioGroup, MatRadioButton, MatCheckbox, MatButton, MatIcon,
    MatCard, MatCardHeader, MatCardTitle, MatCardContent,
  ],
  templateUrl: './enrollment-form.html',
  styleUrl: './enrollment-form.css',
})
export class EnrollmentForm implements OnInit{
  id = input<string>();
  estudiante = input<string>();
  isEdit = computed(() => !!this.id());

  private fb = inject(FormBuilder).nonNullable;
  private enrollmentService = inject(EnrollmentService);
  readonly studentService = inject(StudentService);
  readonly catalogs = inject(CatalogService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly errorOf = getErrorMessage;
  readonly maxCourses = MAX_COURSES;
  readonly maxCredits = MAX_CREDITS;

  private creditsValidator = (group: AbstractControl): ValidationErrors | null => {
    const cursoIds: string[] = group.get('cursoIds')?.value ?? [];
    const total = this.catalogs.totalCredits(cursoIds);
    return total > MAX_CREDITS ? {maxCredits: {max: MAX_CREDITS, actual: total}} : null;
  };

  private duplicatePeriodValidator = (group: AbstractControl): ValidationErrors | null => {
    const estudianteId = group.get('estudianteId')?.value;
    const periodoId = group.get('periodoId')?.value;
    const estado = group.get('estado')?.value;
    if (!estudianteId || !periodoId || estado === EnrollmentStatus.CANCELADA) {
      return null;
    }
    return this.enrollmentService.hasActiveInPeriod(estudianteId, periodoId, this.id())
      ? {duplicatePeriod: true}
      : null;
  };

  enrollmentForm = this.fb.group({
    estudianteId: ['', Validators.required],
    periodoId: ['', Validators.required],
    modalidadId: ['', Validators.required],
    estado: [EnrollmentStatus.REGISTRADA as string, Validators.required],
    cursoIds: this.fb.control<string[]>([], [
      CustomValidators.minItems(1),
      CustomValidators.maxItems(MAX_COURSES),
    ]),
    observaciones: ['', [Validators.maxLength(250), CustomValidators.noWhitespace]],
  }, {validators: [this.creditsValidator, this.duplicatePeriodValidator]});

  get f() {
    return this.enrollmentForm.controls;
  }

  private estudianteId = toSignal(this.f.estudianteId.valueChanges, {initialValue: ''});
  private cursoIdsValue = toSignal(this.f.cursoIds.valueChanges, {initialValue: [] as string[]});

  selectedStudent = computed(() => this.studentService.getById(this.estudianteId()));

   availableCourses = computed(() => {
    const student = this.selectedStudent();
    return student ? this.catalogs.coursesByCareer(student.carreraId) : [];
  });
   totalCredits = computed(() => this.catalogs.totalCredits(this.cursoIdsValue()));


   availableStatuses = computed(() => {
    const estados = this.catalogs.estados.value();
    return this.isEdit()
      ? estados
      : estados.filter(e => e.id === EnrollmentStatus.BORRADOR || e.id === EnrollmentStatus.REGISTRADA);
  });

  availablePeriods = computed(() =>
    this.isEdit() ? this.catalogs.periodos.value() : this.catalogs.periodosActivos()
  );

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      const enrollment = this.enrollmentService.getById(id);
      if (!enrollment) {
        this.snackBar.open(`No se encontró la inscripción ${id}`, 'Cerrar', {duration: 4000});
        this.router.navigate(['/inscripciones']);
        return;
      }
      if (enrollment.estado === EnrollmentStatus.CANCELADA) {
        this.snackBar.open('No es posible modificar una inscripción cancelada', 'Cerrar', {duration: 4000});
        this.router.navigate(['/inscripciones', id]);
        return;
      }
      this.enrollmentForm.patchValue(enrollment);
      this.f.estudianteId.disable(); 
    } else if (this.estudiante()) {
      this.f.estudianteId.setValue(this.estudiante()!);
    }
  }

  onStudentChange(): void {
    const validIds = this.availableCourses().map(c => c.id);
    this.f.cursoIds.setValue(this.f.cursoIds.value.filter(id => validIds.includes(id)));
  }

  isSelected(cursoId: string): boolean {
    return this.f.cursoIds.value.includes(cursoId);
  }

  toggleCourse(cursoId: string, checked: boolean): void {
    const current = this.f.cursoIds.value;
    this.f.cursoIds.setValue(checked ? [...current, cursoId] : current.filter(id => id !== cursoId));
    this.f.cursoIds.markAsTouched();
  }

 save(): void {
    this.enrollmentForm.updateValueAndValidity();
    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      this.snackBar.open('Complete o corrija los datos pendientes de la inscripción', 'Cerrar', {duration: 3000});
      return;
    }

    const value = this.enrollmentForm.getRawValue();
    const existing = this.isEdit() ? this.enrollmentService.getById(this.id()!) : undefined;

    const enrollment: Enrollment = {
      ...value,
      id: existing?.id ?? this.enrollmentService.nextId(),
      observaciones: value.observaciones.trim(),
      fechaInscripcion: existing?.fechaInscripcion ?? new Date().toISOString(),
    };

    try {
      if (existing) {
        this.enrollmentService.update(enrollment);
        this.snackBar.open('Inscripción actualizada correctamente', 'Cerrar', {duration: 3000});
      } else {
        this.enrollmentService.add(enrollment);
        this.snackBar.open(`Inscripción ${enrollment.id} registrada correctamente`, 'Cerrar', {duration: 3000});
      }
      this.router.navigate(['/inscripciones', enrollment.id]);
    } catch (error) {
      this.snackBar.open((error as Error).message, 'Cerrar', {duration: 5000});
    }
  }
}

