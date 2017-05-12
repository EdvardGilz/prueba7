import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the Resumen page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-resumen',
  templateUrl: 'resumen.html',
})
export class Resumen {
  public productos;
  public proyecto;
  public btnDisabled = true;
  public data;

  constructor(public viewCtrl: ViewController, 
              public navParams: NavParams) {
    this.proyecto = navParams.get("proyecto");
    this.productos = navParams.get("productos");

    for (var i=0; i<this.productos.length; i++) {
      this.productos[i].activo = false;
      this.productos[i].cantidad = "";
      this.productos[i].cantidad1 = "";
      this.productos[i].cantidad2 = "";
    }
  }

  cambio() {
    var activo = false;
    this.data = [];

    for (var i=0; i<this.productos.length; i++) {
      if (this.productos[i].activo == true && ((this.productos[i].cantidad && this.productos[i].cantidad != "") || (this.productos[i].cantidad1 && this.productos[i].cantidad1 != "" && this.productos[i].cantidad2 && this.productos[i].cantidad2 != ""))) {
        activo = true;
        if (this.productos[i].tipo == 0) {
          var cantidad1;
          var cantidad2;
          var m2;

          cantidad1 = parseFloat(this.productos[i].cantidad1);
          cantidad2 = parseFloat(this.productos[i].cantidad2);
          m2 = (cantidad1 * cantidad2).toFixed(3);
          
          if (parseFloat(m2) <= parseFloat(this.productos[i].m2)) {
            this.productos[i].pas = false;
            this.productos[i].cantidad = m2
            this.data.push({"index": i});
          }
          else {
            activo = false;
            this.productos[i].pas = true;
          }
        }
        else {
          if (parseInt(this.productos[i].cantidad) <= this.productos[i].pzas) {
            this.productos[i].pas = false;
            this.data.push({"index": i});
          }
          else {
            activo = false;
            this.productos[i].pas = true;
          }
        }
      }
    }
    
    if (activo == true) {
      this.btnDisabled = false;
    }
    else {
      this.btnDisabled = true;
    }
  }

  cerrar() {
    this.viewCtrl.dismiss({"success": 0});
  }

  guardar() {
    this.viewCtrl.dismiss({"success": 1, "data": this.data});
  }

}
