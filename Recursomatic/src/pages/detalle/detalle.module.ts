import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Detalle } from './detalle';

@NgModule({
  declarations: [
    Detalle,
  ],
  imports: [
    IonicPageModule.forChild(Detalle),
  ],
  exports: [
    Detalle
  ]
})
export class DetalleModule {}
