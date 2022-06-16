import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    return this.checkAdmin();
  }

  checkAdmin(): boolean {
    let ifAdmin=sessionStorage.getItem('role');
    if (ifAdmin=='Admin') { return true; }

    this.router.navigate(['/not-acces']);
    return false;
  }
}
