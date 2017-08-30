//
// Dynamic navigation
// (elements' position evaluated at run-time)
//

const getPos = function (el) {
  el = el.getBoundingClientRect()
  return {
    left: el.left + window.scrollX,
    right: el.right + window.scrollX,
    top: el.top + window.scrollY,
    bottom: el.bottom + window.scrollY
  }
}

const getPoint = function (dir, pos) {
  if (dir === 'left') return { x: pos.left, y: pos.top + ((pos.bottom - pos.top) / 2) } // left middle
  else if (dir === 'right') return { x: pos.right, y: pos.top + ((pos.bottom - pos.top) / 2) } // right middle
  else if (dir === 'top') return { x: pos.left + ((pos.right - pos.left) / 2), y: pos.top } // center top
  else if (dir === 'bottom') return { x: pos.left + ((pos.right - pos.left) / 2), y: pos.bottom } // center bottom
}

const getDistance = function (pos1, pos2) {
  let a = pos1.x - pos2.x
  let b = pos1.y - pos2.y

  return Math.sqrt(a * a + b * b)
}

/**
 *
 */
export function navDynamic (key, navTree, focusedNode) {
  if (key !== 'left' && key !== 'right' && key !== 'up' && key !== 'down') return false

  let focusedEl
  if (navTree.focusedNode !== null) {
    focusedEl = navTree.nodes[navTree.focusedNode].el
  } else if (focusedNode) {
    focusedEl = focusedNode.el
  }

  let srcPoint = {left: 'left', right: 'right', up: 'top', down: 'bottom'}
  let dstPoint = {left: 'right', right: 'left', up: 'bottom', down: 'top'}

  let point = focusedEl ? getPoint(srcPoint[key], getPos(focusedEl)) : {x: 0, y: 0}

  let minDistance = null
  let minDistanceNode

  // Loop over children nodes and find a node that is at minimum distance from previously focused element
  navTree.nodesId.forEach(id => {
    let node = navTree.nodes[id]
    let el = node.el
    if (el !== focusedEl) {
      let elPoint = getPoint(dstPoint[key], getPos(el))

      if ((key === 'left' && elPoint.x > point.x) ||
        (key === 'right' && elPoint.x < point.x) ||
        (key === 'up' && elPoint.y > point.y) ||
        (key === 'down' && elPoint.y < point.y)) return

      let distance = getDistance(point, elPoint)

      if (minDistance === null || minDistance > distance) {
        minDistance = distance
        minDistanceNode = node
      }
    }
  })

  return minDistanceNode ? minDistanceNode.id : false
}

//
// Fixed (static) navigation
//

const getValue = function (val, values, dir) {
  let pos = values.indexOf(val)

  let shiftPos = dir === 'next' ? 1 : -1

  let newPos

  if (pos === -1) {
    newPos = shiftPos > 0 ? 0 : values.length - 1
  } else {
    newPos = pos + shiftPos
  }

  if (newPos >= 0 && newPos < values.length) {
    return values[newPos]
  } else {
    return false
  }
}

/**
 * Vertical row resolve function ('up' and 'down' keys)
 */
export const navVertical = (key, navTree) => {
  let {focusedNode, nodesId} = navTree

  if (key === 'up' || key === 'down') {
    return getValue(focusedNode, nodesId, key === 'up' ? 'prev' : 'next')
  } else {
    return focusedNode !== null ? false : nodesId[0]
  }
}

/**
 * Horizontal row resolve function ('left' and 'right' keys)
 */
export const navHorizontal = (key, navTree) => {
  let {focusedNode, nodesId} = navTree

  if (key === 'left' || key === 'right') {
    return getValue(focusedNode, nodesId, key === 'left' ? 'prev' : 'next')
  } else {
    return focusedNode !== null ? false : nodesId[0]
  }
}

/**
 * Table (fixed columns size) resolve function ('left' 'right', 'up', 'down' keys)
 * @param cols
 * @returns {Function}
 */
export function navTable ({ cols }) {
  return function (key, navTree) {
    let {focusedNode, nodesId} = navTree

    let pos = focusedNode !== null ? nodesId.indexOf(focusedNode) : -1

    if (key === 'left' || key === 'right') {
      let rowNum = pos !== -1 ? Math.floor(pos / cols) : 0
      let rowStartIndex = rowNum * cols
      let rowEndIndex = rowStartIndex + cols
      let rowNodes = nodesId.slice(rowStartIndex, rowEndIndex)

      return getValue(focusedNode, rowNodes, key === 'left' ? 'prev' : 'next')
    } else if (key === 'up' || key === 'down') {
      let colNum = pos !== -1 ? pos % cols : 0
      let colNodes = []

      for (let i = colNum; i < nodesId.length; i += cols) {
        colNodes.push(nodesId[i])
      }

      return getValue(focusedNode, colNodes, key === 'up' ? 'prev' : 'next')
    }
  }
}
