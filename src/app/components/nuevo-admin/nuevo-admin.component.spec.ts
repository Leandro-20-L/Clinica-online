import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoAdminComponent } from './nuevo-admin.component';

describe('NuevoAdminComponent', () => {
  let component: NuevoAdminComponent;
  let fixture: ComponentFixture<NuevoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
