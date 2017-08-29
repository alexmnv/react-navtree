
export default class NavTree {
  constructor (id, navResolveFunc, onNav) {
    this.id = id || null
    this.parent = null
    this.nodes = {}
    this.nodesId = [] // array of nodes ID to keep the order they are added
    this.focusedNode = null

    this.onNavCallback = onNav || (() => {})
    this.resolveFunc = navResolveFunc || (() => {})
  }

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

  focus (id) {
    if (this.parent) {
      return this.parent.focus([this.id].concat(id || []))
    }

    if (!Array.isArray(id)) {
      id = Array.from(arguments)
    }

    return this._focus(id)
  }

  _focus (path) {
    let newFocusedNode

    if (path === false) {
      this.onNavCallback(false)
      newFocusedNode = null
    } else {
      this.onNavCallback(path.slice())
      newFocusedNode = path.shift()
      if (newFocusedNode === undefined) newFocusedNode = null
    }

    // wrong node ID
    if (newFocusedNode !== null && this.nodes[newFocusedNode] === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('focus to invalid ID', newFocusedNode)
      }
      return
    }

    // revoke focus from previously focused node
    if (this.focusedNode !== null && this.focusedNode !== newFocusedNode) {
      this.nodes[this.focusedNode]._focus(false)
    }

    this.focusedNode = newFocusedNode

    if (newFocusedNode !== null) {
      this.nodes[newFocusedNode]._focus(path)
    }
  }

  resolve (event) {
    let node = this

    // get the root node
    while (node.parent) {
      node = node.parent
    }

    const rootNode = node
    const originalNavigate = rootNode._focus
    const ctrl = { break: false }

    rootNode._focus = (id) => {
      ctrl.break = true
      return originalNavigate.call(rootNode, id)
    }

    let targetNode = rootNode._resolve(event, ctrl)

    rootNode._focus = originalNavigate

    if (targetNode && !ctrl.break && rootNode !== targetNode) targetNode.focus()
  }

  _resolve (event, ctrl) {
    let node = this.getFocusedNode(true) // get the deepest focused node

    //
    // Phase 1
    // Traversing up the tree (up the focused path) until the event is resolved, starting from the deepest focused node
    //
    do {
      let resolvedNode = this._getResolveFuncResult(node, event)
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
      let resolvedNode = this._getResolveFuncResult(node, event)
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

  _getResolveFuncResult (node, event) {
    let resolveFuncResult = node.resolveFunc(event, node)

    if (resolveFuncResult === null) {
      return node
    } else if (node.nodes[resolveFuncResult] !== undefined) {
      return node.nodes[resolveFuncResult]
    } else {
      return false
    }
  }

  getNode (id) {
    if (!Array.isArray(id)) {
      id = Array.from(arguments)
    }

    let tree = this
    for (let i in id) {
      tree = tree.nodes[id[i]]
    }
    return tree
  }

  getFocusedPath () {
    let path = []
    let tree = this
    while (tree.focusedNode !== null) {
      path.push(tree.focusedNode)
      tree = tree.nodes[tree.focusedNode]
    }
    return path
  }

  getFocusedNode (deep) {
    let tree = this
    if (deep) {
      while (tree.focusedNode !== null) {
        tree = tree.nodes[tree.focusedNode]
      }
    }
    return tree
  }
}
