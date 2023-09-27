<div align="center">
 <a href="https://skyjs.dev"><img src="https://skyjs.dev/Header.png" align="center" alt="Sky JS" /></a>
<h2 align="center">SkyJS</h2>
 <p align="center">A JavaScript Library for Building Interactive Web UIs</p>
</div>
  <p align="center">
    <a href="https://github.com/jehaad1/SkyJS/graphs/contributors">
      <img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/jehaad1/SkyJS" />
    </a>
    <a href="https://github.com/jehaad1/SkyJS/stargazers">
      <img alt="GitHub stars" src="https://img.shields.io/github/stars/jehaad1/SkyJS?style=social" />
    </a>
    <a href="https://github.com/jehaad1/SkyJS/network/members">
      <img alt="GitHub forks" src="https://img.shields.io/github/forks/jehaad1/SkyJS?style=social" />
    </a>
    <a href="https://github.com/jehaad1/SkyJS/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/jehaad1/SkyJS?color=0088ff" />
    </a>
    <a href="https://github.com/jehaad1/SkyJS/pulls">
      <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/jehaad1/SkyJS?color=0088ff" />
    </a>
  </p>

#### You Can Visit the Official Website - [The Docs Page](https://skyjs.dev).
## Getting Started
### Installation
#### 1. CDN Installation

> Add this script above your "body" tag:

```html
<script src="https://unpkg.com/ui-skyjs@latest/cdn.js"></script>
```

#### 2. ES Module Installation

> Install the library package:

``npm i ui-skyjs``

#### 2. Without Installation

> Import it from CDN in your Javascript File without installing the package:

```js
import { Document } from "https://unpkg.com/ui-skyjs@latest/module.js"
```

### Example Basic Usage
#### Documents

> 1. Create your document

```js
const myDoc = Document("<h1>First Document</h1>"); 
```

> 2. Add it to the DOM

```js
document.body.appendChild(myDoc);
```

#### States

> 1. Create your state

```js
 const [myState, setMyState] = State(1); 
 const myDoc = Document(`<h2>The state value is: ${myState()}</h2>`);
```

> 2. Add it to the DOM

```js
document.body.appendChild(myDoc); 
```

#### You Can Follow up by visiting the Official Website - [The Docs Page](https://skyjs.dev).
