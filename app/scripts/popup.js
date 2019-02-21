// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

var shortcutsDown = JSON.parse(localStorage.shortcuts);
var currentShortcuts = Object.keys(shortcutsDown);
var showNotifications = true;

let updateShortcut = (shortcut, newKey) => {
    shortcutsDown[shortcut] = newKey
    localStorage.shortcuts = JSON.stringify(shortcutsDown)
}

let isValidShortcut = (shortcut) => {
    // console.log("Checking shortcut: " + shortcut);
    // let validShortcutRe = /(((shift|alt|ctrl)\+){1,3}(\d|[abc]))(?!.+)/g;
    // let valid = validShortcutRe.exec(shortcut);
    // console.log(valid);
    // return valid !== null;
    return true;
}

let basicNotification = (id, message) => {
    if (showNotifications) {
        chrome.notifications.clear(id);
        chrome.notifications.create(id, {
            type: "basic",
            iconUrl: "images/extension_icon.png",
            title: "WF Shortcuts",
            message: message
        }, function (notificationId) {});
    }
}

class Shortcut extends Component {

    constructor(props) {
        super(props);
        this.shortcutKeyOld = this.props.shortcutKey;
        this.newShortcutKey = "";
        this.state = {
            shortcutKey: this.props.shortcutKey,
            editing: false,
            editClass: "",
            recording: false,
            invalidWarning: ""
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
            updateShortcut(this.props.title, this.state.newShortcutKey)
            this.setState(prevState => ({
                shortcutKey: prevState.newShortcutKey,
                editing: !prevState.editing,
                editClass: "",
                recording: false
            }));
        }
    }

    _cancelEdit() {
        this.setState(prevState => ({
            shortcutKey: this.shortcutKeyOld,
            editing: !prevState.editing,
            editClass: "",
            recording: false
        }));
    }

    _setRecordedSequence(sequence) {
        this.newShortcutKey = sequence.join(' ')
        this.setState({
            recording: false
        })
        if (isValidShortcut(this.newShortcutKey)) {
            this.setState({
                shortcutKey: newShortcutKey
            })
        } else {
            this.setState({
                invalidWarning: "Invalid input!"
            })
            setTimeout(function() {
                this.setState({
                    invalidWarning: ""
                })
            }.bind(this), 4000);
        }
    }

    _recordNewShortcut() {
        this.setState({
            recording: true
        })
        Mousetrap.record(this._setRecordedSequence)
    }

    render() {
        return (
            <div className="shortcut-wrapper">
                <div className="shortcut-title">{this.props.title}</div>
                <p className={"shortcut-key" + this.state.editClass}>{this.state.recording ? "Record new shortcut" : this.state.shortcutKey}</p>
                {!this.state.editing ? 
                    <button className="btn shortcut-button edit" onClick={this._edit}>Edit</button> :
                    <div className="shortcut-edit-button-wrapper">
                        <button className={"btn shortcut-button" + (this.state.recording ? " record" : "")} onClick={this._recordNewShortcut}>Record</button>
                        <button className="btn shortcut-button save" onClick={this._edit}>Save</button>
                        <button className="btn shortcut-button cancel" onClick={this._cancelEdit}>Cancel</button>
                    </div>
                    }
                    <p className="warning">{this.state.invalidWarning}</p>
            </div>
        )
    }
}

class ShortcutSettings extends Component {
    render() {
        return (
            <div className="shortcut-group">
                <Shortcut title={currentShortcuts[0]} shortcutKey={shortcutsDown[currentShortcuts[0]]} />
                <Shortcut title={currentShortcuts[1]} shortcutKey={shortcutsDown[currentShortcuts[1]]} />
                <Shortcut title={currentShortcuts[2]} shortcutKey={shortcutsDown[currentShortcuts[2]]} />
                <Shortcut title={currentShortcuts[3]} shortcutKey={shortcutsDown[currentShortcuts[3]]} />
                <Shortcut title={currentShortcuts[4]} shortcutKey={shortcutsDown[currentShortcuts[4]]} />
                <Shortcut title={currentShortcuts[5]} shortcutKey={shortcutsDown[currentShortcuts[5]]} />
            </div>
        )
    }
}

ReactDOM.render(<ShortcutSettings />,
     document.getElementById('react'));
