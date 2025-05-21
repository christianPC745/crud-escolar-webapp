import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorsSvc: ErrorsService,
    private facade: FacadeService
  ) { }

  public esquemaEvento(){
    return {
      'nombre':             '',
      'tipo':               '',          // Conferencia, Taller, Seminario, Concurso
      'fecha':              '',          // "YYYY-MM-DD"
      'horarioInicio':      '',          // "HH:mm"
      'horarioFin':         '',          // "HH:mm"
      'lugar':              '',
      'publicoObjetivo':    [], // ['Estudiantes','Profesores','Público general']
      'programaEducativo':  '',          // solo si incluye 'Estudiantes'
      'responsable':        '',
      'descripcion':        '',
      'cupo':               null
    };
  }

    /** Validaciones basadas en tu ValidatorService **/
  public validarEvento(data: any, editar: boolean){
    console.log("Validando Evento... ", data);

    let err: any = [];

    // Nombre: requerido
    if (!this.validatorService.required(data["nombre"])) {
      err.nombre = this.errorsSvc.required;
    }

    // Tipo
    if (!this.validatorService.required(data["tipo"])) {
      err.tipo = this.errorsSvc.required;
    }

    // Fecha: requerido y formato válido
    if (!this.validatorService.required(data["fecha"])) {
      err.fecha = this.errorsSvc.required;
    }

    // Horario Inicio
    if (!this.validatorService.required(data["horarioInicio"])) {
      err.horarioInicio = this.errorsSvc.required;
    }

    // Horario Fin
    if (!this.validatorService.required(data["horarioFin"])) {
      err.horarioFin = this.errorsSvc.required;
    }

    // Asegurar que la hora de fin sea mayor que la de inicio
    if (data.horarioInicio && data.horarioFin && data.horarioInicio >= data.horarioFin) {
      err.horarioFin = 'La hora final debe ser posterior a la de inicio';
    }

    // Lugar: requerido
    if (!this.validatorService.required(data["lugar"])) {
      err.lugar = this.errorsSvc.required;
    }

    // Público objetivo
    if (!data.publicoObjetivo || data.publicoObjetivo.length === 0) {
      err.publicoObjetivo = 'Selecciona al menos un público objetivo';
    }

    // Programa educativo solo si incluye Estudiantes
    if (data.publicoObjetivo.includes('Estudiantes') &&
        !this.validatorService.required(data["programaEducativo"])) {
      err.programaEducativo = this.errorsSvc.required;
    }

    // Responsable
    if (!this.validatorService.required(data["responsable"])) {
      err.responsable = this.errorsSvc.required;
    }

    // Descripción: requerido y máximo 300 caracteres
    if (!this.validatorService.required(data["descripcion"])) {
      err.descripcion = this.errorsSvc.required;
    } else if (!this.validatorService.max(data["descripcion"], 300)) {
      err.descripcion = this.errorsSvc.max(300);
    }

    // Cupo: requerido, numérico, al menos 1 y máximo 999
    if (!this.validatorService.required(data["cupo"])) {
      err.cupo = this.errorsSvc.required;
    } else if (!this.validatorService.numeric(data["cupo"])) {
      err.cupo = 'El cupo debe ser numérico';
    } else if (data.cupo < 1 || data.cupo > 999) {
      err.cupo = 'El cupo debe estar entre 1 y 999';
    }

    console.log(err);
    return err;
  }

  /** Métodos HTTP **/
  public registrarEvento(data: any): Observable<any> {
    var token = this.facade.getSessionToken();
    var headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.post<any>(`${environment.url_api}/evento/`,data, {headers:headers});
  }

  public obtenerListaEventos(): Observable<any> {
    const token = this.facade.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`,{ headers });
  }

  public getEventoByID(idEvento: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/evento/?id=${idEvento}`,httpOptions);
  }

  public editarEvento(data: any): Observable<any> {
    const token = this.facade.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(
      `${environment.url_api}/eventos-edit/`,
      data,
      { headers }
    );
  }

  public eliminarEvento(id: number): Observable<any> {
    const token = this.facade.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(
      `${environment.url_api}/eventos-edit/?id=${id}`,
      { headers }
    );
  }
   public obtenerResponsables(): Observable<any> {
    var token = this.facade.getSessionToken();
    var headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/api/responsables/`, {headers:headers});
  }
}
