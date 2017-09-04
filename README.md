# react-navtree

Library for making page navigation (using keyboard or TV Remote Control in STB/ Smart TV apps) React way

- Lightweight (8 kb minified, 3 kb gzipped)
- No dependencies (except for React itself)

_This project is under development and is still experimental_

> In STB/ Smart TV apps navigation is performed using TV remote control. 
> In traditional approach, navigation logic is implemented outside 'View' layer and is tightly coupled with UI layout, which doesn't fit with React principles of reusable and independent components.
> 
> The idea is to make components' navigation logic encapsulated within themselves and independent of the layout the component is placed into.
> `react-navtree` was designed to help make navigation React way - declarative and reusable.


### Demo

[Live examples.](https://alexmnv.github.io/react-navtree/) See `examples` directory for source code.

### Installation

```
npm install --save react-navtree
```

### Usage example

1) Initialize `NavTree` instance which will serve as an entry point for keypress events

```js
// At the bootstrap phase (before rendering the app):

const navTree = new NavTree()

// this code depends on the platform you're developing for
window.document.addEventListener('keydown', (e) => {
    let key

    switch (e.keyCode) {
      case 40:
        key = 'down'; break
      case 38:
        key = 'up'; break
      case 37:
        key = 'left'; break
      case 39:
        key = 'right'; break
      case 27:
        key = 'enter'; break
      default:
    }
    if (key) {
      e.preventDefault()
      navTree.resolve(key)
    }
  }, false)
```

2) Make use of `<Nav>` component

```js
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

export default function Layout () {
  return <Nav>

    <Header />
    <Body />
    <Footer />

  </Nav>
}

ReactDOM.render(<Layout tree={navTree} />)
```

[Open the example above](https://alexmnv.github.io/react-navtree/basic/)

### Description

The project consists of 2 main classes:

1. `NavTree` - Navigation tree
2. `<Nav>` - React component 


##### Tree hierarchy

`NavTree` represents a tree structure reflecting React's node hierarchy of `<Nav>` components.
It is accomplished by binding `<Nav>` components to the navigation tree at the mounting phase.
When `<Nav>` component is mounted it creates a new branch in the tree. 
This branch in its turn will serve as a parent tree to children `Nav` components through Reacts' `context` mechanism.
Likewise, when `<Nav>` component is unmounted, the branch gets removed from the tree thus keeping the tree in sync with React.

##### Navigation

Navigation is performed by using `NavTree.focus(path)` or `NavTree.resolve(event)` functions.

**`NavTree.focus(path)`** is used for imperative navigation.

**`NavTree.resolve(event)`** is used for resolving an event (keypress) to a node that should be focused next. 

##### Navigation resolving

_Navigation resolving_ is a process of finding a node that should be focused next when an event occurred.

Each node in the navigation tree must have so-called "resolve function" that is responsible for finding a node that should receive focus according to an event and previously focused node.

\* By default, `navDynamic` is used if the resolve function is not provided. 

###### Resolving process phases:

1) Resolving Up: Starting at the deepest focused node, the event is propagated up the tree _until_ it is resolved. 
2) Resolving Down: Starting at the resolved node in phase #1, the event is propagated down the tree _as long as_ it is resolved.
3) Focus: The destination node (the last one in phase #2) gets focused. 

\* event is resolved if the node's "resolve function" returns a child node ID or NULL (itself)
<br />
\* if a node gets focused, all of his ascendants get focused as well

###### From component perspective:

When an event (keypress) occurs, first, the currently focused `<Nav>` component gets control of the process. 
The resolve function (passed as "func" property) gets called to determine if the component can resolve the event. 

If so, the component stays focused and the event is propagated down to a child component returned by the resolve function. 
(If the resolve function returns NULL, the component stays focused, but the focused child (if any) will lose focus)

If not, the event is propagated up to the parent component. The component will lose focus if the event is eventually resolved to a different component.

### API

#### `<Nav>` component

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `func` | function (event: any, node: NavTree, previouslyFocusedNode: NavTree) => string &#124; null &#124; false | navDynamic | Navigation resolve function. |
| `tree` | NavTree | obtained from context | Parent navigation tree. Should be set only on root component. |
| `navId` | string | | ID used for the bound NavTree node.<br /> Must be unique within parent tree's direct nodes.<br /> If omitted, a numerical ID will be generated. |
| `defaultFocused` | boolean | false | If set to `true`, the component will get focused after it's been mounted |
| `onNav` | function (path: Array\<string\> &#124; false ) => void | | Navigation event callback |
| `component` | string | 'div' | Wrapper element |
| `focusedClass` | string | 'nav-focused' | CSS-class applied to focused component
| `...` | | | All other properties are passed to the `component` node. |  

#### `NavTree`

| Method | Arguments | Return value | Description |
| --- | --- | --- | --- |
| `focus(path)` | path: string &#124; Array\<string\> &#124; undefined | | Focuses a node specified by `path` argument. If omitted, the tree instance itself gets focused. |
| `resolve(event)` | event: any | | Resolves the event so that the appropriate node gets focused. |
| `addNode(id)` | id: string &#124; undefined | NavTree | Creates a new branch in the tree.<br/> If `id` is omitted, a numerical ID will be generated.<br/>`id` must be unique within the direct nodes of the tree. |
| `removeNode(id)` | id: string | | Removes the node from the tree |
| `getNode(path)` | string &#124; Array\<string\> | NavTree &#124; null | Returns descendant node instance |
| `getFocusedPath()` | | Array\<string\> | Returns descendant focused node's path |
 
| Property | Type | Description |
| --- | --- | --- |
| `nodes` | Object{ id: Navtree } | List of child nodes |
| `nodesId` | Array\<string\> | Array of child nodes ID arranged in the order the nodes have been added |
| `parent` | Navtree &#124; null  | Parent node |
| `focusedNode` | string &#124; null | ID of focused child node  |


### License

[MIT](LICENSE)
