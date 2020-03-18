import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';

import { AppComponent } from './app.component';
import { NumericTextBoxModule } from '@progress/kendo-angular-inputs';
import { FiltersSelectComponent } from './filters-select/filters-select.component';

@NgModule({
  imports: [ BrowserModule, BrowserAnimationsModule, FormsModule, GridModule, NumericTextBoxModule, ReactiveFormsModule ],
  declarations: [ AppComponent, FiltersSelectComponent ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
