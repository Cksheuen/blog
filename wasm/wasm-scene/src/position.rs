extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

use std::cmp::Ordering;
use std::ops::{Add, AddAssign, Mul};

use crate::utils::Vec2;

pub const STEP: f64 = 0.005;

pub const DIRECTIONS: [Vec2; 4] = [
    Vec2 { x: 0.0, y: 1.0 },
    Vec2 { x: 0.0, y: -1.0 },
    Vec2 { x: -1.0, y: 0.0 },
    Vec2 { x: 1.0, y: 0.0 },
];

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    None = 4,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct Position {
    pub x: i8,
    pub y: i8,
}

impl Direction {
    pub fn iterator() -> impl Iterator<Item = Direction> {
        use Direction::*;
        static DIRECTIONS: [Direction; 4] = [Up, Down, Left, Right];
        DIRECTIONS.iter().copied()
    }
}

impl Add for Position {
    type Output = Position;

    fn add(self, other: Position) -> Position {
        Position {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl AddAssign for Position {
    fn add_assign(&mut self, other: Position) {
        let Position { x, y } = self.clone();
        *self = Position {
            x: x + other.x,
            y: y + other.y,
        };
    }
}

impl Mul<i32> for Position {
    type Output = Position;

    fn mul(self, other: i32) -> Position {
        Position {
            x: self.x * other as i8,
            y: self.y * other as i8,
        }
    }
}

impl PartialEq for Position {
    fn eq(&self, other: &Position) -> bool {
        self.x == other.x && self.y == other.y
    }
}

impl PartialOrd for Position {
    fn partial_cmp(&self, other: &Position) -> Option<Ordering> {
        if self.x == other.x {
            self.y.partial_cmp(&other.y)
        } else {
            self.x.partial_cmp(&other.x)
        }
    }
}

impl Eq for Position {}

impl Ord for Position {
    fn cmp(&self, other: &Position) -> Ordering {
        if self.x == other.x {
            self.y.cmp(&other.y)
        } else {
            self.x.cmp(&other.x)
        }
    }
}

//1.0000439767122197028630803112777
