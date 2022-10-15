<script lang="ts">
  import type { Leaf, Vector, HTMLChangeEvent } from './types'

  /* constants */
  const DEBUG = false
  const HEIGHT = 500
  const WIDTH = 500
  const RADIUS = 5
  const MAX_LEAVES = 1000
  const CURRENT = 'CURRENT'

  /* state */
  let center: Vector
  let cache: Record<string, Leaf[]> = {}

  /* helper functions */
  const toLeaf = (): Leaf => {
    const x = Math.floor(Math.random() * (WIDTH - RADIUS)) ?? RADIUS
    const y = Math.floor(Math.random() * (HEIGHT - RADIUS)) ?? RADIUS
    return { transform: { x, y }, original: { x, y } }
  }
  const calcCenter = (leaves: Leaf[]): Vector => {
    const x = leaves.reduce((sum, { original: { x } }) => sum + x, 0) / leaves.length
    const y = leaves.reduce((sum, { original: { y } }) => sum + y, 0) / leaves.length
    return { x, y }
  }
  const transformLeaves = (delta: number): Leaf[] => {
    const { x: c_x, y: c_y } = center
    return cache[CURRENT].map(({ original: { x, y } }) => {
      return {
          original: { x, y },
          transform: {
            x: c_x + ((c_x - x) * delta),
            y: c_y + ((c_y - y) * delta),
        }
      }
    })
  }
  const sanitizeTotal = (e: HTMLChangeEvent) => {
    const total = parseInt(e.currentTarget.value)
    if (total > MAX_LEAVES) return MAX_LEAVES
    return total < 0 ? 0 : total
  }
  const setupDraw = (context: CanvasRenderingContext2D) => {
    return ({ transform: { x, y } }: Leaf, index = "", color = "green") => {
      const adjust = (n: number, max: number) => {
        if (n < 0) return 0
        if (n > max) return max
        return n
      }

      context.beginPath()
      context.arc(adjust(x, WIDTH), adjust(y, HEIGHT), 5, 0, 2 * Math.PI)
      context.fillStyle = color
      context.fill()

      if (DEBUG) {
        context.font = "bold 20px Arial"
        context.fillText(index, x, y)
      }
    }
  }

  /* event handlers */
  const handle = ({ total, delta }: { total?: number, delta?: number }): void => {
    /* setup */
    let leaves: Leaf[]
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const draw = setupDraw(context)

    /* update state based on user input */
    if (!!total || total === 0) {
      leaves = [...Array(total).keys()].map(() => toLeaf())
      center = calcCenter(leaves)
      cache = { CURRENT: leaves }
    }

    if (!!delta || delta === 0) {
      const key = delta.toString()
      leaves = cache[key] ?? transformLeaves(delta)
      cache[CURRENT], cache[key] = leaves
    }

    /* redraw */
    context.clearRect(0, 0, canvas.width, canvas.height)

    if (DEBUG) {
      draw({ transform: center } as Leaf, "0", "red")
      console.log({ leaves, center, delta })
    }

    leaves.forEach((v, i) => draw(v, (i + 1).toString()))
  }
  const onChange = (e: HTMLChangeEvent) => handle({ total: sanitizeTotal(e) }) 
  const onInput = (e: HTMLChangeEvent) => handle({ delta: parseFloat(e.currentTarget.value)}) 
</script>

<div>
  <canvas id="canvas" height={HEIGHT} width={WIDTH} />
  <h3>Controls </h3>
  <div class="controls">
    <label>Number of leaves:
      <input type="number" min="0" max={MAX_LEAVES} on:change={onChange} />
    </label>
    <label>𝛿 between leaves:
      <input class="slider" type="range" min={0.05} max={5} step="0.0001" on:input={onInput} />
    </label>
  </div>
</div>

<style>
  .controls {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }

  .slider {
    height: 7px;
  }
</style>
