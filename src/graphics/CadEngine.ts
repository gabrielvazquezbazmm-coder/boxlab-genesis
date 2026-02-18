import * as THREE from 'three';
import { AppState } from '../types';

export class CadEngine {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private box!: THREE.Mesh;
    private edges!: THREE.LineSegments;
    private port!: THREE.Mesh;

    constructor(id: string) {
        const el = document.getElementById(id);
        if(!el) throw new Error("3D Viewport missing");

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, el.clientWidth/el.clientHeight, 0.1, 2000);
        this.camera.position.set(120, 90, 140); this.camera.lookAt(0,0,0);

        this.renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
        this.renderer.setSize(el.clientWidth, el.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        el.appendChild(this.renderer.domElement);

        this.initScene();
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.animate();
    }

    private initScene() {
        const amb = new THREE.AmbientLight(0x222222, 3);
        this.scene.add(amb);
        const key = new THREE.DirectionalLight(0xC5A96E, 3); key.position.set(80, 100, 80); this.scene.add(key);
        const rim = new THREE.DirectionalLight(0x4444ff, 1); rim.position.set(-80, 50, -100); this.scene.add(rim);

        const grid = new THREE.GridHelper(300, 60, 0x333333, 0x111111); grid.position.y = -50; this.scene.add(grid);

        const boxGeo = new THREE.BoxGeometry(1,1,1);
        const boxMat = new THREE.MeshPhysicalMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.2, transmission:0.5, transparent:true, opacity:0.9 });
        this.box = new THREE.Mesh(boxGeo, boxMat); this.scene.add(this.box);

        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        this.edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color:0xC5A96E, transparent:true, opacity:0.4 }));
        this.scene.add(this.edges);

        const portGeo = new THREE.CylinderGeometry(1,1,1,64);
        this.port = new THREE.Mesh(portGeo, new THREE.MeshStandardMaterial({ color:0x222222, metalness:0.8 }));
        this.port.rotation.x = Math.PI/2; this.scene.add(this.port);
    }

    public update(s: AppState) {
        if(!this.box) return;
        this.box.scale.set(s.width, s.height, s.depth);
        this.edges.scale.set(s.width, s.height, s.depth);
        // @ts-ignore
        this.box.material.wireframe = s.wireframe;
        this.port.scale.set(s.portDiam/2, s.portDiam/2, 15);
        this.port.position.z = s.depth/2;
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        if(this.box) {
            this.box.rotation.y += 0.003; this.edges.rotation.y += 0.003;
            const r = this.box.rotation.y, off = this.box.scale.z/2;
            this.port.position.x = Math.sin(r)*off;
            this.port.position.z = Math.cos(r)*off;
            this.port.rotation.y = r;
        }
        this.renderer.render(this.scene, this.camera);
    }
}

