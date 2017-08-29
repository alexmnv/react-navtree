import React, {Component} from 'react'
import Nav, {navHorizontal} from 'react-navtree'
import Modal from './modal'
import renderExample from '../utils/renderExample'

class Example extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showModal: false
    }

    this._navFuncToggleModal = this._navFuncToggleModal.bind(this)
  }

  render () {
    return (
      <div>
        <Nav func={navHorizontal} navId='body'>
          <Nav func={this._navFuncToggleModal} className='button'>Press to show modal window #1</Nav>
          <Nav func={this._navFuncToggleModal} className='button'>Press to show modal window #2</Nav>
        </Nav>

        <Modal show={this.state.showModal}>
          <h3>Demo modal</h3>

          <ul>
            <li>navigation is locked inside the modal window</li>
            <li>when the modal is closed, the previously focused component gets focused back</li>
          </ul>

          <Nav func={navHorizontal}>
            <Nav func={this._navFuncToggleModal} defaultFocused className='button'>Agree</Nav>
            <Nav func={this._navFuncToggleModal} className='button'>OK</Nav>
            <Nav func={this._navFuncToggleModal} className='button'>Confirm</Nav>
          </Nav>

        </Modal>

      </div>
    )
  }

  _navFuncToggleModal (key) {
    if (key === 'enter') {
      this.setState({showModal: !this.state.showModal})
      return null
    }
  }
}

renderExample(<Example />)
