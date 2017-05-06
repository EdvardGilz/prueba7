import { Component } from '@angular/core';
import { AlertController, ActionSheetController, Platform, ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';

import { Resumen } from '../resumen/resumen';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public accion = "proyecto";
  public proyectos = [];
  public productos = [];
  public subscription;

  constructor(public alertCtrl: AlertController,
              public storage: Storage,
              public actionSheetCtrl: ActionSheetController,
              public platform: Platform,
              public modalCtrl: ModalController) {
    
    this.storage.ready().then(() => {
      this.storage.get("proyectos").then((data) => {
        if (data != null) {
          this.proyectos = data;
        }
      });
      this.storage.get("productos").then((data) => {
        if (data != null) {
          this.productos = data;
        }
      });
    });
  }

  nuevo() {
    if (this.accion == "proyecto") {
      this.nuevoProyecto();
    }
    else if (this.accion == "stock") {
      this.nuevoProducto();
    }
  }

  nuevoProyecto() {
    let prompt = this.alertCtrl.create({
      title: "Nuevo Proyecto",
      inputs: [
        {
          name: "nombre",
          placeholder: "Nombre del proyecto",
          type: "text"
        }
      ],
      buttons: [
        {
          text: "Cancelar",
          role: "cancel"
        },
        {
          text: "Aceptar",
          handler: data => {
            if (data.nombre != "") {
              this.storage.get("proyectos").then((res) => {
                if (res != null) {
                  this.proyectos = res;
                  this.proyectos.unshift({"nombre": data.nombre, "cuenta": 0, "start": false, "tiempo": "00:00:00", "color": "danger", "icono": "radio-button-off"});
                  this.storage.set("proyectos", this.proyectos);
                }
                else {
                  this.proyectos.unshift({"nombre": data.nombre, "cuenta": 0, "start": false, "tiempo": "00:00:00", "color": "danger", "icono": "radio-button-off"});
                  this.storage.set("proyectos", this.proyectos);
                }
              })
              .then(() => {
                this.stop(1);
              });
            }
          }
        }
      ]
    });

    prompt.present();
  }

  start(proyecto) {
    this.stop(0);
    var i = proyecto.cuenta;
    if (proyecto.start == false) {
      proyecto.start = true;
      this.subscription = Observable.interval(1000).subscribe(() => {
        i++;
        var numdays = Math.floor(i / 86400);
        var dias = "";

        if (numdays >= 1) {
          dias = "" + numdays;
        }
        proyecto.tiempo = dias + " " + new Date(i * 1000).toISOString().substr(11, 8);
        proyecto.cuenta = i;
        this.storage.set("proyectos", this.proyectos);
      });
      proyecto.color = "secondary";
      proyecto.icono = "radio-button-on";
    }
    else {
      this.stop(0);
      proyecto.start = false;
    }
  }

  stop(ban) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    for (var j=0; j<this.proyectos.length; j++) {
      this.proyectos[j].color = "danger";
      this.proyectos[j].icono = "radio-button-off";
      if (ban == 1) {
        this.proyectos[j].start = false;
      }
    }
    this.storage.set("proyectos", this.proyectos);
  }

  eliminar(index) {
    if (this.proyectos.length > 1) {
      this.proyectos.splice(index, 1);
    }
    else {
      this.proyectos = [];
    }

    this.storage.set("proyectos", this.proyectos);
  }

  terminarP(proyecto) {
    this.stop(0);
    proyecto.start = false;

    let modal = this.modalCtrl.create(Resumen, {"proyecto": proyecto, "productos": this.productos});
    modal.present();
  }

  nuevoProducto() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: "Por metro",
          icon: !this.platform.is('ios') ? 'infinite' : null,
          handler: () => {
            this.agregarNuevo(0);
          }
        },
        {
          text: "Por pieza",
          icon: !this.platform.is('ios') ? 'pie' : null,
          handler: () => {
            this.agregarNuevo(1);
          }
        },
        {
          text: "Cancelar",
          role: "cancel",
          icon: !this.platform.is('ios') ? 'close' : null,
        }
      ]
    });

    actionSheet.present();
  }

  agregarNuevo(ban) {
    var pzasTxt;
    var precioTxt;
    var txt1;
    var txt2;

    if (ban == 0) {
      pzasTxt = "Metros";
      precioTxt = "Precio por metro";
      txt1 = "m";
      txt2 = "el metro";
    }
    else {
      pzasTxt = "Piezas";
      precioTxt = "Precio por pieza";
      txt1 = "pzas";
      txt2 = "la pieza";
    }

    let prompt = this.alertCtrl.create({
      title: "Nuevo Producto",
      inputs: [
        {
          name: "pzas",
          placeholder: pzasTxt,
          type: "number"
        },
        {
          name: "nombre",
          placeholder: "Nombre del producto",
          type: "text"
        },
        {
          name: "precio",
          placeholder: precioTxt,
          type: "number"
        }
      ],
      buttons: [
        {
          text: "Cancelar",
          role: "cancel"
        },
        {
          text: "Aceptar",
          handler: data => {
            if (data.pzas != "" && data.nombre != "" && data.precio != "") {
              this.storage.get("productos").then((res) => {
                if (res != null) {
                  this.productos = res;
                  this.productos.unshift({"pzas": data.pzas, "nombre": data.nombre, "precio": data.precio, "txt1": txt1, "txt2": txt2, "tipo": ban, "activo": false});
                  this.storage.set("productos", this.productos);
                }
                else {
                  this.productos.unshift({"pzas": data.pzas, "nombre": data.nombre, "precio": data.precio, "txt1": txt1, "txt2": txt2, "tipo": ban, "activo": false});
                  this.storage.set("productos", this.productos);
                }
              });
            }
          }
        }
      ]
    });

    prompt.present();
  }

  eliminarP(index) {
    if (this.productos.length > 1) {
      this.productos.splice(index, 1);
    }
    else {
      this.productos = [];
    }

    this.storage.set("productos", this.productos);
  }

}
