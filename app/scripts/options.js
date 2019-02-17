// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

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


