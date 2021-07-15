import * as THREE from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import c3d from '../../../build/Release/c3d.node';
import { EditorSignals } from '../../Editor';
import { GeometryDatabase } from '../../GeometryDatabase';
import MaterialDatabase from '../../MaterialDatabase';
import { GeometryFactory } from '../Factory';

export default class ThreePointRectangleFactory extends GeometryFactory {
    p1!: THREE.Vector3;
    p2!: THREE.Vector3;
    p3!: THREE.Vector3;
    mesh: Line2;

    constructor(db: GeometryDatabase, materials: MaterialDatabase, signals: EditorSignals) {
        super(db, materials, signals);

        this.mesh = new Line2(new LineGeometry(), materials.line());
        this.db.temporaryObjects.add(this.mesh);
    }

    async doUpdate() {
        this.mesh.geometry.dispose();
        const { p1, p2, p3, p4 } = this.orthogonal();

        const vertices = new Float32Array(5 * 3);
        vertices[0] = p1.x;
        vertices[1] = p1.y;
        vertices[2] = p1.z;

        vertices[3] = p2.x;
        vertices[4] = p2.y;
        vertices[5] = p2.z;

        vertices[6] = p3.x;
        vertices[7] = p3.y;
        vertices[8] = p3.z;

        vertices[9] = p4.x;
        vertices[10] = p4.y;
        vertices[11] = p4.z;

        vertices[12] = p1.x;
        vertices[13] = p1.y;
        vertices[14] = p1.z;

        const geometry = new LineGeometry();
        geometry.setPositions(vertices);
        this.mesh.geometry = geometry;
    }

    async doCommit() {
        this.db.temporaryObjects.remove(this.mesh);
        const { p1, p2, p3, p4 } = this.orthogonal();

        const points = [
            new c3d.CartPoint3D(p1.x, p1.y, p1.z),
            new c3d.CartPoint3D(p2.x, p2.y, p2.z),
            new c3d.CartPoint3D(p3.x, p3.y, p3.z),
            new c3d.CartPoint3D(p4.x, p4.y, p4.z)
        ]
        const line = new c3d.Polyline3D(points, true);
        return this.db.addItem(new c3d.SpaceInstance(line));
    }

    doCancel() {
        this.db.temporaryObjects.remove(this.mesh);
    }

    private orthogonal() {
        const { p1, p2 } = this;
        let { p3 } = this;

        const AB = p2.clone().sub(p1)
        let BC = p3.clone().sub(p2);
        const heightNormal = AB.clone().cross(BC).normalize();

        const depthNormal = AB.clone().cross(heightNormal).normalize();
        const depth = p3.clone().sub(p2).dot(depthNormal);
        BC = depthNormal.multiplyScalar(depth)
        p3 = BC.clone().add(p2);

        const p4 = p3.clone().sub(p2).add(p1);

        return { p1, p2, p3, p4};       
    }
}