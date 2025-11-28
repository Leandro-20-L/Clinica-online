import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appInputError]'
})
export class InputErrorDirective {

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.transition = '0.2s';
  }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;

    if (!input.value || input.validity?.valid === false) {
      input.style.border = '2px solid red';
    } else {
      input.style.border = '2px solid #4caf50'; 
    }
  }

}
