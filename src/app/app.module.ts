import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CoreAudioModule } from './core-audio';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreAudioModule
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
