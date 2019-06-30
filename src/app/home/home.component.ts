import { Component, OnInit } from '@angular/core';
import { BoardsService } from "../services/boards.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  numberOfBoards: number;
  numberOfTasks: number;

  constructor(private boardsService: BoardsService) { }

  ngOnInit() {
    this.boardsService.getBoards().subscribe(boards => {
      this.numberOfBoards = boards.length;
      this.numberOfTasks = boards
        .map(x => (<any>x.data).Cards.length)
        .reduce((previousValue, currentValue) => previousValue + currentValue);
    });
  }
}
