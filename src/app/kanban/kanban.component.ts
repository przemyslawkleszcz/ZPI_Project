import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'page-kanban',
  templateUrl: 'kanban.component.html',
  styleUrls: ['kanban.scss']
})
export class KanbanComponent {
  public kanbanData: any;
  public boardName: string;
  public items: any;

  constructor(private db: AngularFirestore) {
    this.boardName = "Enter name of a new board";

    this.items = db.collection("Boards")
      .snapshotChanges()
      .pipe(map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      }));
  }

  addBoard(e) {
    this.db.collection("Boards").add({ Name: this.boardName });
  }

  resolveName(name) {
    return { text: name };
  }
}
