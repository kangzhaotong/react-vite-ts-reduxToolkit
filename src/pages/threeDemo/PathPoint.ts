/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Vector3 } from 'three';

/**
 * PathPoint
 */
class PathPoint {
    pos: Vector3;
    dir: Vector3;
    right: Vector3;
    up: Vector3;
    dist: number;
    widthScale: number;
    sharp: boolean;

    constructor() {
        this.pos = new Vector3();
        this.dir = new Vector3();
        this.right = new Vector3();
        this.up = new Vector3(); // normal
        this.dist = 0; // distance from start
        this.widthScale = 1; // for corner
        this.sharp = false; // marks as sharp corner
    }

    lerpPathPoints(p1: { pos: Vector3; dir: Vector3; up: Vector3; right: Vector3; dist: number; widthScale: number; }, p2: { pos: Vector3; dir: Vector3; up: Vector3; right: Vector3; dist: number; widthScale: number; }, alpha: number) {
        this.pos.lerpVectors(p1.pos, p2.pos, alpha);
        this.dir.lerpVectors(p1.dir, p2.dir, alpha);
        this.up.lerpVectors(p1.up, p2.up, alpha);
        this.right.lerpVectors(p1.right, p2.right, alpha);
        this.dist = (p2.dist - p1.dist) * alpha + p1.dist;
        this.widthScale = (p2.widthScale - p1.widthScale) * alpha + p1.widthScale;
    }

    copy(source: { pos: Vector3; dir: Vector3; up: Vector3; right: Vector3; dist: number; widthScale: number; }) {
        this.pos.copy(source.pos);
        this.dir.copy(source.dir);
        this.up.copy(source.up);
        this.right.copy(source.right);
        this.dist = source.dist;
        this.widthScale = source.widthScale;
    }

}

export { PathPoint };