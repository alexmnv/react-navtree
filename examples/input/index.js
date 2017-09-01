import React, {Component} from 'react'
import Nav from 'react-navtree'
import renderExample from '../utils/renderExample'
import NavInput from './NavInput'
import './example.css'

class Example extends Component {
  render () {
    return (
      <div>
        <h3>Inputs can be handled in various manners. Here is an example of one approach:</h3>

        <ul>
          <li>Focus input and press <kbd>Enter</kbd> to activate &quot;edit mode&quot;</li>
          <li>Press <kbd>Esc</kbd> to exit &quot;edit mode&quot;</li>
        </ul>

        <Nav>
          <div className='caption'>Input:</div>
          <NavInput placeholder='Example' size='10' />
          <NavInput defaultValue='Foo' />
        </Nav>

        <Nav>
          <div className='caption'>Textarea:</div>
          <NavInput component='textarea' defaultValue={'Some\ntext'} />
          <NavInput component='textarea' />
        </Nav>

        <Nav>
          <div className='caption'>Input events demo:</div>
          <InputEventsDemo />
        </Nav>
      </div>
    )
  }
}

class InputEventsDemo extends Component {
  constructor (props) {
    super(props)

    this.state = {
      focused: false,
      editMode: false,
      value: ''
    }
  }

  render () {
    return <div>
      <NavInput
        onFocus={() => { this.setState({editMode: true}) }}
        onBlur={() => { this.setState({editMode: false}) }}
        value={this.state.value}
        onChange={e => { this.setState({value: e.target.value}) }}

        onNav={path => { this.setState({focused: path !== false}) }}

        refInput={ref => { this.inputEl = ref }}
      />

      <Nav className='button' func={key => { if (key === 'enter') this.inputEl.focus() }}>Press to focus the input</Nav>

      <div>Focused: <b>{ this.state.focused ? 'true' : 'false' }</b></div>
      <div>Edit mode: <b>{ this.state.editMode ? 'on' : 'off' }</b></div>
      <div>Value: <b>{ this.state.value }</b></div>
    </div>
  }
}

renderExample(<Example />)
