import { Component, ViewEncapsulation } from '@angular/core';
import { UserService } from './core/user.service';
import { AuthService } from './core/auth.service';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  constructor(public db: AngularFirestore, public userService: UserService, public authService: AuthService, private location: Location) {
    const settings = { timestampsInSnapshots: false };
    db.firestore.settings(settings);
  }

  title = 'zpi-project';
  isCollapsed = true;

  logout() {
    this.authService.doLogout()
      .then((res) => {
        this.location.back();
      }, (error) => {
        console.log("Logout error", error);
      });
  }
}