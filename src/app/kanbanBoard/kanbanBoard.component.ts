import { Component, OnDestroy, ViewChild, IterableDiffers } from '@angular/core';
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

  // public kanbanData: any;
  public editItem: any;

  private id: any
  public item: any;
  private renamingEnabled: boolean = false;
  listRenamingEnabled = false;
  private listAddingEnabled: boolean = false;

  private fieldsdata: any;

  isCollapsed = true;
  listName = '';
  iterableDiffer: any;

  constructor(private route: ActivatedRoute, private router: Router, public db: AngularFirestore, private _iterableDiffers: IterableDiffers) {
    this.id = this.route.snapshot.params['id'];
    var doc = db.collection("Boards").doc(this.id);
    this.iterableDiffer = this._iterableDiffers.find([]).create(null);

    let subscription = doc.get().subscribe((doc) => {
      if (doc.exists)
        this.item = doc.data();
      else
        alert("No such document!");
    }, (error) => console.error(error));

    this.subscriptions.add(subscription);
    this.fieldsdata = { "text": "headerText" };

    this.editItem = [
      { field: 'Id' },
      { field: 'ListId', editType: ej.Kanban.EditingType.Dropdown },
      { field: 'Assignee', editType: ej.Kanban.EditingType.Dropdown },
      { field: 'Title', editType: ej.Kanban.EditingType.String },
      { field: 'Summary', editType: ej.Kanban.EditingType.TextArea, editParams: { height: 100, width: 400 } },
      { field: 'Start', editType: ej.Kanban.EditingType.DateTimePicker },
      { field: 'End', editType: ej.Kanban.EditingType.DateTimePicker },
    ];
  }

  beginEdit(e) {
    console.log("asdasd");
    $('#defaultkanban_ListId').addClass('e-disable');
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

  syncCards(e: any) {
    var board = this.db.collection('Boards').doc(this.id);
    board.set({ Cards: this.item.Cards }, { merge: true });
  }

  deleteBoardList() {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    this.listView.widget.removeItem(index);
    this.reassignColumns(this.item.Lists);
    this.updateBoardList();
  }

  createList() {
    let list = { key: UUID.UUID(), headerText: this.listName };
    this.listView.widget.addItem(list, 0);
    if (this.item.Lists < 1)
      this.item.Lists.push(list);

    this.listAddingEnabled = false;
    this.reassignColumns(this.item.Lists);
    this.updateBoardList();
  }

  changeListName() {
    let index = this.listView.widget.selectedItemIndex();
    if (index == -1)
      return;

    this.item.Lists[index].headerText = this.listName;
    this.listView.widget._load();
    this.listRenamingEnabled = false;
    this.reassignColumns(this.item.Lists);
    this.updateBoardList();
  }

  enableOrDisableRenaming(enabled) {
    this.renamingEnabled = enabled;
  }

  enableOrDisableListAdding(enabled) {
    this.listAddingEnabled = enabled;
  }

  createCard() {
    this.item.Cards.push({ Id: UUID.UUID(), RankId: 1, ListId: this.item.Lists[0].key, Summary: "New card", Title: "Title", Assignee: "Nancy", Start: new Date(), End: new Date() })
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
