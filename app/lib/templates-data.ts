/**
 * Auto-generated template data
 * DO NOT EDIT MANUALLY
 * 
 * To regenerate: npm run generate:templates
 * or: node scripts/generate-templates.js
 */

export interface TemplateFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

export const staticTemplateData: Record<string, TemplateFile[]> = {
  "react-calculator": [
    {
      "path": "LICENSE",
      "content": "MIT License\n\nCopyright (c) 2018 Andrew H Farmer\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
      "type": "file"
    },
    {
      "path": "README.md",
      "content": "Calculator\n---\n<img src=\"Logotype primary.png\" width=\"60%\" height=\"60%\" />\n\nCreated with *create-react-app*. See the [full create-react-app guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).\n\n\n\nTry It\n---\n\n[ahfarmer.github.io/calculator](https://ahfarmer.github.io/calculator/)\n\n\n\nInstall\n---\n\n`npm install`\n\n\n\nUsage\n---\n\n`npm start`\n",
      "type": "file"
    },
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"calculator\",\n  \"version\": \"0.1.0\",\n  \"license\": \"MIT\",\n  \"homepage\": \"http://ahfarmer.github.io/calculator\",\n  \"devDependencies\": {\n    \"chai\": \"^4.2.0\",\n    \"gh-pages\": \"^2.0.1\",\n    \"prettier\": \"^1.17.1\",\n    \"react-scripts\": \"^3.0.1\"\n  },\n  \"dependencies\": {\n    \"big.js\": \"^5.2.2\",\n    \"github-fork-ribbon-css\": \"^0.2.1\",\n    \"react\": \"^16.8.6\",\n    \"react-dom\": \"^16.8.6\"\n  },\n  \"scripts\": {\n    \"start\": \"react-scripts start\",\n    \"build\": \"react-scripts build\",\n    \"test\": \"react-scripts test --env=jsdom\",\n    \"eject\": \"react-scripts eject\",\n    \"deploy\": \"gh-pages -d build\"\n  },\n  \"prettier\": {\n    \"trailingComma\": \"all\"\n  },\n  \"browserslist\": {\n    \"production\": [\n      \">0.2%\",\n      \"not dead\",\n      \"not op_mini all\"\n    ],\n    \"development\": [\n      \"last 1 chrome version\",\n      \"last 1 firefox version\",\n      \"last 1 safari version\"\n    ]\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "public/index.html",
      "content": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, user-scalable=no\">\n    <link rel=\"manifest\" href=\"%PUBLIC_URL%/manifest.json\">\n    <link rel=\"shortcut icon\" href=\"%PUBLIC_URL%/favicon.ico\">\n    <title>React Calculator</title>\n  </head>\n  <body>\n    <noscript>\n      You need to enable JavaScript to run this app.\n    </noscript>\n    <div id=\"root\"></div>\n    <a\n      class=\"github-fork-ribbon left-top\"\n      href=\"https://github.com/ahfarmer/calculator\"\n      title=\"Fork me on GitHub\">\n        Fork me on GitHub\n    </a>\n    <!--\n      This HTML file is a template.\n      If you open it directly in the browser, you will see an empty page.\n\n      You can add webfonts, meta tags, or analytics to this file.\n      The build step will place the bundled scripts into the <body> tag.\n\n      To begin the development, run `npm start` in this folder.\n      To create a production bundle, use `npm run build`.\n    -->\n  </body>\n</html>\n",
      "type": "file"
    },
    {
      "path": "public/manifest.json",
      "content": "{\n  \"short_name\": \"Calculator\",\n  \"name\": \"React Calculator Example App\",\n  \"icons\": [\n    {\n      \"src\": \"favicon.ico\",\n      \"sizes\": \"64x64 32x32 24x24 16x16\",\n      \"type\": \"image/x-icon\"\n    }\n  ],\n  \"start_url\": \"./index.html\",\n  \"display\": \"standalone\",\n  \"theme_color\": \"#000000\",\n  \"background_color\": \"#ffffff\"\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/App.css",
      "content": ".component-app {\n  display: flex;\n  flex-direction: column;\n  flex-wrap: wrap;\n  height: 100%;\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/App.js",
      "content": "import React from \"react\";\nimport Display from \"./Display\";\nimport ButtonPanel from \"./ButtonPanel\";\nimport calculate from \"../logic/calculate\";\nimport \"./App.css\";\n\nexport default class App extends React.Component {\n  state = {\n    total: null,\n    next: null,\n    operation: null,\n  };\n\n  handleClick = buttonName => {\n    this.setState(calculate(this.state, buttonName));\n  };\n\n  render() {\n    return (\n      <div className=\"component-app\">\n        <Display value={this.state.next || this.state.total || \"0\"} />\n        <ButtonPanel clickHandler={this.handleClick} />\n      </div>\n    );\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/App.test.js",
      "content": "import React from \"react\";\nimport ReactDOM from \"react-dom\";\nimport App from \"./App\";\n\nit(\"renders without crashing\", () => {\n  const div = document.createElement(\"div\");\n  ReactDOM.render(<App />, div);\n});\n",
      "type": "file"
    },
    {
      "path": "src/component/Button.css",
      "content": ".component-button {\n  display: inline-flex;\n  width: 25%;\n  flex: 1 0 auto;\n}\n\n.component-button.wide {\n  width: 50%;\n}\n\n.component-button button {\n  background-color: #e0e0e0;\n  border: 0;\n  font-size: 1.5rem;\n  margin: 0 1px 0 0;\n  flex: 1 0 auto;\n  padding: 0;\n}\n\n.component-button:last-child button {\n  margin-right: 0;\n}\n\n.component-button.orange button {\n  background-color: #f5923e;\n  color: white;\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/Button.js",
      "content": "import React from \"react\";\nimport PropTypes from \"prop-types\";\nimport \"./Button.css\";\n\nexport default class Button extends React.Component {\n  static propTypes = {\n    name: PropTypes.string,\n    orange: PropTypes.bool,\n    wide: PropTypes.bool,\n    clickHandler: PropTypes.func,\n  };\n\n  handleClick = () => {\n    this.props.clickHandler(this.props.name);\n  };\n\n  render() {\n    const className = [\n      \"component-button\",\n      this.props.orange ? \"orange\" : \"\",\n      this.props.wide ? \"wide\" : \"\",\n    ];\n\n    return (\n      <div className={className.join(\" \").trim()}>\n        <button onClick={this.handleClick}>{this.props.name}</button>\n      </div>\n    );\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/ButtonPanel.css",
      "content": ".component-button-panel {\n  background-color: #858694;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  flex: 1 0 auto;\n}\n\n.component-button-panel > div {\n  width: 100%;\n  margin-bottom: 1px;\n  flex: 1 0 auto;\n  display: flex;\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/ButtonPanel.js",
      "content": "import Button from \"./Button\";\nimport React from \"react\";\nimport PropTypes from \"prop-types\";\n\nimport \"./ButtonPanel.css\";\n\nexport default class ButtonPanel extends React.Component {\n  static propTypes = {\n    clickHandler: PropTypes.func,\n  };\n\n  handleClick = buttonName => {\n    this.props.clickHandler(buttonName);\n  };\n\n  render() {\n    return (\n      <div className=\"component-button-panel\">\n        <div>\n          <Button name=\"AC\" clickHandler={this.handleClick} />\n          <Button name=\"+/-\" clickHandler={this.handleClick} />\n          <Button name=\"%\" clickHandler={this.handleClick} />\n          <Button name=\"÷\" clickHandler={this.handleClick} orange />\n        </div>\n        <div>\n          <Button name=\"7\" clickHandler={this.handleClick} />\n          <Button name=\"8\" clickHandler={this.handleClick} />\n          <Button name=\"9\" clickHandler={this.handleClick} />\n          <Button name=\"x\" clickHandler={this.handleClick} orange />\n        </div>\n        <div>\n          <Button name=\"4\" clickHandler={this.handleClick} />\n          <Button name=\"5\" clickHandler={this.handleClick} />\n          <Button name=\"6\" clickHandler={this.handleClick} />\n          <Button name=\"-\" clickHandler={this.handleClick} orange />\n        </div>\n        <div>\n          <Button name=\"1\" clickHandler={this.handleClick} />\n          <Button name=\"2\" clickHandler={this.handleClick} />\n          <Button name=\"3\" clickHandler={this.handleClick} />\n          <Button name=\"+\" clickHandler={this.handleClick} orange />\n        </div>\n        <div>\n          <Button name=\"0\" clickHandler={this.handleClick} wide />\n          <Button name=\".\" clickHandler={this.handleClick} />\n          <Button name=\"=\" clickHandler={this.handleClick} orange />\n        </div>\n      </div>\n    );\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/Display.css",
      "content": ".component-display {\n  background-color: #858694;\n  color: white;\n  text-align: right;\n  font-weight: 200;\n  flex: 0 0 auto;\n  width: 100%;\n}\n\n.component-display > div {\n  font-size: 2.5rem;\n  padding: 0.2rem 0.7rem 0.1rem 0.5rem;\n}\n",
      "type": "file"
    },
    {
      "path": "src/component/Display.js",
      "content": "import React from \"react\";\nimport PropTypes from \"prop-types\";\n\nimport \"./Display.css\";\n\nexport default class Display extends React.Component {\n  static propTypes = {\n    value: PropTypes.string,\n  };\n\n  render() {\n    return (\n      <div className=\"component-display\">\n        <div>{this.props.value}</div>\n      </div>\n    );\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/index.css",
      "content": "html {\n  height: 100%;\n  font-size: 10px;\n}\n\nbody {\n  background-color: black;\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n  height: 100%;\n}\n\n#root {\n  height: 100%;\n}\n\nbody .github-fork-ribbon:before {\n  background-color: #333;\n}\n\n@media screen and (max-width: 400px) {\n  .github-fork-ribbon {\n    display: none;\n  }\n}\n\n@media (min-width: 400px) and (min-height: 400px) {\n  html {\n    font-size: 20px;\n  }\n}\n\n@media (min-width: 500px) and (min-height: 500px) {\n  html {\n    font-size: 30px;\n  }\n}\n\n@media (min-width: 600px) and (min-height: 600px) {\n  html {\n    font-size: 40px;\n  }\n}\n\n@media (min-width: 800px) and (min-height: 800px) {\n  html {\n    font-size: 50px;\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/index.js",
      "content": "import React from \"react\";\nimport ReactDOM from \"react-dom\";\nimport App from \"./component/App\";\nimport \"./index.css\";\nimport \"github-fork-ribbon-css/gh-fork-ribbon.css\";\n\nReactDOM.render(<App />, document.getElementById(\"root\"));\n",
      "type": "file"
    },
    {
      "path": "src/logic/calculate.js",
      "content": "import Big from \"big.js\";\n\nimport operate from \"./operate\";\nimport isNumber from \"./isNumber\";\n\n/**\n * Given a button name and a calculator data object, return an updated\n * calculator data object.\n *\n * Calculator data object contains:\n *   total:String      the running total\n *   next:String       the next number to be operated on with the total\n *   operation:String  +, -, etc.\n */\nexport default function calculate(obj, buttonName) {\n  if (buttonName === \"AC\") {\n    return {\n      total: null,\n      next: null,\n      operation: null,\n    };\n  }\n\n  if (isNumber(buttonName)) {\n    if (buttonName === \"0\" && obj.next === \"0\") {\n      return {};\n    }\n    // If there is an operation, update next\n    if (obj.operation) {\n      if (obj.next) {\n        return { next: obj.next + buttonName };\n      }\n      return { next: buttonName };\n    }\n    // If there is no operation, update next and clear the value\n    if (obj.next) {\n      const next = obj.next === \"0\" ? buttonName : obj.next + buttonName;\n      return {\n        next,\n        total: null,\n      };\n    }\n    return {\n      next: buttonName,\n      total: null,\n    };\n  }\n\n  if (buttonName === \"%\") {\n    if (obj.operation && obj.next) {\n      const result = operate(obj.total, obj.next, obj.operation);\n      return {\n        total: Big(result)\n          .div(Big(\"100\"))\n          .toString(),\n        next: null,\n        operation: null,\n      };\n    }\n    if (obj.next) {\n      return {\n        next: Big(obj.next)\n          .div(Big(\"100\"))\n          .toString(),\n      };\n    }\n    return {};\n  }\n\n  if (buttonName === \".\") {\n    if (obj.next) {\n      // ignore a . if the next number already has one\n      if (obj.next.includes(\".\")) {\n        return {};\n      }\n      return { next: obj.next + \".\" };\n    }\n    return { next: \"0.\" };\n  }\n\n  if (buttonName === \"=\") {\n    if (obj.next && obj.operation) {\n      return {\n        total: operate(obj.total, obj.next, obj.operation),\n        next: null,\n        operation: null,\n      };\n    } else {\n      // '=' with no operation, nothing to do\n      return {};\n    }\n  }\n\n  if (buttonName === \"+/-\") {\n    if (obj.next) {\n      return { next: (-1 * parseFloat(obj.next)).toString() };\n    }\n    if (obj.total) {\n      return { total: (-1 * parseFloat(obj.total)).toString() };\n    }\n    return {};\n  }\n\n  // Button must be an operation\n\n  // When the user presses an operation button without having entered\n  // a number first, do nothing.\n  // if (!obj.next && !obj.total) {\n  //   return {};\n  // }\n\n  // User pressed an operation button and there is an existing operation\n  if (obj.operation) {\n    return {\n      total: operate(obj.total, obj.next, obj.operation),\n      next: null,\n      operation: buttonName,\n    };\n  }\n\n  // no operation yet, but the user typed one\n\n  // The user hasn't typed a number yet, just save the operation\n  if (!obj.next) {\n    return { operation: buttonName };\n  }\n\n  // save the operation and shift 'next' into 'total'\n  return {\n    total: obj.next,\n    next: null,\n    operation: buttonName,\n  };\n}\n",
      "type": "file"
    },
    {
      "path": "src/logic/calculate.test.js",
      "content": "import calculate from \"./calculate\";\nimport chai from \"chai\";\n\n// https://github.com/chaijs/chai/issues/469\nchai.config.truncateThreshold = 0;\n\nconst expect = chai.expect;\n\nfunction pressButtons(buttons) {\n  const value = {};\n  buttons.forEach(button => {\n    Object.assign(value, calculate(value, button));\n  });\n  // no need to distinguish between null and undefined values\n  Object.keys(value).forEach(key => {\n    if (value[key] === null) {\n      delete value[key];\n    }\n  });\n  return value;\n}\n\nfunction expectButtons(buttons, expectation) {\n  expect(pressButtons(buttons)).to.deep.equal(expectation);\n}\n\nfunction test(buttons, expectation, only = false) {\n  const func = only ? it.only : it;\n  func(`buttons ${buttons.join(\",\")} -> ${JSON.stringify(expectation)}`, () => {\n    expectButtons(buttons, expectation);\n  });\n}\n\ndescribe(\"calculate\", function() {\n  test([\"6\"], { next: \"6\" });\n\n  test([\"6\", \"6\"], { next: \"66\" });\n\n  test([\"6\", \"+\", \"6\"], {\n    next: \"6\",\n    total: \"6\",\n    operation: \"+\",\n  });\n\n  test([\"6\", \"+\", \"6\", \"=\"], {\n    total: \"12\",\n  });\n\n  test([\"0\", \"0\", \"+\", \"0\", \"=\"], {\n    total: \"0\",\n  });\n\n  test([\"6\", \"+\", \"6\", \"=\", \"9\"], {\n    next: \"9\",\n  });\n\n  test([\"3\", \"+\", \"6\", \"=\", \"+\"], {\n    total: \"9\",\n    operation: \"+\",\n  });\n\n  test([\"3\", \"+\", \"6\", \"=\", \"+\", \"9\"], {\n    total: \"9\",\n    operation: \"+\",\n    next: \"9\",\n  });\n\n  test([\"3\", \"+\", \"6\", \"=\", \"+\", \"9\", \"=\"], {\n    total: \"18\",\n  });\n\n  // When '=' is pressed and there is not enough information to complete\n  // an operation, the '=' should be disregarded.\n  test([\"3\", \"+\", \"=\", \"3\", \"=\"], {\n    total: \"6\",\n  });\n\n  test([\"+\"], {\n    operation: \"+\",\n  });\n\n  test([\"+\", \"2\"], {\n    next: \"2\",\n    operation: \"+\",\n  });\n\n  test([\"+\", \"2\", \"+\"], {\n    total: \"2\",\n    operation: \"+\",\n  });\n\n  test([\"+\", \"2\", \"+\", \"+\"], {\n    total: \"2\",\n    operation: \"+\",\n  });\n\n  test([\"+\", \"2\", \"+\", \"5\"], {\n    next: \"5\",\n    total: \"2\",\n    operation: \"+\",\n  });\n\n  test([\"+\", \"2\", \"5\"], {\n    next: \"25\",\n    operation: \"+\",\n  });\n\n  test([\"+\", \"2\", \"5\"], {\n    next: \"25\",\n    operation: \"+\",\n  });\n\n  test([\"+\", \"6\", \"+\", \"5\", \"=\"], {\n    total: \"11\",\n  });\n\n  test([\"0\", \".\", \"4\"], {\n    next: \"0.4\",\n  });\n\n  test([\".\", \"4\"], {\n    next: \"0.4\",\n  });\n\n  test([\".\", \"4\", \"-\", \".\", \"2\"], {\n    total: \"0.4\",\n    next: \"0.2\",\n    operation: \"-\",\n  });\n\n  test([\".\", \"4\", \"-\", \".\", \"2\", \"=\"], {\n    total: \"0.2\",\n  });\n\n  // should clear the operator when AC is pressed\n  test([\"1\", \"+\", \"2\", \"AC\"], {});\n  test([\"+\", \"2\", \"AC\"], {});\n\n  test([\"4\", \"%\"], {\n    next: \"0.04\",\n  });\n\n  test([\"4\", \"%\", \"x\", \"2\", \"=\"], {\n    total: \"0.08\",\n  });\n\n  test([\"4\", \"%\", \"x\", \"2\"], {\n    total: \"0.04\",\n    operation: \"x\",\n    next: \"2\",\n  });\n\n  // the percentage sign should also act as '='\n  test([\"2\", \"x\", \"2\", \"%\"], {\n    total: \"0.04\",\n  });\n\n  //Test that pressing the multiplication or division sign multiple times should not affect the current computation\n  test([\"2\", \"x\", \"x\"], {\n    total: \"2\",\n    operation: \"x\"\n  });\n\n  test([\"2\", \"÷\", \"÷\"], {\n    total: \"2\",\n    operation: \"÷\"\n  });\n\n  test([\"2\", \"÷\", \"x\", \"+\", \"-\", \"x\"], {\n    total: \"2\",\n    operation: 'x'\n  });\n});\n",
      "type": "file"
    },
    {
      "path": "src/logic/isNumber.js",
      "content": "export default function isNumber(item) {\n  return /[0-9]+/.test(item);\n}\n",
      "type": "file"
    },
    {
      "path": "src/logic/operate.js",
      "content": "import Big from \"big.js\";\n\nexport default function operate(numberOne, numberTwo, operation) {\n  const one = Big(numberOne || \"0\");\n  const two = Big(numberTwo || (operation === \"÷\" || operation === 'x' ? \"1\": \"0\")); //If dividing or multiplying, then 1 maintains current value in cases of null\n  if (operation === \"+\") {\n    return one.plus(two).toString();\n  }\n  if (operation === \"-\") {\n    return one.minus(two).toString();\n  }\n  if (operation === \"x\") {\n    return one.times(two).toString();\n  }\n  if (operation === \"÷\") {\n    if (two === \"0\") {\n      alert(\"Divide by 0 error\");\n      return \"0\";\n    } else {\n      return one.div(two).toString();\n    }\n  }\n  throw Error(`Unknown operation '${operation}'`);\n}\n",
      "type": "file"
    }
  ],
  "react-todo": [
    {
      "path": "package.json",
      "content": "{\n    \"name\": \"todomvc-react\",\n    \"version\": \"1.0.0\",\n    \"description\": \"A TodoMVC written in React.\",\n    \"private\": true,\n    \"engines\": {\n        \"node\": \">=18.13.0\",\n        \"npm\": \">=8.19.3\"\n    },\n    \"scripts\": {\n        \"build\": \"webpack --config webpack.prod.js\",\n        \"dev\": \"webpack serve --open --config webpack.dev.js\",\n        \"serve\": \"http-server ./dist -p 7002 -c-1 --cors\",\n        \"test\": \"jest\"\n    },\n    \"devDependencies\": {\n        \"@babel/core\": \"^7.21.0\",\n        \"@babel/preset-env\": \"^7.20.2\",\n        \"@babel/preset-react\": \"^7.18.6\",\n        \"babel-loader\": \"^9.1.2\",\n        \"copy-webpack-plugin\": \"^12.0.2\",\n        \"css-loader\": \"^6.7.3\",\n        \"css-minimizer-webpack-plugin\": \"^4.2.2\",\n        \"eslint-plugin-react\": \"^7.32.2\",\n        \"html-webpack-plugin\": \"^5.5.0\",\n        \"http-server\": \"^14.1.1\",\n        \"mini-css-extract-plugin\": \"^2.7.2\",\n        \"style-loader\": \"^3.3.1\",\n        \"webpack\": \"^5.75.0\",\n        \"webpack-cli\": \"^5.0.1\",\n        \"webpack-dev-server\": \"^4.11.1\",\n        \"webpack-merge\": \"^5.8.0\"\n    },\n    \"dependencies\": {\n        \"classnames\": \"^2.2.5\",\n        \"react\": \"^17.0.2\",\n        \"react-dom\": \"^17.0.2\",\n        \"react-router-dom\": \"^6.8.2\",\n        \"todomvc-app-css\": \"^2.4.2\",\n        \"todomvc-common\": \"^1.0.5\"\n    }\n}\n",
      "type": "file"
    },
    {
      "path": "public/index.html",
      "content": "<!DOCTYPE html>\n<html lang=\"en\" data-framework=\"react\">\n    <head>\n        <meta charset=\"UTF-8\" />\n        <meta name=\"description\" content=\"A TodoMVC written in React.\" />\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n        <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\" />\n        <title>TodoMVC: React</title>\n    </head>\n    <body>\n        <section class=\"todoapp\" id=\"root\"></section>\n        <footer class=\"info\">\n            <p>Double-click to edit a todo</p>\n\t\t\t<p>Created by the TodoMVC Team</p>\n\t\t\t<p>Part of <a href=\"http://todomvc.com\">TodoMVC</a></p>\n        </footer>\n\t\t<script src=\"./base.js\"></script>\n    </body>\n</html>\n",
      "type": "file"
    },
    {
      "path": "readme.md",
      "content": "# TodoMVC: React\n\n## Description\n\nThis application uses React 17.0.2 to implement a todo application.\n\n-   [React](https://reactjs.org/) is a JavaScript library for creating user interfaces.\n\n## Implementation details\n\nReact focuses mainly on providing composable user interfaces to enable developers to build an appealing website or web app. React does not force the user to utilize a particular design pattern, but it does provide useful hooks to implement an MVC pattern, if desired. \n\nReact:\\\nModel: Todo reducer (reducer.js)\\\nView: React ui components\\\nController: App component + useReducer hook\n\nMVC:\\\nModel: Maintains the data and behavior of an application\\\nView: Displays the model in the ui\\\nController: Serves as an interface between view & model components\n\n## Build steps\n\nTo build the static files, this application utilizes webpack. It minifies and optimizes output files and copies all necessary files to a `dist` folder.\n\n## Requirements\n\nThe only requirement is an installation of Node, to be able to install dependencies and run scripts to serve a local server.\n\n```\n* Node (min version: 18.13.0)\n* NPM (min version: 8.19.3)\n```\n\n## Local preview\n\n```\nterminal:\n1. npm install\n2. npm run serve\n```\n",
      "type": "file"
    },
    {
      "path": "src/index.js",
      "content": "import React from \"react\";\nimport { render } from \"react-dom\";\nimport { HashRouter, Route, Routes } from \"react-router-dom\";\n\nimport { App } from \"./todo/app\";\nimport \"todomvc-app-css/index.css\";\nimport \"todomvc-common/base.css\";\n\nrender(\n    <HashRouter>\n        <Routes>\n            <Route path=\"*\" element={<App />} />\n        </Routes>\n    </HashRouter>,\n    document.getElementById(\"root\")\n);\n",
      "type": "file"
    },
    {
      "path": "src/todo/app.css",
      "content": "/* used for things that should be hidden in the ui,\nbut useful for people who use screen readers */\n.visually-hidden {\n    border: 0;\n    clip: rect(0 0 0 0);\n    clip-path: inset(50%);\n    height: 1px;\n    width: 1px;\n    margin: -1px;\n    padding: 0;\n    overflow: hidden;\n    position: absolute;\n    white-space: nowrap;\n}\n\n.toggle-all {\n    width: 40px !important;\n    height: 60px !important;\n    right: auto !important;\n}\n\n.toggle-all-label {\n    pointer-events: none;\n}\n",
      "type": "file"
    },
    {
      "path": "src/todo/app.jsx",
      "content": "import { useReducer } from \"react\";\nimport { Header } from \"./components/header\";\nimport { Main } from \"./components/main\";\nimport { Footer } from \"./components/footer\";\n\nimport { todoReducer } from \"./reducer\";\n\nimport \"./app.css\";\n\nexport function App() {\n    const [todos, dispatch] = useReducer(todoReducer, []);\n\n    return (\n        <>\n            <Header dispatch={dispatch} />\n            <Main todos={todos} dispatch={dispatch} />\n            <Footer todos={todos} dispatch={dispatch} />\n        </>\n    );\n}\n",
      "type": "file"
    },
    {
      "path": "src/todo/components/footer.jsx",
      "content": "import { useCallback, useMemo } from \"react\";\nimport { useLocation } from \"react-router-dom\";\nimport classnames from \"classnames\";\n\nimport { REMOVE_COMPLETED_ITEMS } from \"../constants\";\n\nexport function Footer({ todos, dispatch }) {\n    const { pathname: route } = useLocation();\n\n    const activeTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos]);\n\n    const removeCompleted = useCallback(() => dispatch({ type: REMOVE_COMPLETED_ITEMS }), [dispatch]);\n\n    // prettier-ignore\n    if (todos.length === 0)\n        return null;\n\n    return (\n        <footer className=\"footer\" data-testid=\"footer\">\n            <span className=\"todo-count\">{`${activeTodos.length} ${activeTodos.length === 1 ? \"item\" : \"items\"} left!`}</span>\n            <ul className=\"filters\" data-testid=\"footer-navigation\">\n                <li>\n                    <a className={classnames({ selected: route === \"/\" })} href=\"#/\">\n                        All\n                    </a>\n                </li>\n                <li>\n                    <a className={classnames({ selected: route === \"/active\" })} href=\"#/active\">\n                        Active\n                    </a>\n                </li>\n                <li>\n                    <a className={classnames({ selected: route === \"/completed\" })} href=\"#/completed\">\n                        Completed\n                    </a>\n                </li>\n            </ul>\n            <button className=\"clear-completed\" disabled={activeTodos.length === todos.length} onClick={removeCompleted}>\n                Clear completed\n            </button>\n        </footer>\n    );\n}\n",
      "type": "file"
    },
    {
      "path": "src/todo/components/header.jsx",
      "content": "import { useCallback } from \"react\";\nimport { Input } from \"./input\";\n\nimport { ADD_ITEM } from \"../constants\";\n\nexport function Header({ dispatch }) {\n    const addItem = useCallback((title) => dispatch({ type: ADD_ITEM, payload: { title } }), [dispatch]);\n\n    return (\n        <header className=\"header\" data-testid=\"header\">\n            <h1>todos</h1>\n            <Input onSubmit={addItem} label=\"New Todo Input\" placeholder=\"What needs to be done?\" />\n        </header>\n    );\n}\n",
      "type": "file"
    },
    {
      "path": "src/todo/components/input.jsx",
      "content": "import { useCallback } from \"react\";\n\nconst sanitize = (string) => {\n    const map = {\n        \"&\": \"&amp;\",\n        \"<\": \"&lt;\",\n        \">\": \"&gt;\",\n        '\"': \"&quot;\",\n        \"'\": \"&#x27;\",\n        \"/\": \"&#x2F;\",\n    };\n    const reg = /[&<>\"'/]/gi;\n    return string.replace(reg, (match) => map[match]);\n};\n\nconst hasValidMin = (value, min) => {\n    return value.length >= min;\n};\n\nexport function Input({ onSubmit, placeholder, label, defaultValue, onBlur }) {\n    const handleBlur = useCallback(() => {\n        if (onBlur)\n            onBlur();\n    }, [onBlur]);\n\n    const handleKeyDown = useCallback(\n        (e) => {\n            if (e.key === \"Enter\") {\n                const value = e.target.value.trim();\n\n                if (!hasValidMin(value, 2))\n                    return;\n\n                onSubmit(sanitize(value));\n                e.target.value = \"\";\n            }\n        },\n        [onSubmit]\n    );\n\n    return (\n        <div className=\"input-container\">\n            <input className=\"new-todo\" id=\"todo-input\" type=\"text\" data-testid=\"text-input\" autoFocus placeholder={placeholder} defaultValue={defaultValue} onBlur={handleBlur} onKeyDown={handleKeyDown} />\n            <label className=\"visually-hidden\" htmlFor=\"todo-input\">\n                {label}\n            </label>\n        </div>\n    );\n}\n",
      "type": "file"
    },
    {
      "path": "src/todo/components/item.jsx",
      "content": "import { memo, useState, useCallback } from \"react\";\nimport classnames from \"classnames\";\n\nimport { Input } from \"./input\";\n\nimport { TOGGLE_ITEM, REMOVE_ITEM, UPDATE_ITEM } from \"../constants\";\n\nexport const Item = memo(function Item({ todo, dispatch, index }) {\n    const [isWritable, setIsWritable] = useState(false);\n    const { title, completed, id } = todo;\n\n    const toggleItem = useCallback(() => dispatch({ type: TOGGLE_ITEM, payload: { id } }), [dispatch]);\n    const removeItem = useCallback(() => dispatch({ type: REMOVE_ITEM, payload: { id } }), [dispatch]);\n    const updateItem = useCallback((id, title) => dispatch({ type: UPDATE_ITEM, payload: { id, title } }), [dispatch]);\n\n    const handleDoubleClick = useCallback(() => {\n        setIsWritable(true);\n    }, []);\n\n    const handleBlur = useCallback(() => {\n        setIsWritable(false);\n    }, []);\n\n    const handleUpdate = useCallback(\n        (title) => {\n            if (title.length === 0)\n                removeItem(id);\n            else\n                updateItem(id, title);\n\n            setIsWritable(false);\n        },\n        [id, removeItem, updateItem]\n    );\n\n    return (\n        <li className={classnames({ completed: todo.completed })} data-testid=\"todo-item\">\n            <div className=\"view\">\n                {isWritable ? (\n                    <Input onSubmit={handleUpdate} label=\"Edit Todo Input\" defaultValue={title} onBlur={handleBlur} />\n                ) : (\n                    <>\n                        <input className=\"toggle\" type=\"checkbox\" data-testid=\"todo-item-toggle\" checked={completed} onChange={toggleItem} />\n                        <label data-testid=\"todo-item-label\" onDoubleClick={handleDoubleClick}>\n                            {title}\n                        </label>\n                        <button className=\"destroy\" data-testid=\"todo-item-button\" onClick={removeItem} />\n                    </>\n                )}\n            </div>\n        </li>\n    );\n});\n",
      "type": "file"
    },
    {
      "path": "src/todo/components/main.jsx",
      "content": "import { useMemo, useCallback } from \"react\";\nimport { useLocation } from \"react-router-dom\";\n\nimport { Item } from \"./item\";\nimport classnames from \"classnames\";\n\nimport { TOGGLE_ALL } from \"../constants\";\n\nexport function Main({ todos, dispatch }) {\n    const { pathname: route } = useLocation();\n\n    const visibleTodos = useMemo(\n        () =>\n            todos.filter((todo) => {\n                if (route === \"/active\")\n                    return !todo.completed;\n\n                if (route === \"/completed\")\n                    return todo.completed;\n\n                return todo;\n            }),\n        [todos, route]\n    );\n\n    const toggleAll = useCallback((e) => dispatch({ type: TOGGLE_ALL, payload: { completed: e.target.checked } }), [dispatch]);\n\n    return (\n        <main className=\"main\" data-testid=\"main\">\n            {visibleTodos.length > 0 ? (\n                <div className=\"toggle-all-container\">\n                    <input className=\"toggle-all\" type=\"checkbox\" id=\"toggle-all\" data-testid=\"toggle-all\" checked={visibleTodos.every((todo) => todo.completed)} onChange={toggleAll} />\n                    <label className=\"toggle-all-label\" htmlFor=\"toggle-all\">\n                        Toggle All Input\n                    </label>\n                </div>\n            ) : null}\n            <ul className={classnames(\"todo-list\")} data-testid=\"todo-list\">\n                {visibleTodos.map((todo, index) => (\n                    <Item todo={todo} key={todo.id} dispatch={dispatch} index={index} />\n                ))}\n            </ul>\n        </main>\n    );\n}\n",
      "type": "file"
    },
    {
      "path": "src/todo/constants.js",
      "content": "export const ADD_ITEM = \"ADD_ITEM\";\nexport const UPDATE_ITEM = \"UPDATE_ITEM\";\nexport const REMOVE_ITEM = \"REMOVE_ITEM\";\nexport const TOGGLE_ITEM = \"TOGGLE_ITEM\";\nexport const REMOVE_ALL_ITEMS = \"REMOVE_ALL_ITEMS\";\nexport const TOGGLE_ALL = \"TOGGLE_ALL\";\nexport const REMOVE_COMPLETED_ITEMS = \"REMOVE_COMPLETED_ITEMS\";\n",
      "type": "file"
    },
    {
      "path": "src/todo/reducer.js",
      "content": "import { ADD_ITEM, UPDATE_ITEM, REMOVE_ITEM, TOGGLE_ITEM, REMOVE_ALL_ITEMS, TOGGLE_ALL, REMOVE_COMPLETED_ITEMS } from \"./constants\";\n\n/* Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js\n\nThe MIT License (MIT)\n\nCopyright 2017 Andrey Sitnik <andrey@sitnik.ru>\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */\n\n// This alphabet uses `A-Za-z0-9_-` symbols.\n// The order of characters is optimized for better gzip and brotli compression.\n// References to the same file (works both for gzip and brotli):\n// `'use`, `andom`, and `rict'`\n// References to the brotli default dictionary:\n// `-26T`, `1983`, `40px`, `75px`, `bush`, `jack`, `mind`, `very`, and `wolf`\nlet urlAlphabet = \"useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict\";\n\nfunction nanoid(size = 21) {\n    let id = \"\";\n    // A compact alternative for `for (var i = 0; i < step; i++)`.\n    let i = size;\n    while (i--) {\n        // `| 0` is more compact and faster than `Math.floor()`.\n        id += urlAlphabet[(Math.random() * 64) | 0];\n    }\n    return id;\n}\n\nexport const todoReducer = (state, action) => {\n    switch (action.type) {\n        case ADD_ITEM:\n            return state.concat({ id: nanoid(), title: action.payload.title, completed: false });\n        case UPDATE_ITEM:\n            return state.map((todo) => (todo.id === action.payload.id ? { ...todo, title: action.payload.title } : todo));\n        case REMOVE_ITEM:\n            return state.filter((todo) => todo.id !== action.payload.id);\n        case TOGGLE_ITEM:\n            return state.map((todo) => (todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo));\n        case REMOVE_ALL_ITEMS:\n            return [];\n        case TOGGLE_ALL:\n            return state.map((todo) => (todo.completed !== action.payload.completed ? { ...todo, completed: action.payload.completed } : todo));\n        case REMOVE_COMPLETED_ITEMS:\n            return state.filter((todo) => !todo.completed);\n    }\n\n    throw Error(`Unknown action: ${action.type}`);\n};\n",
      "type": "file"
    },
    {
      "path": "webpack.common.js",
      "content": "const HtmlWebpackPlugin = require(\"html-webpack-plugin\");\nconst path = require(\"path\");\n\nmodule.exports = {\n    entry: {\n        app: path.resolve(__dirname, \"src\", \"index.js\"),\n    },\n    plugins: [\n        new HtmlWebpackPlugin({\n            title: \"TodoMVC: React\",\n            template: path.resolve(__dirname, \"public\", \"index.html\"),\n        }),\n    ],\n    output: {\n        filename: \"[name].bundle.js\",\n        path: path.resolve(__dirname, \"dist\"),\n        clean: true,\n    },\n    resolve: {\n        extensions: [\".js\", \".jsx\"],\n    },\n    module: {\n        rules: [\n            {\n                test: /\\.(js|jsx)$/,\n                exclude: /node_modules/,\n                use: {\n                    loader: \"babel-loader\",\n                    options: {\n                        presets: [\n                            [\"@babel/preset-env\", { targets: \"defaults\" }],\n                            [\"@babel/preset-react\", { runtime: \"automatic\" }],\n                        ],\n                    },\n                },\n            },\n            {\n                test: /\\.(png|svg|jpg|jpeg|gif)$/i,\n                type: \"asset/resource\",\n            },\n        ],\n    },\n};\n",
      "type": "file"
    },
    {
      "path": "webpack.dev.js",
      "content": "const { merge } = require(\"webpack-merge\");\nconst common = require(\"./webpack.common.js\");\n\nmodule.exports = merge(common, {\n    mode: \"development\",\n    devtool: \"inline-source-map\",\n    devServer: {\n        static: \"./dist\",\n    },\n    module: {\n        rules: [\n            {\n                test: /\\.css$/i,\n                use: [\"style-loader\", \"css-loader\"],\n            },\n        ],\n    },\n});\n",
      "type": "file"
    },
    {
      "path": "webpack.prod.js",
      "content": "const { merge } = require(\"webpack-merge\");\nconst common = require(\"./webpack.common.js\");\n\nconst MiniCssExtractPlugin = require(\"mini-css-extract-plugin\");\nconst CssMinimizerPlugin = require(\"css-minimizer-webpack-plugin\");\nconst TerserPlugin = require(\"terser-webpack-plugin\");\nconst CopyPlugin = require(\"copy-webpack-plugin\");\n\nmodule.exports = merge(common, {\n    mode: \"production\",\n    devtool: \"source-map\",\n    plugins: [\n        new MiniCssExtractPlugin({\n            filename: \"[name].css\",\n            chunkFilename: \"[id].css\",\n        }),\n\t\tnew CopyPlugin({\n\t\t\tpatterns: [\n\t\t\t  { from: \"./node_modules/todomvc-common/base.js\", to: \"base.js\" },\n\t\t\t],\n\t\t}),\n    ],\n    module: {\n        rules: [\n            {\n                test: /\\.css$/,\n                use: [MiniCssExtractPlugin.loader, \"css-loader\"],\n            },\n        ],\n    },\n    optimization: {\n        minimize: true,\n        minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],\n    },\n});\n",
      "type": "file"
    }
  ],
  "react-vite": [
    {
      "path": "README.md",
      "content": "# React + Vite\n\nThis template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.\n\nCurrently, two official plugins are available:\n\n- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh\n- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh\n\n## React Compiler\n\nThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).\n\n## Expanding the ESLint configuration\n\nIf you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.\n",
      "type": "file"
    },
    {
      "path": "_gitignore",
      "content": "# Logs\nlogs\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\nlerna-debug.log*\n\nnode_modules\ndist\ndist-ssr\n*.local\n\n# Editor directories and files\n.vscode/*\n!.vscode/extensions.json\n.idea\n.DS_Store\n*.suo\n*.ntvs*\n*.njsproj\n*.sln\n*.sw?\n",
      "type": "file"
    },
    {
      "path": "eslint.config.js",
      "content": "import js from '@eslint/js'\nimport globals from 'globals'\nimport reactHooks from 'eslint-plugin-react-hooks'\nimport reactRefresh from 'eslint-plugin-react-refresh'\nimport { defineConfig, globalIgnores } from 'eslint/config'\n\nexport default defineConfig([\n  globalIgnores(['dist']),\n  {\n    files: ['**/*.{js,jsx}'],\n    extends: [\n      js.configs.recommended,\n      reactHooks.configs['recommended-latest'],\n      reactRefresh.configs.vite,\n    ],\n    languageOptions: {\n      ecmaVersion: 2020,\n      globals: globals.browser,\n      parserOptions: {\n        ecmaVersion: 'latest',\n        ecmaFeatures: { jsx: true },\n        sourceType: 'module',\n      },\n    },\n    rules: {\n      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],\n    },\n  },\n])\n",
      "type": "file"
    },
    {
      "path": "index.html",
      "content": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>\n",
      "type": "file"
    },
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"vite-react-starter\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"lint\": \"eslint .\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^19.2.0\",\n    \"react-dom\": \"^19.2.0\"\n  },\n  \"devDependencies\": {\n    \"@eslint/js\": \"^9.38.0\",\n    \"@types/react\": \"^19.2.2\",\n    \"@types/react-dom\": \"^19.2.2\",\n    \"@vitejs/plugin-react\": \"^5.0.4\",\n    \"eslint\": \"^9.38.0\",\n    \"eslint-plugin-react-hooks\": \"^5.2.0\",\n    \"eslint-plugin-react-refresh\": \"^0.4.24\",\n    \"globals\": \"^16.4.0\",\n    \"vite\": \"^7.1.10\"\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/App.css",
      "content": "#root {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\n.logo {\n  height: 6em;\n  padding: 1.5em;\n  will-change: filter;\n  transition: filter 300ms;\n}\n.logo:hover {\n  filter: drop-shadow(0 0 2em #646cffaa);\n}\n.logo.react:hover {\n  filter: drop-shadow(0 0 2em #61dafbaa);\n}\n\n@keyframes logo-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  a:nth-of-type(2) .logo {\n    animation: logo-spin infinite 20s linear;\n  }\n}\n\n.card {\n  padding: 2em;\n}\n\n.read-the-docs {\n  color: #888;\n}\n",
      "type": "file"
    },
    {
      "path": "src/App.jsx",
      "content": "import { useState } from 'react'\nimport reactLogo from './assets/react.svg'\nimport viteLogo from '/vite.svg'\nimport './App.css'\n\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <>\n      <div>\n        <a href=\"https://vite.dev\" target=\"_blank\">\n          <img src={viteLogo} className=\"logo\" alt=\"Vite logo\" />\n        </a>\n        <a href=\"https://react.dev\" target=\"_blank\">\n          <img src={reactLogo} className=\"logo react\" alt=\"React logo\" />\n        </a>\n      </div>\n      <h1>Vite + React</h1>\n      <div className=\"card\">\n        <button onClick={() => setCount((count) => count + 1)}>\n          count is {count}\n        </button>\n        <p>\n          Edit <code>src/App.jsx</code> and save to test HMR\n        </p>\n      </div>\n      <p className=\"read-the-docs\">\n        Click on the Vite and React logos to learn more\n      </p>\n    </>\n  )\n}\n\nexport default App\n",
      "type": "file"
    },
    {
      "path": "src/index.css",
      "content": ":root {\n  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;\n  line-height: 1.5;\n  font-weight: 400;\n\n  color-scheme: light dark;\n  color: rgba(255, 255, 255, 0.87);\n  background-color: #242424;\n\n  font-synthesis: none;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\na {\n  font-weight: 500;\n  color: #646cff;\n  text-decoration: inherit;\n}\na:hover {\n  color: #535bf2;\n}\n\nbody {\n  margin: 0;\n  display: flex;\n  place-items: center;\n  min-width: 320px;\n  min-height: 100vh;\n}\n\nh1 {\n  font-size: 3.2em;\n  line-height: 1.1;\n}\n\nbutton {\n  border-radius: 8px;\n  border: 1px solid transparent;\n  padding: 0.6em 1.2em;\n  font-size: 1em;\n  font-weight: 500;\n  font-family: inherit;\n  background-color: #1a1a1a;\n  cursor: pointer;\n  transition: border-color 0.25s;\n}\nbutton:hover {\n  border-color: #646cff;\n}\nbutton:focus,\nbutton:focus-visible {\n  outline: 4px auto -webkit-focus-ring-color;\n}\n\n@media (prefers-color-scheme: light) {\n  :root {\n    color: #213547;\n    background-color: #ffffff;\n  }\n  a:hover {\n    color: #747bff;\n  }\n  button {\n    background-color: #f9f9f9;\n  }\n}\n",
      "type": "file"
    },
    {
      "path": "src/main.jsx",
      "content": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.jsx'\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n",
      "type": "file"
    },
    {
      "path": "vite.config.js",
      "content": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n})\n",
      "type": "file"
    }
  ]
};
