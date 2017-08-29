/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import chai, {expect} from 'chai'
import spies from 'chai-spies'
import NavTree from './../src/NavTree'

chai.use(spies)

function createTestTree (onNav) {
  onNav = onNav || (() => {})

  let treeStructure = {
    a: {
      e: {
        g: {}
      },
      f: {
        h: {}
      }
    },
    b: {
      i: {
        j: {
          k: {}
        }
      }
    },
    c: {}
  }

  let tree = new NavTree('root')
  fillTree(tree, treeStructure, onNav)

  return tree
}

function fillTree (tree, structure, onNav) {
  tree.onNavCallback = (path) => { onNav(tree.id, path) }

  for (let id in structure) {
    let branch = tree.addNode(id)
    fillTree(branch, structure[id], onNav)
  }
  return tree
}

describe('NavTree', () => {
  it('creates tree structure correctly', () => {
    let tree = createTestTree()

    expect(tree.nodesId).to.be.eql(['a', 'b', 'c'])
    expect(tree.getNode('a').nodesId).to.be.eql(['e', 'f'])
    expect(tree.getNode('a', 'e').nodesId).to.be.eql(['g'])
    expect(tree.getNode('a', 'f').nodesId).to.be.eql(['h'])
  })

  it('requires `resolveFunc` function', () => {
    // todo
  })

  describe('addNode()', () => {
    it('can add nodes', () => {
      let parent = new NavTree()
      let child = parent.addNode()

      expect(child.parent).to.equal(parent)
      expect(Object.keys(parent.nodes).length).to.equal(1)
      expect(parent.nodes[child.id]).to.equal(child)

      let child2 = parent.addNode()
      expect(Object.keys(parent.nodes).length).to.equal(2)
      expect(parent.nodes[child2.id]).to.equal(child2)
    })

    it('ensures `id` is unique among the tree\'s direct nodes', () => {
      // todo
    })
  })

  describe('removeNode()', () => {
    it('can remove nodes', () => {
      let parent = new NavTree()
      let child = parent.addNode()

      parent.removeNode(child.id)

      expect(child.parent).to.be.null
      expect(parent.nodes).to.be.empty
    })
  })

  describe('navigation', () => {
    describe('focus()', () => {
      it('can focus a child node', () => {
        let parent = new NavTree()
        let child = parent.addNode()

        expect(parent.focusedNode).to.be.null

        parent.focus(child.id)

        expect(parent.focusedNode).to.equal(child.id)
      })

      it('can focus descendant node specified by path', () => {
        let tree = createTestTree()
        tree.focus('a', 'e', 'g')
        expect(tree.getFocusedPath()).to.eql(['a', 'e', 'g'])
      })

      describe('when called with empty args', () => {
        it('must keep the node focused and revoke focus from children', () => {
          let tree = createTestTree()
          tree.focus('a', 'e', 'g')
          tree.getNode('a').focus()
          expect(tree.getFocusedPath()).to.eql(['a'])
        })
      })

      it('can be called on a child node', () => {
        let tree = createTestTree()
        let child = tree.getNode('a', 'e', 'g')
        child.focus()
        expect(tree.getFocusedPath()).to.eql(['a', 'e', 'g'])
      })
    })

    describe('`onNav` event', () => {
      it('must call `onNav(false)` on a focused node when it lost focus', () => {
        let parent = new NavTree()
        let child = parent.addNode()
        parent.focus(child.id)

        let childOnNavEvent = chai.spy()
        child.onNavCallback = childOnNavEvent

        parent.focus()

        expect(childOnNavEvent).to.have.been.called.once.with(false)
      })

      it('must not call `onNav` on nodes not affected by navigation', () => {
        let parent = new NavTree()
        let child = parent.addNode()
        let child2 = parent.addNode()

        let childOnNavEvent = chai.spy()
        child.onNavCallback = childOnNavEvent

        parent.focus(child2.id)
        parent.focus()

        expect(childOnNavEvent).to.not.have.been.called()
      })

      it('must call `onNav(path)` on every node in new focused path', () => {
        let onNavSpy = chai.spy()
        let tree = createTestTree(onNavSpy)

        tree.focus('a', 'e', 'g')

        expect(onNavSpy).to.have.been.called.exactly(4)
        expect(onNavSpy).to.have.been.called.with('root', ['a', 'e', 'g'])
        expect(onNavSpy).to.have.been.called.with('a', ['e', 'g'])
        expect(onNavSpy).to.have.been.called.with('e', ['g'])
        expect(onNavSpy).to.have.been.called.with('g', [])
      })

      it('must call `onNav(false)` on every node from previously focused path', () => {
        let onNavSpy
        let onNav = (id, path) => {
          if (onNavSpy) onNavSpy(id, path)
        }

        let tree = createTestTree(onNav)
        tree.focus('a', 'e', 'g')

        onNavSpy = chai.spy()

        tree.focus()

        expect(onNavSpy).to.have.been.called.with('a', false)
        expect(onNavSpy).to.have.been.called.with('e', false)
        expect(onNavSpy).to.have.been.called.with('g', false)
      })
    })

    describe('resolve()', () => {
      it('navigates up & down the tree correctly', () => {
        let tree = createTestTree()

        // Tree:
        //    └── a
        //        ├── e
        //        │   └── g
        //        └── f
        //            └── h

        tree.focus('a', 'e', 'g')

        let gNavResolve = chai.spy(() => false)
        let eNavResolve = chai.spy(() => false)
        let aNavResolve = chai.spy(() => 'f')
        let fNavResolve = chai.spy(() => 'h')
        let hNavResolve = chai.spy(() => null)

        tree.getNode('a', 'e').resolveFunc = eNavResolve
        tree.getNode('a', 'e', 'g').resolveFunc = gNavResolve
        tree.getNode('a').resolveFunc = aNavResolve
        tree.getNode('a', 'f').resolveFunc = fNavResolve
        tree.getNode('a', 'f', 'h').resolveFunc = hNavResolve

        tree.resolve('anEvent')

        expect(gNavResolve, 'G.resolveFunc').to.have.been.called.once.with('anEvent', tree.getNode('a', 'e', 'g'))
        expect(eNavResolve, 'E.resolveFunc').to.have.been.called.once.with('anEvent', tree.getNode('a', 'e'))
        expect(aNavResolve, 'A.resolveFunc').to.have.been.called.once.with('anEvent', tree.getNode('a'))
        expect(fNavResolve, 'F.resolveFunc').to.have.been.called.once.with('anEvent', tree.getNode('a', 'f'))
        expect(hNavResolve, 'H.resolveFunc').to.have.been.called.once.with('anEvent', tree.getNode('a', 'f', 'h'))

        expect(tree.getFocusedPath()).to.eql(['a', 'f', 'h'])
      })

      describe('if `resolveFunc` returns invalid value at phase 2 of resolving process', () => {
        it('must regard invalid value as NULL', () => {
          let tree = createTestTree()

          // Tree:
          //    └── a
          //        └── e
          //            └── g

          tree.resolveFunc = () => 'a'
          tree.getNode('a').resolveFunc = () => 'e'

          // Possible valid values: 'g' or NULL.
          tree.getNode('a', 'e').resolveFunc = () => false

          tree.resolve('anEvent')

          expect(tree.getFocusedPath(), 'focused path').to.eql(['a', 'e'])
        })
      })

      // TODO
      /* describe('when parent node gets removed at phase 1', () => {
        it('should stop the process', () => {
          let tree = createTestTree()

          // Tree:
          //    └── a
          //        └── e
          //            └── g

          tree.focus('a', 'e', 'g')

          tree.getNode('a', 'e', 'g').resolveFunc = () => {
            tree.getNode('a').removeNode('e')
            return false
          }
          let eResolveFunc = chai.spy()
          tree.getNode('a', 'e').resolveFunc = eResolveFunc
          let aResolveFunc = chai.spy()
          tree.getNode('a').resolveFunc = aResolveFunc

          tree.resolve('anEvent')

          expect(eResolveFunc, 'E.resolveFunc').to.not.have.been.called()
          expect(aResolveFunc, 'A.resolveFunc').to.not.have.been.called()
          expect(tree.getFocusedPath()).to.eql(['a'])
        })
      }) */
    })
  })
})
