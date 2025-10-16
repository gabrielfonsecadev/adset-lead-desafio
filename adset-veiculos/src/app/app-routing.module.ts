import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VeiculoListaComponent } from './components/veiculo-lista/veiculo-lista.component';
import { VeiculoFormComponent } from './components/veiculo-form/veiculo-form.component';

const routes: Routes = [
  { path: '', component: VeiculoListaComponent },
  { path: 'cadastro', component: VeiculoFormComponent },
  { path: 'cadastro/:id', component: VeiculoFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
