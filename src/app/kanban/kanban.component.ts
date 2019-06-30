import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-kanban',
  templateUrl: 'kanban.component.html',
  styleUrls: ['kanban.scss']
})
export class KanbanComponent {
  public kanbanData: any;
  public boardName: string;
  public items: any;
  public email: string;

  constructor(private db: AngularFirestore) {
    this.boardName = "Enter name of a new board";
    this.email = firebase.auth().currentUser.email;

    this.items = db.collection("Boards")
      .snapshotChanges()
      .pipe(map(actions => {
        return actions.filter(a => {
          const data = a.payload.doc.data();
          let members = (<any>data).Members;
          if (members.indexOf(this.email) < 0)
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

  addBoard(e) {
    this.db.collection("Boards").add({ Name: this.boardName, Lists: [], Cards: [], Members: [this.email], BurnState: "", BurnValues: null });
  }

  resolveName(name) {
    return { text: name };
  }
}
