import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'page-kanbanBoard',
  templateUrl: 'kanbanBoard.component.html',
  styleUrls: ['kanbanBoard.scss']
})
export class KanbanBoardComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  @ViewChild('listview') listView: any;
  @ViewChild('kanban') kanban: any;

  public kanbanData: any;
  public editItem: any;

  private id: any
  public item: any;
  private renamingEnabled: boolean = false;
  private fieldsdata: any;

  isCollapsed = true;
  listName = '';
  listRenamingEnabled = false;

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

    this.fieldsdata = { "text": "headerText" };
    this.kanbanData = [
      { Id: 1, RankId: 1, Status: "vvvvv", Summary: "Analyze the new requirements gathered from the customer.", Assignee: "Nancy" },
      { Id: 2, RankId: 1, Status: "vvvvv", Summary: "Improve application performance", Assignee: "Andrew" },
      { Id: 3, RankId: 1, Status: "KUovDERjgOS1tYVJtJQT", Summary: "Arrange a web meeting with the customer to get new requirements.", Assignee: "Janet" },
      { Id: 4, RankId: 1, Status: "KUovDERjgOS1tYVJtJQT", Summary: "Fix the issues reported in the IE browser.", Assignee: "Janet" },
      { Id: 5, RankId: 1, Status: "KUovDERjgOS1tYVJtJQT", Summary: "Fix the issues reported in the XXXXE browser.", Assignee: "Janet" },
      { Id: 6, RankId: 1, Status: "KUovDERjgOS1tYVJtJQT", Summary: "Fix the issues reported by the customer.", Assignee: "Steven" }
    ];

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

  updateBoardList() {
    var board = this.db.collection('Boards').doc(this.id);
    board.set({ Lists: this.item.Lists }, { merge: true });
  }

  deleteBoardList() {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    
    this.item.Lists.splice(index, 1);
    this.listView.widget.removeItem(index);
    this.reassignColumns(this.item.Lists);
    this.updateBoardList();
  }

  changeListName() {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    this.item.Lists[index].headerText = this.listName;
    this.listRenamingEnabled = false;
    this.reassignColumns(this.item.Lists);
    this.reasignListView(this.item.Lists);
    this.updateBoardList();
  }

  enableOrDisableRenaming(enabled) {
    this.renamingEnabled = enabled;
  }

  enableOrDisableListRenaming(enabled) {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    this.listName = this.item.Lists[index].headerText;
    this.listRenamingEnabled = enabled;
  }

  moveDown() {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    let currentItem = this.item.Lists[index];
    if ((index + 1) >= this.item.Lists.length)
      return;

    this.item.Lists[index] = this.item.Lists[index + 1];
    this.item.Lists[index + 1] = currentItem;
    this.reassignColumns(this.item.Lists);
    this.listView.widget.selectItem(index + 1);
    this.updateBoardList();
  }

  moveUp() {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    let currentItem = this.item.Lists[index];
    if ((index - 1) < 0)
      return;

    this.item.Lists[index] = this.item.Lists[index - 1];
    this.item.Lists[index - 1] = currentItem;
    this.reassignColumns(this.item.Lists);
    this.listView.widget.selectItem(index - 1);
    this.updateBoardList();
  }

  reassignColumns(columns) {
    $(this.kanban.widget.element).ejKanban({
      columns: [],
    });

    $(this.kanban.widget.element).ejKanban({
      columns: this.item.Lists,
    });
  }

  reasignListView(dataSource) {
    $(this.listView.widget.element).ejListView({
      dataSource: dataSource
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
