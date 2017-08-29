import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Nav, {navVertical, navHorizontal} from 'react-navtree'
import './dropdown-menu.css'

export default class DropdownMenu extends PureComponent {
  constructor (props) {
    super(props)

    this.resolveFunc = this.resolveFunc.bind(this)

    this.state = {
      open: false
    }
  }

  render () {
    if (!this.props._lvl) {
      return this.renderRootMenu()
    } else {
      return this.renderSubMenu()
    }
  }

  /**
   * Top level menu (horizontal row)
   */
  renderRootMenu () {
    return <Nav func={navHorizontal}>
      <div className='dropdown-menu'>
        { this._renderChildren() }
      </div>
    </Nav>
  }

  renderSubMenu () {
    let {title, children = []} = this.props

    return (
      <Nav
        ref={(nav) => { this.navTree = nav && nav.tree } /* get `navTree` instance */}
        onClick={(e) => { e.stopPropagation(); this.navTree.focus() } /* focus menu entry on mouse click */}
        onNav={(path) => { this.setState({open: path !== false && path.length > 0}) } /* expand the menu when a child gets focused */}
        navId={title}
        focusedClass='focused'
        className={this.state.open ? 'open' : ''}
        component={'li'}
        func={this.resolveFunc}
      >

        { children.length > 0 && this._renderChildren() }

        <a href='#'>{title}</a>
      </Nav>
    )
  }

  _renderChildren () {
    return <ul>
      {
        this.props.children.map((child, i) => React.cloneElement(child, { // clone children to inject `_lvl` prop
          _lvl: this.props._lvl === undefined ? 1 : this.props._lvl + 1,
          key: i
        }))
      }
    </ul>
  }

  /**
   * Resolve function for vertical menu
   */
  resolveFunc (key, navTree) {
    let {focusedNode, nodesId} = navTree

    if (focusedNode === null) {
      // Open the menu on `enter` or 'right' key press
      return ((key === 'enter' || (key === 'right' && this.props._lvl > 1)) && nodesId.length > 0) ? nodesId[0] : false
    }

    let defaultVertNav = navVertical(key, navTree)

    // Do not close the menu when the child menu is closed
    if (defaultVertNav === false && focusedNode !== null) {
      return null
    }

    return defaultVertNav
  }
}

DropdownMenu.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  _lvl: PropTypes.number
}
