import React, { useContext, useRef, useState, memo, useEffect } from 'react'
import PropTypes from 'prop-types'
import NavTree from './NavTree'
import { navDynamic } from './NavFunctions'

const Nav = memo(function Nav (props) {
  const [focused, setFocused] = useState(false)
  let _tree = useRef(null)

  useEffect(() => {
    if (props.tree) {
      _tree = props.tree
    } else if (useContext(NavTree)) {
      let id = props.navId
      _tree = useContext(NavTree).addNode(id)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No navigation tree provided. `NavTree` instance should be passed as a `tree` prop to the root (top level) `Nav` component')
      }
      return
    }

    _tree.resolveFunc = resolveFunc.bind(this)
    _tree.onNavCallback = _onNav.bind(this)

    if (props.defaultFocused) {
      _tree.focus()
    }

    return () => {
      if (_tree.parent) {
        _tree.parent.removeNode(_tree.id)
      }
    }
  }, [])

  const resolveFunc = (event, navTree, focusedNode) => {
    if (!props.func) {
      if (navTree.nodesId.length > 1) return navDynamic(event, navTree, focusedNode)
      else return focused ? false : (navTree.nodesId.length > 0 ? navTree.nodesId[0] : null)
    } else {
      return props.func(event, navTree, focusedNode)
    }
  }

  const _onNav = (path) => {
    setFocused(path !== false)

    if (props.onNav) {
      props.onNav(path)
    }
  }

  let {component: Component, children, className, focusedClass, tree, navId, func, onNav, defaultFocused, ...restProps} = props

  if (focused) {
    className += ' ' + focusedClass
  }

  return (
    <Component ref={ref => { if (_tree) _tree.el = ref }} className={className} {...restProps}>{children}</Component>
  )
})

Nav.contextTypes = {
  tree: PropTypes.instanceOf(NavTree)
}

Nav.childContextTypes = {
  tree: PropTypes.instanceOf(NavTree)
}

Nav.propTypes = {
  navId: PropTypes.string,
  func: PropTypes.func,
  focusedClass: PropTypes.string,
  component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  tree: PropTypes.instanceOf(NavTree),
  onNav: PropTypes.func,
  defaultFocused: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string
}

Nav.defaultProps = {
  component: 'div',
  focusedClass: 'nav-focused',
  className: ''
}

export default Nav
