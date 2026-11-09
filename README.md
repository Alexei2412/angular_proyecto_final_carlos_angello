# Sistema de gestión de inscripciones universitarias

Aplicación web hecha con **Angular 20** y **Angular Material** para registrar estudiantes, cursos por período académico e inscripciones. No usa backend: los catálogos se leen de archivos JSON y los registros se guardan en `localStorage`, con opción de exportar e importar un respaldo JSON.

**Integrantes del proyecto:** Carlos Maldonado (202425512) · Angello Contreras (202425510)

---

## Requisitos

- Node.js 20.19 o superior (o 22.12+)
- npm 10+
- Angular CLI 20 (opcional, se puede usar con `npx`)

## Instalación y ejecución

```bash
git clone https://github.com/Alexei2412/angular_proyecto_final_carlos_angello.git
cd angular_proyecto_final_carlos_angello
npm install
npm start
```

Abrir `http://localhost:4200/` en el navegador.

---

## Estructura del proyecto

```
public/
  data/                    Catálogos JSON (solo lectura)
    cursos.json            id, codigo, nombre, creditos, carreraId, semestre
    carreras.json, generos.json, jornadas.json, modalidades.json,
    estados.json, periodos.json, tipos-contacto.json
docs/ejemplos/             Archivos para probar la importación (válido e inválidos)
src/
  custom-theme.scss        Tema de Angular Material
  styles.css               Estilos globales y clases responsive
  app/
    app.ts / app.html      Estructura general: toolbar + menú lateral responsive
    app.routes.ts          Rutas de la aplicación
    app.config.ts          Proveedores: router, HttpClient
    interfaces/            Modelos TypeScript (Student, Course, Enrollment, CatalogItem, BackupData)
    enums/                 Llaves de localStorage y estados de inscripción
    services/              Lógica de datos (los componentes no tocan localStorage)
      storage-service.ts     Lectura/escritura en localStorage
      catalog-service.ts     Carga de catálogos JSON con httpResource
      student-service.ts     CRUD de estudiantes
      enrollment-service.ts  CRUD de inscripciones y reglas de negocio
      backup-service.ts      Exportación e importación con validación
    validators/            Validadores personalizados de formularios
    utils/                 Mensajes de error de los formularios
    components/            Componentes reutilizables (diálogo de confirmación)
    pages/                 Páginas: inicio, estudiantes, inscripciones, respaldo
```

## Rutas

| Ruta                                                 | Página                                            |
| ---------------------------------------------------- | ------------------------------------------------- |
| `/`                                                  | Inicio con resumen                                |
| `/estudiantes`                                       | Listado con filtros (texto, carrera, género)      |
| `/estudiantes/nuevo` · `/estudiantes/:id/editar`     | Formulario de estudiante                          |
| `/estudiantes/:id`                                   | Detalle del estudiante y sus inscripciones        |
| `/inscripciones`                                     | Listado con filtros (estudiante, período, estado) |
| `/inscripciones/nueva` · `/inscripciones/:id/editar` | Formulario de inscripción                         |
| `/inscripciones/:id`                                 | Detalle de la inscripción                         |
| `/respaldo`                                          | Importar / exportar datos                         |

## Modelo de datos y relaciones

Un estudiante puede tener varias inscripciones; cada inscripción pertenece a **un** estudiante y **un** período, e incluye uno o varios cursos. La inscripción solo guarda identificadores:

```json
{
  "id": "INS-001",
  "estudianteId": "EST-001",
  "periodoId": "2026-2",
  "cursoIds": ["WEB101", "BD201"],
  "modalidadId": "PRE",
  "estado": "REGISTRADA"
}
```

Los nombres del estudiante y de los cursos se consultan en `StudentService` y `CatalogService`.

Los números de contacto de cada estudiante se guardan en un arreglo de objetos:

```json
"contactos": [
  { "numero": "5555-1234", "tipo": "MOVIL", "activo": true },
  { "numero": "7765-4321", "tipo": "CASA",  "activo": false }
]
```

## Validaciones y reglas de negocio

**Estudiante**

- Código con formato `EST-001`, único (no se permiten duplicados) y no editable después de crearlo.
- Nombres y apellidos: obligatorios, 2–60 caracteres, solo letras, no se aceptan solo espacios.
- DPI de 13 dígitos; correo con formato `nombre@dominio.ext`; dirección de 5–150 caracteres.
- Fecha de nacimiento válida, no futura, edad entre 15 y 90 años.
- Contactos: de 1 a 5 números de 8 dígitos (`5555-1234`), al menos uno activo y sin números repetidos.
- Al eliminar se pide confirmación; también se eliminan sus inscripciones.

**Inscripción**

- Estudiante, período, modalidad y estado obligatorios.
- Solo se muestran los cursos de la carrera del estudiante.
- Mínimo 1 y máximo 6 cursos; máximo 24 créditos.
- Un estudiante no puede tener dos inscripciones vigentes en el mismo período (las canceladas o rechazadas no cuentan).
- Una inscripción nueva solo puede quedar como _Borrador_ o _Registrada_; los demás estados se asignan al editar.
- Cancelar no borra el registro: cambia el estado a _Cancelada_ (previa confirmación) y ya no se puede editar.
- Antes de guardar se comprueba que el estudiante y todos los cursos existan.

## Importación y exportación

**Exportar:** en _Importar / Exportar_ → **Exportar datos**. Se descarga `uniregistro_respaldo.json`:

```json
{
  "app": "UMES-Inscripciones",
  "version": "1.0",
  "fechaExportacion": "2026-11-03T20:00:00.000Z",
  "estudiantes": [ ... ],
  "inscripciones": [ ... ]
}
```

Los catálogos no se exportan porque ya vienen en la aplicación.

**Importar:** **Importar datos** → seleccionar un archivo JSON. El proceso es:

1. Se lee el archivo y se verifica que sea JSON válido.
2. Se valida la estructura (`version` y las colecciones `estudiantes` e `inscripciones`).
3. Se validan campos obligatorios y tipos de cada estudiante y cada inscripción (código, DPI, correo, teléfonos), códigos duplicados y que género, carrera, jornada, tipo de contacto, período, modalidad y estado existan en los catálogos.
4. Se valida que cada inscripción haga referencia a un estudiante del archivo y a cursos existentes, y que respete el máximo de 6 cursos y 24 créditos.
5. Si hay errores se muestran en pantalla y **no se modifica nada**.
6. Si todo es válido se muestra una advertencia con la cantidad de registros y se pide confirmación.
7. Al confirmar se **reemplazan** los datos actuales y se actualizan los listados.

**Pruebas sugeridas** (archivos en `docs/ejemplos/`):

| Archivo                              | Resultado esperado                                                     |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `respaldo_valido.json`               | Importa 3 estudiantes y 3 inscripciones                                |
| `respaldo_invalido_referencias.json` | Rechazado: estudiante inexistente, curso inexistente y correo inválido |
| `respaldo_invalido_sintaxis.json`    | Rechazado: el JSON está incompleto                                     |
