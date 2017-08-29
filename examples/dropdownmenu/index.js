import React from 'react'
import renderExample from '../utils/renderExample'
import Nav, {navVertical} from 'react-navtree'
import Menu from './DropdownMenu'

let navTree

renderExample(<div>

  <Nav func={navVertical} ref={(nav) => { navTree = nav && nav.tree }}>

    <h3>Dropdown menu example:</h3>

    <ul>
      <li>focus the menu and press Enter to expand</li>
      <li>the menu can also be navigated with mouse</li>
    </ul>

    <Menu>
      <Menu title='Foo'>
        <Menu title='A' />
        <Menu title='B' />
        <Menu title='C'>
          <Menu title='C 1' />
          <Menu title='C 2' />
        </Menu>
      </Menu>
      <Menu title='Bar' />
      <Menu title='Baz'>
        <Menu title='D' />
        <Menu title='E' />
        <Menu title='F'>
          <Menu title='F 1' />
          <Menu title='F 2' />
          <Menu title='F 3' />
          <Menu title='F 4' />
        </Menu>
        <Menu title='H'>
          <Menu title='H 1' />
          <Menu title='H 2' />
          <Menu title='H 3' />
        </Menu>
      </Menu>
    </Menu>

    <div style={{marginTop: '100px'}}>
      <Nav func={(key) => { if (key === 'enter') navTree.focus(['1', 'Foo', 'C', 'C 1']) }} className='button'>Press to focus &quot;Foo -&gt; C -&gt; C 1&quot;</Nav>
    </div>

  </Nav>

</div>)
