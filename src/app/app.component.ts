import { Component } from '@angular/core';
import { RecordingService } from './recording.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'app';

  constructor(private recordingService: RecordingService) { }

  start() {
    this.recordingService.start();
  }

  stop() {
    this.recordingService.stop();
  }
}
