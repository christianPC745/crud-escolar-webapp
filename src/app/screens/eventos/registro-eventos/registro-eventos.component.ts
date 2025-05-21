import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import { EventoService }            from 'src/app/services/evento.service';
import { FacadeService }            from 'src/app/services/facade.service';

declare var $: any;

@Component({
  selector: 'app-registro-evento',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventoComponent implements OnInit {
  @Input() rol: string = '';
  @Input() datos_user: any = {};

  public responsables: { id: number; first_name: string; last_name: string }[] = [];

  public evento: any = {};
  public errors: any = {};
  public editar = false;
  public idEvento = 0;
  public token = '';
  public tipo = 'registro-eventos';
  public minDate = new Date();

  public tipos: string[] = ['Conferencia','Taller','Seminario','Charla'];
  public programas: string[] = [];

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private eventosService: EventoService,
    private facadeService: FacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const paramId = this.activatedRoute.snapshot.params['id'];
    if (paramId !== undefined) {
      this.editar = true;
      this.idEvento = +paramId;
      this.evento = this.datos_user;
    } else {
      this.evento = this.eventosService.esquemaEvento();
      this.evento.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    this.eventosService.obtenerResponsables()
      .subscribe(list => {
        this.responsables = list;
        console.log('Responsables cargados:', this.responsables);
      }, err => {
        console.error('Error al cargar responsables', err);
      });
    // Carga catálogos dentro de ngOnInit
    /*this.eventosService.obtenerProgramas()
      .subscribe(p => this.programas = p);

    this.eventosService.obtenerResponsables()
      .subscribe(r => this.responsables = r);
    */
    console.log('Evento (inicial):', this.evento);
  }

  public regresar(): void {
    this.location.back();
  }

  public onInicioChange(time: string): void {
    if (this.evento.horarioFin && this.evento.horarioFin < time) {
      this.evento.horarioFin = '';
    }
  }

  public changeFecha(event: any): void {
    if (event.value) {
      this.evento.fecha = event.value.toISOString().split('T')[0];
      console.log('Fecha seleccionada:', this.evento.fecha);
    }
  }

  public togglePublico(valor: string, checked: boolean): void {
    if (!Array.isArray(this.evento.publicoObjetivo)) {
      this.evento.publicoObjetivo = [];
    }
    if (checked) {
      this.evento.publicoObjetivo.push(valor);
    } else {
      const idx = this.evento.publicoObjetivo.indexOf(valor);
      if (idx >= 0) {
        this.evento.publicoObjetivo.splice(idx, 1);
      }
    }
  }

  public registrar(): boolean {
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (!$.isEmptyObject(this.errors)) {
      return false;
    }

    this.eventosService.registrarEvento(this.evento).subscribe(
      () => {
        alert('Evento registrado correctamente');
        if(this.token != ""){
          this.router.navigate(["home"]);
        }else{
          this.router.navigate(["/"]);
        }
      },
      () => {
        alert('No se pudo registrar el evento');
      }
    );
    return true;
  }

  public actualizar(): boolean {
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (!$.isEmptyObject(this.errors)) {
      return false;
    }

    this.eventosService.editarEvento(this.evento).subscribe(
      (response) => {
        alert('Evento actualizado correctamente');
        this.router.navigate(['/eventos/lista']);
      },
      (error) => {
        alert('No se pudo actualizar el evento');
      }
    );
    return true;
  }
}
