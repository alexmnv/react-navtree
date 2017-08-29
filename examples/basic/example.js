import React from 'react'
import PropTypes from 'prop-types'
import Nav, {navTable, navHorizontal, navVertical} from 'react-navtree'
import './example.css'

class Header extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { tab: 'tab-foo' }
  }

  render () {
    return <Nav func={navVertical} className='header'>
      <Nav
        onNav={path => { if (path) this.setState({ tab: path[0] }) }}
        func={(key, navTree) => (!navTree.focusedNode && this.state.tab) ? this.state.tab : navHorizontal(key, navTree)}
        className='tabs'
      >
        <Nav navId='tab-foo' className={this.state.tab === 'tab-foo' ? 'selected' : ''}>Foo</Nav>
        <Nav navId='tab-qux' className={this.state.tab === 'tab-qux' ? 'selected' : ''}>Qux</Nav>
      </Nav>

      { this.state.tab === 'tab-foo' && <Nav func={navHorizontal} className='tab-content' >
        <Nav className='nav-block inline'>Foo</Nav>
        <Nav className='nav-block inline'>Bar</Nav>
        <Nav className='nav-block inline'>Baz</Nav>
      </Nav> }

      { this.state.tab === 'tab-qux' && <Nav func={navVertical} className='tab-content' >
        <Nav className='nav-block'>Qux</Nav>
        <Nav className='nav-block'>Quux</Nav>
      </Nav> }
    </Nav>
  }
}

class Table extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { navPath: false }
  }

  render () {
    let {children, navId, cols} = this.props

    // convert flat array to multidimensional (table-like format): [1, 2, 3, 4, 5, 6] => [[1, 2, 3], [4, 5, 6]]
    let rows = children.reduce((rows, cell) => {
      let row = rows.length > 0 && rows[ rows.length - 1 ]
      if (row.length >= cols) row = false
      if (!row) {
        row = []
        rows.push(row)
      }
      row.push(cell)
      return rows
    }, [])

    return <Nav onNav={path => { this.setState({ navPath: path }) }} navId={navId} func={navTable({cols})} className='nav-block table'>
      <div>{ this.state.navPath && 'Focused: ' + this.state.navPath.join(' -> ') }</div>
      <table>
        <tbody>
          {
            rows.map((row, i) => <tr key={i}>
              {row.map((cell, j) => <td key={j}><Nav navId={`row ${i + 1} cell ${j + 1}`} className='nav-block'>{cell}</Nav></td>)}
            </tr>)
          }
        </tbody>
      </table>
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
      <Nav
        className='footer'
        func={(key, navTree) => (!navTree.focusedNode) ? 'bar' : navHorizontal(key, navTree)}
      >
        <Nav navId='foo' className='nav-block inline'>Foo</Nav>
        <Nav navId='bar' className='nav-block inline'>Bar</Nav>
        <Nav navId='baz' className='nav-block inline'>Baz</Nav>
      </Nav>
    )
  }
}

export default function Example () {
  return <Nav func={navVertical}>

    <Header />
    <Body />
    <Footer />

  </Nav>
}
