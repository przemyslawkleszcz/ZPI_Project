import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-kanbanBoard',
  templateUrl: 'kanbanBoard.component.html',
  styleUrls: ['kanbanBoard.scss']
})
export class KanbanBoardComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public kanbanColumns: any;
  public kanbanData: any;
  public editItem: any;

  private id: any
  public item: any;
  private renamingEnabled: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, public db: AngularFirestore) {
    this.id = this.route.snapshot.params['id'];
    var doc = db.collection("Boards").doc(this.id);

    let subscription = doc.get().subscribe((doc) => {
      if (doc.exists)
        this.item = doc.data();
      else
        alert("No such document!");
    }, (error) => console.error(error));

    this.subscriptions.add(subscription);

    this.kanbanColumns = [
      { headerText: "Backlog", key: "Open" },
      { headerText: "In Progress", key: "InProgress" },
      { headerText: "Testing", key: "Testing" },
      { headerText: "Done", key: "Close" },
      { headerText: "Sratatata", key: "Sratatata" }
    ];

    this.kanbanData = [
      { Id: 1, RankId: 1, Status: "Open", Summary: "Analyze the new requirements gathered from the customer.", Assignee: "Nancy" },
      { Id: 2, RankId: 1, Status: "InProgress", Summary: "Improve application performance", Assignee: "Andrew" },
      { Id: 3, RankId: 1, Status: "Open", Summary: "Arrange a web meeting with the customer to get new requirements.", Assignee: "Janet" },
      { Id: 4, RankId: 1, Status: "InProgress", Summary: "Fix the issues reported in the IE browser.", Assignee: "Janet" },
      { Id: 5, RankId: 1, Status: "InProgress", Summary: "Fix the issues reported in the XXXXE browser.", Assignee: "Janet" },
      { Id: 6, RankId: 1, Status: "Sratatata", Summary: "Fix the issues reported by the customer.", Assignee: "Steven" }];

    this.editItem = [
      { field: 'Id' },
      { field: 'RankId' },
      { field: 'Status', editType: ej.Kanban.EditingType.Dropdown },
      { field: 'Assignee', editType: ej.Kanban.EditingType.Dropdown },
      { field: 'Estimate', editType: ej.Kanban.EditingType.Numeric, editParams: { decimalPlaces: 2 } },
      { field: 'Summary', editType: ej.Kanban.EditingType.TextArea, editParams: { height: 100, width: 400 } }
    ];
  }

  deleteBoard() {
    let self = this;
    this.db.collection("Boards").doc(this.id).delete().then(function () {
      self.router.navigate(['/kanban']);
    }).catch(function (error) {
      console.log(error);
      alert("Error removing document");
    });
  }

  changeBoardName() {
    var board = this.db.collection('Boards').doc(this.id);
    board.set({ Name: this.item.Name }, { merge: true });
    this.enableOrDisableRenaming(false);
  }

  enableOrDisableRenaming(enabled) {
    this.renamingEnabled = enabled;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
