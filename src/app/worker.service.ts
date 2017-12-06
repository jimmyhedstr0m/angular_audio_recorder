import { Injectable } from '@angular/core';

@Injectable()
export class WorkerService {

  constructor() { }

  public execute(func: Function): any {
    const blobContent = [func.toString(), `;this.onmessage = function(e) {${func.name}(e.data);}`];
    const blob = new Blob(blobContent, { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker: any = new Worker(url);
    worker.url = url;
    return worker;
  }

}
