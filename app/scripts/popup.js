// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// Current editable shortcut names:
var currentShortcuts = [];
currentShortcuts.push("switch-to-own-user");

console.log(localStorage.shortcuts)

var shortcutsDown = JSON.parse(localStorage.shortcuts);

let updateShortcut = (shortcut, newKey) => {
    shortcutsDown[shortcut] = newKey
    localStorage.shortcuts = JSON.stringify(shortcutsDown)
}

class Shortcut extends Component {

    constructor(props) {
        super(props);
        this.shortcutKeyOld = this.props.shortcutKey;
        this.state = {
            shortcutKey: this.props.shortcutKey,
            editing: false,
            editClass: ""
        }
        this._edit = this._edit.bind(this);
        this._cancelEdit = this._cancelEdit.bind(this);
        this._recordNewShortcut = this._recordNewShortcut.bind(this);
        this._setRecordedSequence = this._setRecordedSequence.bind(this);
    }

    _edit() {
        if (!this.state.editing) {
            this.setState((prevState) => {
                this.shortcutKeyOld = prevState.shortcutKey;
                return {
                    editing: !prevState.editing,
                    editClass: " editing"

                }
            });
        } else {
            // Saving new value.
            updateShortcut(this.props.title, this.state.shortcutKey)
            this.setState(prevState => ({
                editing: !prevState.editing,
                editClass: ""
            }));
        }
    }

    _cancelEdit() {
        
        this.setState(prevState => ({
            shortcutKey: this.shortcutKeyOld,
            editing: !prevState.editing,
            editClass: ""
        }));
    }

    _setRecordedSequence(sequence) {
        this.setState({shortcutKey: sequence.join(' ')})
    }

    _recordNewShortcut() {
        this.setState({
            shortcutKey: "Record new shortcut"
        })
        Mousetrap.record(this._setRecordedSequence)
    }

    render() {
        return (
            <div className="shortcut-wrapper">
                <div className="shortcut-title">{this.props.title}</div>
                <p className={"shortcut-key" + this.state.editClass}>{this.state.shortcutKey}</p>
                {!this.state.editing ? 
                    <button className="shortcut-button edit" onClick={this._edit}>Edit</button> :
                    <div className="shortcut-edit-button-wrapper">
                        <button className="shortcut-button record" onClick={this._recordNewShortcut}>Record</button>
                        <button className="shortcut-button save" onClick={this._edit}>Save</button>
                        <button className="shortcut-button cancel" onClick={this._cancelEdit}>Cancel</button>
                    </div>
                    }
            </div>
        )
    }
}

class ShortcutSettings extends Component {
    render() {
        return (
            <div className="shortcut-group">
                <Shortcut title={currentShortcuts[0]} shortcutKey={shortcutsDown[currentShortcuts[0]]} />
                <Shortcut title={currentShortcuts[0]} shortcutKey={shortcutsDown[currentShortcuts[0]]} />
            </div>
        )
    }
}

ReactDOM.render(<ShortcutSettings />,
     document.getElementById('react'));
