import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
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
  private userUid: any;

  constructor(private db: AngularFirestore) {
    this.boardName = "Enter name of a new board";
    this.userUid = firebase.auth().currentUser.uid;
    this.items = db.collection("Boards")
      .snapshotChanges()
      .pipe(map(actions => {
        return actions.filter(a => {
          const data = a.payload.doc.data();
          let members = (<any>data).Members;
          if (members.indexOf(this.userUid) < 0)
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
    this.db.collection("Boards").add({ Name: this.boardName, Lists: [], Cards: [], Members: [] });
  }

  resolveName(name) {
    return { text: name };
  }
}
