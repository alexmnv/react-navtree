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
