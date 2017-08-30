import React from 'react'
import PropTypes from 'prop-types'
import Nav, {navDynamic} from 'react-navtree'
import './example.css'

class Header extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { tab: 'tab-foo' }
  }

  render () {
    return <Nav className='header'>
      <Nav
        onNav={path => { if (path) this.setState({ tab: path[0] }) }}
        func={/* focus open tab first */ (key, navTree, focusedNode) => !navTree.focusedNode ? this.state.tab : navDynamic(key, navTree, focusedNode)}
        className='tabs'
      >
        <Nav navId='tab-foo' className={this.state.tab === 'tab-foo' ? 'selected' : ''}>Foo</Nav>
        <Nav navId='tab-qux' className={this.state.tab === 'tab-qux' ? 'selected' : ''}>Qux</Nav>
      </Nav>

      { this.state.tab === 'tab-foo' && <Nav className='tab-content' >
        <Nav className='nav-block inline'>Foo</Nav>
        <Nav className='nav-block inline'>Bar</Nav>
        <Nav className='nav-block inline'>Baz</Nav>
      </Nav> }

      { this.state.tab === 'tab-qux' && <Nav className='tab-content' >
        <Nav className='nav-block'>Qux</Nav>
        <Nav className='nav-block'>Quux</Nav>
      </Nav> }
    </Nav>
  }
}

class Table extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { focusedPath: false }
  }

  render () {
    let {children, navId, cols} = this.props

    return <Nav onNav={path => { this.setState({ focusedPath: path }) }} navId={navId} className='nav-block'>
      <div className='caption'>{ this.state.focusedPath && 'Focused: ' + this.state.focusedPath.join(' -> ') }</div>
      <div className={'tbl col' + cols}>
        { children.map((child, i) => <div key={i}><Nav navId={`row ${Math.ceil((i + 1) / cols)} cell ${(i % cols) + 1}`} className='nav-block'>{child}</Nav></div>) }
      </div>
    </Nav>
  }
}

Table.propTypes = {
  children: PropTypes.node,
  navId: PropTypes.string,
  cols: PropTypes.number
}

class Body extends React.PureComponent {
  render () {
    return (<div>

      <Table cols={3}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
        <div>E</div>
        <div>F</div>
        <div>G</div>
        <div>H</div>
        <div>J</div>
      </Table>

      <Table cols={2}>
        <Table navId='table 1' cols={2}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </Table>
        <Table navId='table 2' cols={2}>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
        </Table>
      </Table>

    </div>)
  }
}

class Footer extends React.PureComponent {
  render () {
    return (
      <Nav className='footer'>
        <Nav className='nav-block inline'>Foo</Nav>
        <Nav className='nav-block inline'>Bar</Nav>
        <Nav className='nav-block inline'>Baz</Nav>
      </Nav>
    )
  }
}

export default function Example () {
  return <Nav>

    <Header />
    <Body />
    <Footer />

  </Nav>
}
