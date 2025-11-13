import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

    constructor() { }

    mostrarSpinner() {
        const spinner = document.createElement('div');
        spinner.id = 'spinner';
        spinner.style.position = 'fixed';
        spinner.style.top = '0';
        spinner.style.left = '0';
        spinner.style.width = '100%';
        spinner.style.height = '100%';
        spinner.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'; 
        spinner.style.display = 'flex';
        spinner.style.alignItems = 'center';
        spinner.style.justifyContent = 'center';
        spinner.style.color = 'white';
        spinner.style.fontSize = '24px';
        spinner.style.zIndex = '1000'; 

        const texto = document.createElement('div');
        texto.textContent = '...'; 
        spinner.appendChild(texto);

        document.body.appendChild(spinner);
    }

    ocultarSpinner() {
        const spinner = document.getElementById('spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}
