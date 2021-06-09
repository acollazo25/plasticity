import * as THREE from "three";
import BoxFactory from "../../src/commands/box/BoxFactory";
import { DraftSolidFactory } from '../../src/commands/modifyface/DraftSolidFactory';
import { EditorSignals } from '../../src/Editor';
import { GeometryDatabase } from '../../src/GeometryDatabase';
import MaterialDatabase from '../../src/MaterialDatabase';
import * as visual from '../../src/VisualModel';
import { FakeMaterials } from "../../__mocks__/FakeMaterials";
import FakeSignals from '../../__mocks__/FakeSignals';
import '../matchers';

let db: GeometryDatabase;
let draftSolid: DraftSolidFactory;
let materials: Required<MaterialDatabase>;
let signals: EditorSignals;

beforeEach(() => {
    materials = new FakeMaterials();
    signals = FakeSignals();
    db = new GeometryDatabase(materials, signals);
    draftSolid = new DraftSolidFactory(db, materials, signals);
})

let solid: visual.Solid;

beforeEach(async () => {
    expect(db.scene.children.length).toBe(0);
    const makeBox = new BoxFactory(db, materials, signals);
    makeBox.p1 = new THREE.Vector3();
    makeBox.p2 = new THREE.Vector3(1, 0, 0);
    makeBox.p3 = new THREE.Vector3(1, 1, 0);
    makeBox.p4 = new THREE.Vector3(1, 1, 1);
    solid = await makeBox.commit() as visual.Solid;
});

describe('update', () => {
    test('push/pulls the visual face', async () => {
        const face = solid.faces.get(2);
        draftSolid.solid = solid;
        draftSolid.faces = [face];
        draftSolid.angle = Math.PI / 8;
        draftSolid.axis = new THREE.Vector3(1, 0, 0);
        draftSolid.origin = new THREE.Vector3(0, 0, 0);
        const offsetted = await draftSolid.update();
    });
});

describe('commit', () => {
    test('invokes the appropriate c3d commands', async () => {
        const face = solid.faces.get(2);
        draftSolid.solid = solid;
        draftSolid.faces = [face];
        draftSolid.angle = 4.75;
        draftSolid.axis = new THREE.Vector3(1, 0, 0);
        draftSolid.origin = new THREE.Vector3(0.5, 1, 0.5);
        expect(solid).toHaveCentroidNear(new THREE.Vector3(0.5, 0.5, 0.5));
        const offsetted = await draftSolid.commit();
        expect(offsetted).toHaveCentroidNear(new THREE.Vector3(0.5, -6.14, 0.73))
    })
})