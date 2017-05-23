import { Component } from '@angular/core';
import { AlertController, ActionSheetController, Platform, ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { BackgroundMode } from '@ionic-native/background-mode';

import { Resumen } from '../resumen/resumen';
import { Detalle } from '../detalle/detalle';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public accion = "proyecto";
  public proyectos = [];
  public productos = [];
  public historial = [];
  public subscription;

  constructor(public alertCtrl: AlertController,
              public storage: Storage,
              public actionSheetCtrl: ActionSheetController,
              public platform: Platform,
              public modalCtrl: ModalController,
              public backgroundMode: BackgroundMode) {
    
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
      this.storage.get("historial").then((data) => {
        if (data != null) {
          this.historial = data;
        }
      });
    });

    !this.platform.is('ios') ? this.backgroundMode.overrideBackButton() : null
  }

  verificarProductos() {
    var temp = [];
    for (var i=0; i<this.productos.length; i++) {
      if (this.productos[i].pzas > 0) {
        temp.push(this.productos[i]);
      }
    }
    this.storage.set("productos", temp);
    this.productos = temp;
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
      this.backgroundMode.enable();
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
      this.backgroundMode.disable();
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

  terminarP(proyecto, index) {
    var cont = [];
    var precioTotal;
    var Total = 0;

    this.stop(0);
    proyecto.start = false;

    let modal = this.modalCtrl.create(Resumen, {"proyecto": proyecto, "productos": this.productos});
    modal.onDidDismiss(data => {
      if (data != null) {
        if (data.success == 1) {
          for (var i=0; i<data.data.length; i++) {
            var prod = this.productos[data.data[i].index];
            
            if (prod.tipo == 1) {
              prod.pzas = prod.pzas - parseInt(prod.cantidad);
              precioTotal = (parseInt(prod.cantidad) * parseFloat(prod.precio)).toFixed(2);
              cont.push({"total": precioTotal, "nombre": prod.nombre, "precio": prod.precio, "txt1": prod.txt1, "txt2": prod.txt2, "cantidad": parseInt(prod.cantidad), "tipo": prod.tipo});
            }
            else {
              prod.m2 = parseFloat(( ((prod.m2 * 100) - (prod.cantidad * 100)) / 100).toFixed(3));
              precioTotal = (((prod.cantidad * 100) * parseFloat(prod.precio))/100).toFixed(2);
              cont.push({"total": precioTotal, "nombre": prod.nombre, "precio": prod.precio, "txt1": prod.txt1, "txt2": prod.txt2, "cantidad": parseFloat(prod.cantidad), "tipo": prod.tipo});
            }
            this.storage.set("productos", this.productos);
            Total += parseFloat(precioTotal);
          }

          this.historial.unshift({"proyecto": proyecto.nombre, "tiempo": proyecto.tiempo, "total": Total, "recursos": cont});
          this.resumen(Total, proyecto.tiempo);

          this.storage.set("historial", this.historial);
          this.verificarProductos();
          this.eliminar(index);
        }
      }
    });
    modal.present();
  }

  resumen(Total, tiempo) {
    var t = tiempo.split(" ")[1];
    var dias;
    var horas;
    var minutos;

    if (tiempo.split(" ")[0] == "") {
      dias = 0 + " dias ";
    }
    else {
      if (parseInt(tiempo.split(" ")[0]) > 1) {
        dias = tiempo.split(" ")[0] + " dias ";
      }
      else {
        dias = tiempo.split(" ")[0] + " dia ";
      }
    }

    if (parseInt(t.split(":")[0]) > 1 || parseInt(t.split(":")[0]) == 0) {
      horas = parseInt(t.split(":")[0]) + " horas ";
    }
    else {
      horas = parseInt(t.split(":")[0]) + " hora ";
    }

    if (parseInt(t.split(":")[1]) > 1 || parseInt(t.split(":")[1]) == 0) {
      minutos = "y " + parseInt(t.split(":")[1]) + " minutos";
    }
    else {
      minutos = "y " + parseInt(t.split(":")[1]) + " minuto";
    }

    let alert = this.alertCtrl.create({
      title: "Total invertido",
      message: "Invertiste $" + Total + " en materiales para este proyecto y " + dias + horas + minutos,
      buttons: ['OK']
    });
    alert.present();
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
      pzasTxt = "Largo";
      precioTxt = "Precio total";
      txt1 = "m";
      txt2 = "";
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
          name: "nombre",
          placeholder: "Nombre del producto",
          type: "text"
        },
        {
          name: "pzas",
          placeholder: pzasTxt,
          type: "number"
        }
      ]
    });

    if (ban == 0) {
      prompt.addInput({
        name: "medida2",
        placeholder: "Ancho",
        type: "number"
      });
    }

    prompt.addInput({
      name: "precio",
      placeholder: precioTxt,
      type: "number"
    });

    prompt.addInput({
      name: "lugarCompra",
      placeholder: "Lugar de compra (Opcional)",
      type: "text"
    });

    prompt.addButton({
      text: "Cancelar",
      role: "cancel"
    });

    prompt.addButton({
      text: "Aceptar",
      handler: data => {
        var medida2 = 0;
        var m2 = "";
        if (data.pzas != "" && data.nombre != "" && data.precio != "") {
          this.storage.get("productos").then((res) => {
            var piezas;
            if (ban == 0) {
              if (data.medida2 != "") {
                piezas = parseFloat(data.pzas);
                medida2 = parseFloat(data.medida2);
                m2 = (piezas * medida2).toFixed(3);
              }
            }
            else {
              piezas = parseInt(data.pzas);
            }
            if (res != null) {
              this.productos = res;
              this.productos.unshift({"pzas": piezas, "medida2": medida2, "m2": parseFloat(m2), "nombre": data.nombre, "precio": data.precio, "txt1": txt1, "txt2": txt2, "tipo": ban, "activo": false, "lugarCompra": data.lugarCompra});
              this.storage.set("productos", this.productos);
            }
            else {
              this.productos.unshift({"pzas": piezas, "medida2": medida2, "m2": parseFloat(m2), "nombre": data.nombre, "precio": data.precio, "txt1": txt1, "txt2": txt2, "tipo": ban, "activo": false, "lugarCompra": data.lugarCompra});
              this.storage.set("productos", this.productos);
            }
          });
        }
      }
    });

    prompt.present();
  }

  modificar(producto) {
    var mensaje;
    var placeholder;

    if (producto.lugarCompra && producto.lugarCompra != "") {
      mensaje = producto.lugarCompra;
      placeholder = "Modificar";
    }
    else {
      mensaje = "No hay lugar de compra, ingresa uno."
      placeholder = "Ingresar (Opcional)";
    }
    let prompt = this.alertCtrl.create({
      title: "Lugar de compra",
      message: mensaje,
      inputs: [
        {
          name: "lugarCompra",
          type: "text",
          placeholder: placeholder
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
            if (data.lugarCompra != "") {
              producto.lugarCompra = data.lugarCompra;
              this.storage.set("productos", this.productos);
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

  detalle(data) {
    let modal = this.modalCtrl.create(Detalle, {data: data});
    modal.present();
  }

}
