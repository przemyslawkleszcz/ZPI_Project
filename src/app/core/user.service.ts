import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class UserService {
  public user: any;
  constructor(public db: AngularFirestore, public afAuth: AngularFireAuth) { }
  getCurrentUser() {
    var self = this;
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          self.user = user;
          resolve(user);
        } else {
          self.user = null;
          reject('Brak zalogowanego użytkownika');
        }
      })
    })
  }

  updateCurrentUser(value) {
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.name,
        photoURL: user.photoURL
      }).then(res => {
        resolve(res)
      }, err => reject(err))
    })
  }
}
