import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Nav, {NavTree} from 'react-navtree'

export default class Modal extends Component {
  componentWillReceiveProps (nextProps) {
    // before show:
    // remember focused path (in order to restore it when the modal is closed)
    if (!this.props.show && nextProps.show) {
      this.previouslyFocusedPath = this.context.tree.getFocusedPath()
    }
  }

  componentDidUpdate (prevProps) {
    // after close: restore focus
    if (prevProps.show && !this.props.show) {
      this.context.tree.focus(this.previouslyFocusedPath)
    }
  }

  render () {
    if (!this.props.show) return null

    const style = {
      position: 'absolute', backgroundColor: '#EEE', border: '1px solid red', left: '30px', top: '60px', padding: '20px'
    }

    return (
      <Nav style={style} defaultFocused func={this._navFunc}>
        { this.props.children }
      </Nav>
    )
  }

  _navFunc (key, navTree) {
    // lock navigation inside the modal.
    navTree.focus(navTree.getFocusedPath())
  }
}

Modal.contextTypes = {
  tree: PropTypes.instanceOf(NavTree)
}

Modal.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool
}
