import React from 'react'
import ReactDOM from 'react-dom'
import Nav, {NavTree, navVertical} from 'react-navtree'
import './utils/common.css'

export default function renderExample (ExampleComponent, showBackButton = true) {
  let navTree = new NavTree()

  function goBack () {
    document.location = '../index/'
  }

  window.document.addEventListener('keydown', (e) => {
    let key

    switch (e.keyCode) {
      case 40:
        key = 'down'; break
      case 38:
        key = 'up'; break
      case 37:
        key = 'left'; break
      case 39:
        key = 'right'; break
      case 27:
        key = 'esc'; break
      case 13:
        key = 'enter'; break
      default:
    }
    if (key) {
      e.preventDefault()
      navTree.resolve(key)
    }
  }, false)

  ReactDOM.render((
    <Nav tree={navTree} func={navVertical}>

      { showBackButton && <Nav defaultFocused func={(key) => { if (key === 'enter') goBack() }} className='button btn-back'>Press to go back</Nav> }

      { ExampleComponent }

    </Nav>
  ), document.getElementById('root'))
}
