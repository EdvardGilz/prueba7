import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Resumen } from './resumen';

@NgModule({
  declarations: [
    Resumen,
  ],
  imports: [
    IonicPageModule.forChild(Resumen),
  ],
  exports: [
    Resumen
  ]
})
export class ResumenModule {}
