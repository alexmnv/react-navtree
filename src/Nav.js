import React from 'react'
import PropTypes from 'prop-types'
import NavTree from './NavTree'
import { navDynamic } from './NavFunctions'

export default class Nav extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      focused: false
    }
  }

  getChildContext () {
    return {
      tree: this.tree
    }
  }

  componentWillMount () {
    if (this.props.tree) { // root tree
      this.tree = this.props.tree
    } else if (this.context.tree) { // child tree
      let id = this.props.navId
      this.tree = this.context.tree.addNode(id)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No navigation tree provided. `NavTree` instance should be passed as a `tree` prop to the root (top level) `Nav` component')
      }
      return
    }

    this.tree.resolveFunc = this.resolveFunc.bind(this)
    this.tree.onNavCallback = this.onNav.bind(this)

    if (this.props.defaultFocused) {
      this.tree.focus()
    }
  }

  componentWillUnmount () {
    if (this.tree.parent) {
      this.tree.parent.removeNode(this.tree.id)
    }
  }

  resolveFunc (event, navTree, focusedNode) {
    if (!this.props.func) {
      if (navTree.nodesId.length > 1) return navDynamic(event, navTree, focusedNode)
      else return this.state.focused ? false : (navTree.nodesId.length > 0 ? navTree.nodesId[0] : null)
    } else {
      return this.props.func(event, navTree, focusedNode)
    }
  }

  onNav (path) {
    this.setState({
      focused: path !== false
    })

    if (this.props.onNav) {
      this.props.onNav(path)
    }
  }

  render () {
    let {component, children, className, focusedClass, tree, navId, func, onNav, defaultFocused, ...restProps} = this.props
    let Component = component || this.constructor.defaultComponent

    if (this.state.focused) {
      if (focusedClass === undefined) focusedClass = this.constructor.defaultFocusedClass
      className = (className || '') + ' ' + focusedClass
    }

    return (
      <Component ref={ref => { if (this.tree) this.tree.el = ref }} className={className} {...restProps}>{children}</Component>
    )
  }
}

Nav.defaultComponent = 'div'

Nav.defaultFocusedClass = 'nav-focused'

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
  component: PropTypes.node,
  tree: PropTypes.instanceOf(NavTree),
  onNav: PropTypes.func,
  defaultFocused: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string
}
