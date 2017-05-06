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
  public productos = [];
  public btnDisabled = true;

  constructor(public viewCtrl: ViewController, 
              public navParams: NavParams) {
    console.log(navParams.get("proyecto"));
    this.productos = navParams.get("productos");
    console.log(this.productos);
  }

  cambio() {
    var activo = false;
    var cantidad = false;

    for (var i=0; i<this.productos.length; i++) {
      if (this.productos[i].activo == true) {
        activo = true;
      }
    }

    if (activo == true) {
      for (var i=0; i<this.productos.length; i++) {
        if (this.productos[i].cantidad && this.productos[i].cantidad != "") {
          cantidad = true;
        }
      }
    }

    if (activo == true && cantidad == true) {
      console.log("activar el boton");
      this.btnDisabled = false;
    }
    else {
      console.log("desactivar el boton");
      this.btnDisabled = true;
    }
  }

  cerrar() {
    this.viewCtrl.dismiss();
  }

  guardar() {
    
  }

}
