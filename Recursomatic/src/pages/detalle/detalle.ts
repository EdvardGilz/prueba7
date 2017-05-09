import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the Detalle page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-detalle',
  templateUrl: 'detalle.html',
})
export class Detalle {
  public data;

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController) {
    this.data = navParams.get('data');
    console.log(this.data);
  }

  volver() {
    this.viewCtrl.dismiss();
  }

}
