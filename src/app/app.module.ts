import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { RecordingService } from './recording.service';
import { WorkerService } from './worker.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    RecordingService,
    WorkerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
