import React from 'react'
import PropTypes from 'prop-types'
import Nav, {navHorizontal} from 'react-navtree'
import renderExample from './../renderExample'
import examples from './../examples.json'

class Example extends React.PureComponent {
  render () {
    function openExamplePage (id) {
      document.location = '../' + id + '/'
    }

    return (<div>
      <h1><code>react-navtree</code> examples</h1>
      <h4>Use keyboard arrows and Enter key for navigation</h4>

      <Nav func={navHorizontal}>
        {
          Object.keys(this.props.buttons).map((id, index) => {
            return <Nav defaultFocused={index === 0} func={(key) => { if (key === 'enter') openExamplePage(id) }} key={id} className='button'>{id}</Nav>
          })
        }
      </Nav>

    </div>)
  }
}

Example.propTypes = {
  buttons: PropTypes.object
}

let buttons = examples
delete buttons['index']

renderExample(<Example buttons={buttons} />, false)
