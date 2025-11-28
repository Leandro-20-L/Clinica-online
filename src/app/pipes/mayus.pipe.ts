import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mayus'
})
export class MayusPipe implements PipeTransform {

  transform(v: string) { return v?.toUpperCase() ?? ''; }

}
