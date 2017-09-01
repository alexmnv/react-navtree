import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Nav from 'react-navtree'

export default class NavInput extends Component {
  constructor (props) {
    super(props)

    this.state = {
      navFocused: false,
      inputFocused: false
    };

    ['onInputKeyDown', 'onInputFocus', 'onInputBlur', 'onNav', 'navFunc', 'setRef'].forEach(func => {
      this[func] = this[func].bind(this)
    })

    this.refInput = props.refInput
  }

  componentDidMount () {
    this.inputEl.addEventListener('keydown', this.onInputKeyDown)
    this.inputEl.addEventListener('focus', this.onInputFocus)
    this.inputEl.addEventListener('blur', this.onInputBlur)

    if (this.refInput) this.refInput(this.inputEl)
  }

  componentWillUnmount () {
    this.inputEl.removeEventListener('keydown', this.onInputKeyDown)
    this.inputEl.removeEventListener('focus', this.onInputFocus)
    this.inputEl.removeEventListener('blur', this.onInputBlur)

    if (this.refInput) this.refInput(null)
  }

  onInputKeyDown (e) {
    e.stopPropagation()

    if (e.keyCode === 27) { // Esc
      if (this.state.inputFocused) this.inputEl.blur()
    } else if (e.keyCode === 13) { // Enter
      if (!this.state.inputFocused) this.inputEl.focus()
    }
  }

  onInputFocus () {
    this.setState({ inputFocused: true })

    if (!this.state.navFocused) {
      this.nav.tree.focus()
    }
  }

  onInputBlur () {
    this.setState({ inputFocused: false })
  }

  onNav (path) {
    this.setState({ navFocused: path !== false })

    if (this.props.onNav) this.props.onNav(path)
  }

  navFunc (key) {
    if (key === 'enter') {
      this.inputEl.focus()
    }
  }

  setRef (nav) {
    this.nav = nav
    this.inputEl = nav && nav.tree.el
  }

  render () {
    let { component = 'input', type = 'text', onNav, refInput, ...rest } = this.props

    return (
      <Nav
        className='nav-input'
        component={component} type={type}
        func={this.navFunc}
        ref={this.setRef}
        onNav={this.onNav}
        {...rest}
      />
    )
  }
}

NavInput.propTypes = {
  component: PropTypes.string,
  type: PropTypes.string,
  onNav: PropTypes.func,
  refInput: PropTypes.func
}
