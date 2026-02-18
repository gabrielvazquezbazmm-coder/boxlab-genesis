interface Particle3D {
    // Posición actual (animada)
    x: number; y: number; z: number;
    // Posición objetivo (forma final de la caja)
    tx: number; ty: number; tz: number;
    // Velocidad (para explosión)
    vx: number; vy: number; vz: number;
    // Propiedades visuales
    color: string;
    baseSize: number;
    size: number;
    type: 'body' | 'driver' | 'tweeter';
}

export class ParticleEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle3D[] = [];
    private active: boolean = true;
    private isExploding: boolean = false;
    
    // Dimensiones y Centro
    private w = 0; private h = 0;
    private cx = 0; private cy = 0;

    // Variables de Rotación
    private angleY: number = 0;
    private rotationSpeed: number = 0.005; // Velocidad de giro

    constructor(id: string) {
        const el = document.getElementById(id);
        if(!el) throw new Error(`Canvas ${id} not found`);
        
        this.canvas = el as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initParticles();
        this.loop();
    }

    private resize() {
        this.w = this.canvas.width = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;
        this.cx = this.w / 2;
        this.cy = this.h / 2;
    }

    private initParticles() {
        this.particles = [];
        const gold = '197, 169, 110';
        const darkGold = '140, 110, 50';

        // --- DEFINICIÓN DE GEOMETRÍA 3D (La Caja) ---
        // Dimensiones virtuales de la caja de partículas
        const boxW = 220;
        const boxH = 360;
        const boxD = 180; // Profundidad

        // 1. GABINETE (Nube cúbica hueca)
        for(let i=0; i<1200; i++) {
            // Elegir una cara aleatoria para dar sensación de volumen
            const face = Math.floor(Math.random() * 6);
            let tx=0, ty=0, tz=0;

            const r1 = (Math.random() - 0.5) * boxW;
            const r2 = (Math.random() - 0.5) * boxH;
            const r3 = (Math.random() - 0.5) * boxD;

            switch(face) {
                case 0: tx=r1; ty=r2; tz=boxD/2; break; // Frente
                case 1: tx=r1; ty=r2; tz=-boxD/2; break; // Atrás
                case 2: tx=boxW/2; ty=r2; tz=r3; break; // Derecha
                case 3: tx=-boxW/2; ty=r2; tz=r3; break; // Izquierda
                case 4: tx=r1; ty=boxH/2; tz=r3; break; // Abajo
                case 5: tx=r1; ty=-boxH/2; tz=r3; break; // Arriba
            }
            
            this.addParticle(tx, ty, tz, gold, 'body');
        }

        // 2. WOOFER (Círculo en la cara frontal)
        for(let i=0; i<500; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 85; // Radio woofer
            
            const tx = Math.cos(angle) * r;
            const ty = 60 + Math.sin(angle) * r; // Desplazado hacia abajo
            const tz = boxD/2 + 2; // Un poco sobresaliente
            
            this.addParticle(tx, ty, tz, gold, 'driver');
        }

        // 3. TWEETER (Círculo pequeño frontal)
        for(let i=0; i<200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 30; // Radio tweeter
            
            const tx = Math.cos(angle) * r;
            const ty = -100 + Math.sin(angle) * r; // Desplazado hacia arriba
            const tz = boxD/2 + 2;

            this.addParticle(tx, ty, tz, darkGold, 'tweeter');
        }
    }

    private addParticle(tx: number, ty: number, tz: number, c: string, type: any) {
        // POSICIÓN INICIAL: Aleatoria fuera de la pantalla (Efecto de armado)
        const range = 2000;
        const startX = (Math.random() - 0.5) * range;
        const startY = (Math.random() - 0.5) * range;
        const startZ = (Math.random() - 0.5) * range;

        this.particles.push({
            x: startX, y: startY, z: startZ, // Empiezan lejos
            tx: tx, ty: ty, tz: tz,          // Van hacia aquí (Target)
            vx: 0, vy: 0, vz: 0,
            size: 0, // Empiezan invisibles
            baseSize: Math.random() * 2 + 1,
            color: c,
            type: type
        });
    }

    public triggerExplosion() {
        this.isExploding = true;
        
        this.particles.forEach(p => {
            // Calcular vector de explosión desde el centro (0,0,0)
            const dist = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z) || 1;
            const force = Math.random() * 20 + 10;
            
            // Explosión radial 3D
            p.vx = (p.x / dist) * force;
            p.vy = (p.y / dist) * force;
            p.vz = (p.z / dist) * force;
        });

        // Apagar sistema tras animación para liberar recursos
        setTimeout(() => {
            this.active = false;
            this.canvas.style.display = 'none';
        }, 2000);
    }

    private loop = () => {
        if(!this.active) return;
        requestAnimationFrame(this.loop);
        
        this.ctx.clearRect(0, 0, this.w, this.h);
        
        // Ordenar partículas por profundidad (Z) para correcto dibujo (Z-Sorting)
        this.particles.sort((a, b) => b.z - a.z);

        // Rotación constante si no está explotando
        if (!this.isExploding) {
            this.angleY += this.rotationSpeed;
        }

        // Pre-cálculo de funciones trigonométricas para la matriz de rotación
        const sinY = Math.sin(this.angleY);
        const cosY = Math.cos(this.angleY);
        const perspective = 800; // Distancia de la cámara simulada

        this.particles.forEach(p => {
            if (this.isExploding) {
                // FÍSICA: Explosión
                p.x += p.vx; p.y += p.vy; p.z += p.vz;
                p.vx *= 1.02; p.vy *= 1.02; p.vz *= 1.02; // Aceleración
                p.baseSize *= 0.96; // Desvanecer tamaño
            } else {
                // FÍSICA: Armado (Interpolación lineal - Lerp)
                // Mueve x hacia tx suavemente (0.04 es la velocidad de armado)
                p.x += (p.tx - p.x) * 0.04;
                p.y += (p.ty - p.y) * 0.04;
                p.z += (p.tz - p.z) * 0.04;
                
                // Hacer crecer el tamaño al llegar a su posición
                if(p.size < p.baseSize) p.size += 0.05;

                // Animación idle (vibración del bajo al ritmo)
                if(p.type === 'driver') {
                    p.z += Math.sin(Date.now() * 0.02) * 2; 
                }
            }

            // --- PROYECCIÓN 3D -> 2D ---
            
            // 1. Rotación en eje Y (Matriz de rotación básica)
            // x' = x*cos - z*sin
            // z' = z*cos + x*sin
            const rotX = p.x * cosY - p.z * sinY;
            const rotZ = p.z * cosY + p.x * sinY;
            const rotY = p.y; // No rotamos en X ni Z

            // 2. Perspectiva
            // Entre más lejos (Z positivo hacia el fondo), más pequeño
            const cameraZ = rotZ + perspective; 
            
            // Evitar división por cero o objetos detrás de la cámara
            if (cameraZ > 0) {
                const scale = perspective / cameraZ;
                const screenX = this.cx + rotX * scale;
                const screenY = this.cy + rotY * scale;

                // Dibujar solo si es visible y tiene tamaño
                const finalSize = p.size * scale * (this.isExploding ? p.baseSize : 1);

                if (finalSize > 0.1) {
                    // Variar opacidad según profundidad (Efecto Niebla)
                    const alpha = Math.min(1, Math.max(0.2, scale));
                    
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = p.color;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, finalSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1.0; // Reset alpha
                }
            }
        });
    }
}

