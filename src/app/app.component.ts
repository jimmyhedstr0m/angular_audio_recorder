import { Component } from '@angular/core';
import { RecorderService } from './core-audio/recorder/recorder.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'app';

  constructor(private recorderService: RecorderService) { }

  start() {
    this.recorderService.start();
  }

  stop() {
    this.recorderService.stop();
  }
}
