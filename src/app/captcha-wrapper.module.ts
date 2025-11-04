import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  imports: [CommonModule, NgxCaptchaModule],
  exports: [NgxCaptchaModule]
})
export class CaptchaWrapperModule {}