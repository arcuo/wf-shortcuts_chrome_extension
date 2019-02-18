// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// Current editable shortcut names:
var currentShortcuts = [];
currentShortcuts[0] = "switch-to-own-user";

var shortcutsDown = JSON.parse(localStorage.shortcuts);

console.log(Object.keys(shortcutsDown));

let updateShortcut = (shortcut, newKey) => {
    shortcutsDown[shortcut] = newKey
    localStorage.shortcuts = JSON.stringify(shortcutsDown)
    console.log("local value: " + shortcutsDown[shortcut])
    console.log("Storage: " + localStorage.shortcuts)
    console.log("Storage: " + JSON.parse(localStorage.shortcuts)[shortcut])
}

class Shortcut extends Component {

    constructor(props) {
        super(props);
        this.state = {
            shortcutKey: this.props.shortcutKey,
            editing: false, 
            editButtonLabel: "Edit"
        }
        this._edit = this._edit.bind(this);
        this._saveNewValue = this._saveNewValue.bind(this);
    }

    _edit() {
        let newLabel = this.state.editing ?  "Edit" : "Save"
        this.setState(prevState => ({
            editing: !prevState.editing,
            editButtonLabel: newLabel
        }));
    }

    _saveNewValue(e) {
        this.setState({shortcutKey: e.target.value})
        updateShortcut(this.props.title, e.target.value)
    }

    render() {
        return (
            <div className="shortcut-set">
                <div className="shortcut-title">{this.props.title}</div>
                <input className="shortcut-key" value={this.state.shortcutKey} readOnly={!this.state.editing} onChange={this._saveNewValue}/>
                <button className="shortcut-edit-button" onClick={this._edit}>
                    {this.state.editButtonLabel}
                </button>
            </div>
        )
    }
}

class ShortcutSettings extends Component {

}

ReactDOM.render(<Shortcut title={currentShortcuts[0]} shortcutKey={shortcutsDown[currentShortcuts[0]]} />,
     document.getElementById('react'));
