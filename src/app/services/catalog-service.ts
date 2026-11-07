import {computed, Injectable} from '@angular/core';
import {httpResource} from '@angular/common/http';
import {CatalogItem, Period} from '../interfaces/catalog.model';
import {Course} from '../interfaces/course.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {

  generos = httpResource<CatalogItem[]>(() => 'data/generos.json', {defaultValue: []});
  jornadas = httpResource<CatalogItem[]>(() => 'data/jornadas.json', {defaultValue: []});
  modalidades = httpResource<CatalogItem[]>(() => 'data/modalidades.json', {defaultValue: []});
  estados = httpResource<CatalogItem[]>(() => 'data/estados.json', {defaultValue: []});
  carreras = httpResource<CatalogItem[]>(() => 'data/carreras.json', {defaultValue: []});
  tiposContacto = httpResource<CatalogItem[]>(() => 'data/tipos-contacto.json', {defaultValue: []});
  periodos = httpResource<Period[]>(() => 'data/periodos.json', {defaultValue: []});
  cursos = httpResource<Course[]>(() => 'data/cursos.json', {defaultValue: []});

  periodosActivos = computed(() => this.periodos.value().filter(p => p.activo));

  hasError = computed(() =>
    [this.generos, this.jornadas, this.modalidades, this.estados, this.carreras,
      this.tiposContacto, this.periodos, this.cursos].some(r => !!r.error())
  );

  getName(items: CatalogItem[], id: string): string {
    return items.find(item => item.id === id)?.nombre ?? id;
  }

  getCourse(id: string): Course | undefined {
    return this.cursos.value().find(c => c.id === id);
  }

  coursesByCareer(carreraId: string): Course[] {
    return this.cursos.value()
      .filter(c => c.carreraId === carreraId)
      .sort((a, b) => a.semestre - b.semestre || a.nombre.localeCompare(b.nombre));
  }

  totalCredits(cursoIds: string[]): number {
    return cursoIds.reduce((total, id) => total + (this.getCourse(id)?.creditos ?? 0), 0);
  }
}
