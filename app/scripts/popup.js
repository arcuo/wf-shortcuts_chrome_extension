// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import React from 'react'
import ReactDOM from 'react-dom'

class ContentReact extends React.Component {
    render() {
        return (
            <div>
                <p>React is here</p>
            </div>
        )
    }
}

ReactDOM.render(<ContentReact />, document.getElementById('react'));
