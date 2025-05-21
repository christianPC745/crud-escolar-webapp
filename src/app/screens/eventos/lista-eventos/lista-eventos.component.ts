import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarEventoComponent } from 'src/app/modals/eliminar-evento/eliminar-evento.component';
import { EventoService } from 'src/app/services/evento.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-lista-eventos',
  templateUrl: './lista-eventos.component.html',
  styleUrls: ['./lista-eventos.component.scss']
})
export class ListaEventosComponent implements OnInit{
 public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_eventos: any[] = [];

  // Columnas de la tabla
  displayedColumns: string[] = [
    'id', 'nombre', 'tipo', 'fecha', 'horarioInicio', 'horarioFin', 'lugar', 'editar', 'eliminar'
  ];
  dataSource = new MatTableDataSource<EventoDatos>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private facadeService: FacadeService,
    private eventosService: EventoService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    if (!this.token) {
      this.router.navigate(['']);
      return;
    }
    this.obtenerEventos();
  }

  private obtenerEventos(): void {
    this.eventosService.obtenerListaEventos().subscribe(
      response => {
        console.log("Reponse",response);
        this.lista_eventos = response;
        this.lista_eventos.forEach(ev => {
          ev.horarioInicio = ev.horario_inicio;
          ev.horarioFin = ev.horario_fin;
        });
        this.dataSource = new MatTableDataSource<EventoDatos>(this.lista_eventos);
        this.initPaginator();
      },
      () => alert('No se pudo obtener la lista de eventos')
    );
  }

  private initPaginator(): void {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.paginator._intl.itemsPerPageLabel = 'Registros por página';
      this.paginator._intl.getRangeLabel = (page, pageSize, length) => {
        if (length === 0 || pageSize === 0) {
          return `0 / ${length}`;
        }
        const startIndex = page * pageSize;
        const endIndex = Math.min(startIndex + pageSize, length);
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
      this.paginator._intl.firstPageLabel    = 'Primera página';
      this.paginator._intl.lastPageLabel     = 'Última página';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.nextPageLabel     = 'Página siguiente';
    }, 0);
  }

  public goEditar(userId:number){
    this.router.navigate(["registro-eventos/"+userId]);
  }

  public eliminar(id: number): void {
    const dialogRef = this.dialog.open(EliminarEventoComponent, {
      data: { id: id, entidad: 'evento' },
      width: '328px',
      height: '288px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isDelete) {
        this.lista_eventos = this.lista_eventos.filter(e => e.id !== id);
        this.dataSource.data = this.lista_eventos;
      }
    });
  }
}

// Interface para tipar la tabla
export interface EventoDatos {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  horarioInicio: string;
  horarioFin: string;
  lugar: string;
}
