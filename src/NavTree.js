
export default class NavTree {
  constructor (id) {
    this.id = id || null
    this.parent = null
    this.nodes = {}
    this.nodesId = [] // array of nodes ID to keep the order they are added
    this.focusedNode = null

    this.onNavCallback = null
    this.resolveFunc = null
  }

  /**
   * Add child node
   * @param id
   * @returns {NavTree}
   */
  addNode (id) {
    if (!id) {
      id = this._genId()
    } else {
      if (this.nodes[id] !== undefined) { // `id` is taken
        if (process.env.NODE_ENV !== 'production') {
          console.warn('NavTree.addNode() - duplicated ID:', id)
        }
        id = this._genId()
      }
    }

    let child = new this.constructor(id)
    child.parent = this

    this.nodes[id] = child
    this.nodesId.push(id)

    return child
  }

  /**
   * Remove child node
   * @param id
   */
  removeNode (id) {
    if (this.focusedNode === id) {
      this.focusedNode = null
    }

    this.nodes[id].parent = null

    delete this.nodes[id]
    this.nodesId.splice(this.nodesId.indexOf(id), 1)
  }

  /**
   * Find available node ID
   * @returns {string}
   * @private
   */
  _genId () {
    // use the first available numeric `id`
    let id = this.nodesId.length + 1
    while (this.nodes[id]) {
      id++
    }
    return id.toString()
  }

  /**
   * Focus a node specified by path (or itself if path is omitted or empty)
   * @param path - array or a list or arguments, e.g. focus(['a', 'b']) or focus('a', 'b')
   */
  focus (path) {
    if (Array.isArray(path)) {
      path = path.slice()
    } else {
      path = Array.from(arguments)
    }

    // get the root node and full path to the target node
    let node = this
    while (node.parent) {
      path.unshift(node.id)
      node = node.parent
    }

    node._focus(path)
  }

  /**
   * Focus a node specified by path. Must be called on root instance.
   * @param path {Array|false}
   * @private
   */
  _focus (path) {
    // `onNav` event
    if (this.onNavCallback) {
      this.onNavCallback(path === false ? false : path.slice())
    }

    let newFocusedNode

    if (path === false) {
      newFocusedNode = null
    } else {
      newFocusedNode = path.length > 0 ? path.shift() : null
    }

    // wrong node ID
    if (newFocusedNode !== null && this.nodes[newFocusedNode] === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('trying to focus invalid ID', newFocusedNode)
      }
      return
    }

    // revoke focus from previously focused node
    if (this.focusedNode !== null && this.focusedNode !== newFocusedNode) {
      this.nodes[this.focusedNode]._focus(false) // revoke focus recursively
    }

    this.focusedNode = newFocusedNode

    // focus
    if (newFocusedNode !== null) {
      this.nodes[newFocusedNode]._focus(path) // focus down the path recursively
    }
  }

  /**
   * Resolve an event to a node that should be focused next.
   * @param event
   * @returns {NavTree|false}
   */
  resolve (event) {
    let node = this

    // get the root node
    while (node.parent) {
      node = node.parent
    }
    const rootNode = node

    // intercept `focus()` call during resolving process
    const ctrl = { break: false }
    const originalFocusFunc = rootNode._focus
    rootNode._focus = (path) => {
      ctrl.break = true
      return originalFocusFunc.call(rootNode, path)
    }

    // resolving
    let targetNode = rootNode._resolve(event, ctrl)

    rootNode._focus = originalFocusFunc

    if (targetNode && !ctrl.break && rootNode !== targetNode) {
      targetNode.focus() // focus resolved node
      return targetNode
    } else {
      return false
    }
  }

  /**
   * Resolve an event to a node that should be focused next. Must be called on root instance.
   * @param event
   * @param ctrl {{break: boolean}} - flag to stop the process (set to true if `focus()` gets called during resolving process)
   * @returns {NavTree|false}
   * @private
   */
  _resolve (event, ctrl) {
    let deepestFocusedNode = this.getFocusedNode(true) || this
    let node = deepestFocusedNode

    //
    // Phase 1
    // Traversing up the tree (up the focused path) until the event is resolved, starting from the deepest focused node
    //
    do {
      let resolvedNode = this._getResolveFuncResult(node, event, deepestFocusedNode)
      if (ctrl.break) return false

      if (resolvedNode) {
        if (resolvedNode === node) {
          return node
        }
        node = resolvedNode
        break // move to phase 2
      } else {
        node = node.parent // traversing up the tree until the event is resolved
      }
    }
    while (node)

    if (!node) return false // the event couldn't be resolved
    if (node.parent && node.parent.focusedNode === node.id) return node // phase 2 is redundant if `node` is focused

    //
    // Phase 2
    // Traversing down the tree as long as the event is resolved, starting from the last node from phase 1
    //
    while (true) {
      let resolvedNode = this._getResolveFuncResult(node, event, deepestFocusedNode)
      if (ctrl.break) return false

      if (resolvedNode) {
        if (resolvedNode === node) {
          return node
        }

        node = resolvedNode // traversing down the tree as long as the event is resolved
      } else {
        return node
      }
    }
  }

  /**
   * Get a node returned by the resolve function
   * @param node {NavTree}
   * @param event
   * @param deepestFocusedNode {NavTree}
   * @returns {NavTree|null}
   * @private
   */
  _getResolveFuncResult (node, event, deepestFocusedNode) {
    let resolveFuncResult = node.resolveFunc(event, node, deepestFocusedNode)

    if (resolveFuncResult === null) {
      return node
    } else if (node.nodes[resolveFuncResult] !== undefined) {
      return node.nodes[resolveFuncResult]
    } else {
      return null
    }
  }

  /**
   * Get descendant node specified by path (or itself if path is empty or omitted)
   * @param path - array or a list of arguments
   * @returns {NavTree|null}
   */
  getNode (path) {
    if (!Array.isArray(path)) {
      path = Array.from(arguments)
    }

    let node = this
    for (let i in path) {
      node = node.nodes[path[i]]
      if (!node) return null
    }
    return node
  }

  /**
   * Get path to the deepest focused node
   * @returns {Array<string>}
   */
  getFocusedPath () {
    let path = []
    let node = this
    while (node.focusedNode !== null) {
      path.push(node.focusedNode)
      node = node.nodes[node.focusedNode]
    }
    return path
  }

  /**
   * Get the focused node
   * @param deep {boolean} get the deepest focused node
   * @returns {NavTree|null}
   */
  getFocusedNode (deep) {
    let node = this.nodes[this.focusedNode]

    if (!deep || !node) return node || null

    while (node.focusedNode !== null) {
      node = node.nodes[node.focusedNode]
    }
    return node
  }
}
