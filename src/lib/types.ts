export type Vector = {
  x: number
  y: number
}

export type Leaf = {
  transform: Vector
  original: Vector
}

export type HTMLChangeEvent = Event & { currentTarget: EventTarget & HTMLInputElement }
