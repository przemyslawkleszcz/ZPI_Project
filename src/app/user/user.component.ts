import { Component } from '@angular/core';

@Component({
  selector: 'page-user',
  templateUrl: 'user.component.html',
  styleUrls: ['user.scss']
})
export class UserComponent {
  public kanbanData: any;
  constructor() {
    this.kanbanData = [
      { Id: 1, Status: "Open", Summary: "Analyze the new requirements gathered from the customer.", Assignee: "Nancy" },
      { Id: 2, Status: "InProgress", Summary: "Improve application performance", Assignee: "Andrew" },
      { Id: 3, Status: "Open", Summary: "Arrange a web meeting with the customer to get new requirements.", Assignee: "Janet" },
      { Id: 4, Status: "InProgress", Summary: "Fix the issues reported in the IE browser.", Assignee: "Janet" },
      { Id: 5, Status: "Testing", Summary: "Fix the issues reported by the customer.", Assignee: "Steven" }];
  }
}
