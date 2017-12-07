import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { RecorderService } from './core-audio/recorder/recorder.service';
import { WorkerService } from './core-audio/worker/worker.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    RecorderService,
    WorkerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
