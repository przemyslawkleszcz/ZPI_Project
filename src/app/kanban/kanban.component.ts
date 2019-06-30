import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BoardsService } from "../services/boards.service";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-kanban',
  templateUrl: 'kanban.component.html',
  styleUrls: ['kanban.scss']
})
export class KanbanComponent implements OnInit {
  public kanbanData: any;
  public boardName: string;
  public items: any;
  public email: string;

  constructor(private db: AngularFirestore, private boardsService: BoardsService) {
    this.boardName = "Enter name of a new board";
    this.email = firebase.auth().currentUser.email;
  }

  ngOnInit(): void {
    this.items = this.boardsService.getBoards();
  }

  addBoard(e) {
    this.db.collection("Boards").add({ Name: this.boardName, Lists: [], Cards: [], Members: [this.email], BurnState: "", BurnValues: null });
  }

  resolveName(name) {
    return { text: name };
  }
}
