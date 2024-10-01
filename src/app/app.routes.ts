import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
    {path: 'documentation', loadChildren: ()=> import('../documentation/documentation.module').then(m=>m.DocumentationModule)},
    {path: 'demo', loadChildren: ()=> import('../demo/demo.module').then(m=>m.DemoModule)}
];

export const appRoutingProviders: any[] = [
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
