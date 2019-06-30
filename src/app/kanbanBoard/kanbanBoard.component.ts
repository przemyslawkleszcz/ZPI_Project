import { Component, OnDestroy, ViewChild, IterableDiffers } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';

@Component({
  selector: 'page-kanbanBoard',
  templateUrl: 'kanbanBoard.component.html',
  styleUrls: ['kanbanBoard.scss']
})
export class KanbanBoardComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  @ViewChild('listview', {static: false}) listView: any;
  @ViewChild('kanban', {static: false}) kanban: any;

  public editItem: any;

  private id: any
  public item: any;
  private renamingEnabled: boolean = false;
  listRenamingEnabled = false;
  inviteEnabled = false;
  invitationEmail = '';

  private listAddingEnabled: boolean = false;

  private fieldsdata: any;

  isCollapsed = true;
  listName = '';
  iterableDiffer: any;

  constructor(private route: ActivatedRoute, private router: Router, public db: AngularFirestore, private _iterableDiffers: IterableDiffers) {
    this.id = this.route.snapshot.params['id'];
    let doc = db.collection("Boards").doc(this.id);
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
      { field: 'Title', editType: ej.Kanban.EditingType.String },
      { field: 'Summary', editType: ej.Kanban.EditingType.TextArea, editParams: { height: 100, width: 400 } },
      { field: 'Start', editType: ej.Kanban.EditingType.DatePicker },
      { field: 'End', editType: ej.Kanban.EditingType.DatePicker },
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
    let board = this.db.collection('Boards').doc(this.id);
    board.set({ Name: this.item.Name }, { merge: true });
    this.enableOrDisableRenaming(false);
  }

  updateBoardList() {
    let board = this.db.collection('Boards').doc(this.id);
    board.set({ Lists: this.item.Lists }, { merge: true });
  }

  syncCards(e: any) {
    let board = this.db.collection('Boards').doc(this.id);
    let todoLists = this.item.Lists.filter((element) => element.headerText == "TODO");
    if (todoLists.length > 0)
      this.handleBurnDown(todoLists, board);
    else
      board.set({ Cards: this.item.Cards, BurnState: "", BurnValues: null }, { merge: true });
  }

  handleBurnDown(todoLists, board) {
    let todoList = todoLists[0];
    let todoItemKey = todoList.key;
    let todoCards = this.item.Cards.filter((element) => element.ListId == todoItemKey);
    let startDates = todoCards.map(c => c.Start);
    let endDates = todoCards.map(c => c.End);

    let startDatesSorted = startDates.sort((a, b) => {
      return b - a;
    });

    let endDatesSorted = endDates.sort((a, b) => {
      return b - a;
    });

    let min = startDatesSorted[startDatesSorted.length - 1];
    let max = endDatesSorted[0];
    let days = this.computeDays(max, min);

    let date = new Date();
    let currentMonth = date.getMonth();
    let firstDay = new Date(date.getFullYear(), currentMonth, 1);
    let lastDay = new Date(date.getFullYear(), currentMonth + 1, 0);

    let dates;
    let burnState = moment(date).format('YYYY-MM')
    let monthTag = moment(date).format('DD')

    if (this.item.BurnValues == null || this.item.BurnState != burnState)
      dates = this.getDates(firstDay, lastDay, days);
    else {
      for (let i = 0; i < this.item.BurnValues.length; i++)
        if (this.item.BurnValues[i].date == monthTag)
          this.item.BurnValues[i].value = days;

      dates = this.item.BurnValues;
    }

    board.set({ Cards: this.item.Cards, BurnState: burnState, BurnValues: dates }, { merge: true });
  }

  getDates(start, stop, burnValue) {
    let dateArray = [];
    let currentDate = moment(start);
    let stopDate: any = moment(stop);
    let todaysDate = moment(new Date());
    while (currentDate <= stopDate) {
      if (currentDate.format('DD') == todaysDate.format('DD'))
        dateArray.push({ date: moment(currentDate).format('DD'), value: burnValue })
      else
        dateArray.push({ date: moment(currentDate).format('DD'), value: 0 })

      currentDate = moment(currentDate).add(1, 'days');
    }

    return dateArray;
  }

  computeDays(end, start) {
    return Math.floor((end - start) / 86400000) + 1;
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

  enableOrDisableInvite(enabled) {
    this.inviteEnabled = enabled;
  }

  sendInvitation() {
    if (this.invitationEmail == null || this.invitationEmail.trim().length == 0) {
      return;
    }

    this.item.Members.push(this.invitationEmail);
    let board = this.db.collection('Boards').doc(this.id);
    board.set({ Members: this.item.Members }, { merge: true });
    this.inviteEnabled = false;
  }

  enableOrDisableListAdding(enabled) {
    this.listAddingEnabled = enabled;
  }

  createCard() {
    this.item.Cards.push({ Id: UUID.UUID(), RankId: 1, ListId: this.item.Lists[0].key, Summary: "", Title: "Enter a card title", Start: new Date(), End: new Date() })
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
    (<any>$(this.kanban.widget.element)).ejKanban({
      columns: [],
    });

    (<any>$(this.kanban.widget.element)).ejKanban({
      columns: this.item.Lists,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
