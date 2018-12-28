import { Component, OnDestroy } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.component.html',
  styleUrls: ['statistics.scss']
})
export class StatisticsComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public email: string;
  public boards: any[];

  constructor(private db: AngularFirestore) {
    this.email = firebase.auth().currentUser.email;
    let subscription = db.collection("Boards")
      .get()
      .subscribe(x => {
        const boards = x.docs.map(y => {
          const data = y.data();
          return data;
        }).filter(a => {
          if ((<any>a).Members.indexOf(this.email) < 0)
            return false;
          else
            return true;
        });

        this.boards = boards;
      });

    this.subscriptions.add(subscription);
  }

  getListName(board, listId) {
    let list = board.Lists.find(x => x.key == listId);
    return list.headerText;
  }

  computeDays(card) {
    return Math.floor((Date.parse(card.End) - Date.parse(card.Start)) / 86400000);
  }

  getDataSource(cards) {
    return cards.map(x => {
      x.Days = this.computeDays(x);
      return x;
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
