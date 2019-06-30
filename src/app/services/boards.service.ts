import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {
  constructor(private db: AngularFirestore) { }

  getBoards() {
    const email = firebase.auth().currentUser.email;
    return this.db.collection("Boards")
      .snapshotChanges()
      .pipe(map(actions => {
        return actions.filter(a => {
          const data = a.payload.doc.data();
          let members = (<any>data).Members;
          if (members.indexOf(email) < 0)
            return false;
          else
            return true;
        }).map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      }));
  }
}
