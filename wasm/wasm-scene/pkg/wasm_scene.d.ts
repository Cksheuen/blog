/* tslint:disable */
/* eslint-disable */
/**
*/
export enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
  None = 4,
}
/**
*/
export class Painter {
  free(): void;
/**
* @param {number} sun_sita
* @returns {Painter}
*/
  static new(sun_sita: number): Painter;
/**
* @param {number} sun_sita
*/
  update(sun_sita: number): void;
}
/**
*/
export class Position {
  free(): void;
/**
*/
  x: number;
/**
*/
  y: number;
}
