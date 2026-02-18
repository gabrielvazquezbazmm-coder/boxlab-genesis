export type Environment = 'car' | 'home' | 'studio' | 'pro' | 'outdoor';
export type BoxShape = 'cube' | 'tower' | 'soundbar' | 'boombox' | 'wedge';
export type BoxTopology = 'sealed' | 'ported' | 'bandpass4' | 'bandpass6';
export type MaterialType = 'mdf' | 'plywood' | 'birch' | 'fiberglass';
export type DriverType = 'subwoofer' | 'midrange' | 'tweeter' | 'fullrange';

export interface DriverConfig {
    count: number;
    sizeInch: number;
    type: DriverType;
    posX: number; // Offset X desde el centro (cm)
    posY: number; // Offset Y desde el centro (cm)
}

export interface AppState {
    // Entorno
    env: Environment;
    shape: BoxShape;
    topology: BoxTopology;
    
    // Geometría
    width: number;
    height: number;
    depth: number;
    
    // Material
    material: MaterialType;
    thickness: number; // mm
    
    // Puerto
    portDiam: number;
    tuningFreq: number;
    
    // Componentes
    driver: DriverConfig;
    
    // Visualización
    wireframe: boolean;
}

