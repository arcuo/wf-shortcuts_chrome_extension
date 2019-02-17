// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

let shortcuts = JSON.parse(localStorage.shortcuts);

console.log(shortcuts.action);

class Shortcut extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editing: false, 
            editButtonLabel: "Edit"
        }
        this._edit = this._edit.bind(this);
    }

    _edit(){
        let newLabel = this.state.editing ?  "Edit" : "Save"
        this.setState(prevState => ({
            editing: !prevState.editing,
            editButtonLabel: newLabel
        }));
    }

    render() {
        return (
            <div className="shortcut-set">
                <div className="shortcut-title">{this.props.title}</div>
                <input className="shortcut-key" defaultValue={this.props.shortcutKey} readOnly={!this.state.editing}/>
                <button className="shortcut-edit-button" onClick={this._edit}>
                    {this.state.editButtonLabel}
                </button>
            </div>
        )
    }
}

class ShortcutSettings extends Component {

}

ReactDOM.render(<Shortcut title={shortcuts.action} shortcutKey={shortcuts.key} />, document.getElementById('react'));
