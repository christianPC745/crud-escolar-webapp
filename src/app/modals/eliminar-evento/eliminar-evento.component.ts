import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventoService } from 'src/app/services/evento.service';
import { EliminarUserModalComponent } from '../eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-eliminar-evento',
  templateUrl: './eliminar-evento.component.html',
  styleUrls: ['./eliminar-evento.component.scss']
})
export class EliminarEventoComponent implements OnInit {
  constructor(
    private eventoService: EventoService,
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ){}

  ngOnInit(): void {

  }
  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }
  public eliminarEvento(){
    this.eventoService.eliminarEvento(this.data.id).subscribe(
      (response)=>{
        console.log(response);
        this.dialogRef.close({isDelete:true});
      }, (error)=>{
        this.dialogRef.close({isDelete:false});
      }
    );
  }
}
