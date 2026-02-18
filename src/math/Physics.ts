import { AppState } from '../types';

export class Physics {
    static getNetVolume(s: AppState): number {
        // Convertir grosor de mm a cm
        const thCm = s.thickness / 10;
        
        // Descuento de paredes (asumiendo caja simple por ahora)
        // Paredes dobles para ancho, alto y profundidad
        const iw = s.width - (thCm * 2);
        const ih = s.height - (thCm * 2);
        const id = s.depth - (thCm * 2);

        if (iw <= 0 || ih <= 0 || id <= 0) return 0;

        let grossVol = (iw * ih * id) / 1000; // Litros

        // Descuento aproximado por desplazamiento del driver (estimación simple)
        // V_driver approx = Cilindro (Radio * 0.5 profundidad)
        const driverRadius = (s.driver.sizeInch * 2.54) / 2;
        const driverDisp = (Math.PI * Math.pow(driverRadius, 2) * 15) / 1000; // Asumiendo 15cm de profundidad promedio
        
        const totalDisp = driverDisp * s.driver.count;

        return Math.max(0, grossVol - totalDisp);
    }

    static getPortLength(s: AppState, vol: number): number {
        if (vol <= 0 || s.topology === 'sealed') return 0;
        
        const r = s.portDiam / 2;
        const area = Math.PI * r * r;
        
        // Helmholtz
        const c = 34300; // cm/s (velocidad sonido)
        const term1 = (c * c * area);
        const term2 = 4 * Math.PI * Math.PI * (s.tuningFreq ** 2) * (vol * 1000); // Vol en cm3
        
        let l = (term1 / term2) - (0.82 * s.portDiam); // Corrección final
        return l > 0 ? l : 0;
    }
}

