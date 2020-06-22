import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import PropTypes from "prop-types";

// Square.propTypes = {
//   highLight: PropTypes.bool,
//   onClick: PropTypes.func,
//   value: PropTypes.string,
// };

function Square({ highLight, onClick, value }) {
  let className = "square" + (highLight ? " winner" : "");

  return (
    <button className={className} onClick={onClick}>
      {value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let highLight;
    if (
      this.props.squaresToHighLight != null &&
      this.props.squaresToHighLight.indexOf(i) !== -1
    )
      highLight = true;
    else highLight = false;

    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highLight={highLight}
      />
    );
  }

  render() {
    let highLight = this.props.squaresToHighLight;
    if (!highLight) highLight = [];

    let rows = [];
    for (var i = 0; i < 3; i++) {
      let squares = [];
      for (var j = 0; j < 3; j++) {
        squares.push(this.renderSquare(i * 3 + j));
      }
      rows.push(
        <div className="board-row" key={i}>
          {squares}
        </div>
      );
    }
    return <div>{rows}</div>;
  }
}

Board.propTypes = {
  squaresToHighLight: PropTypes.arrayOf(PropTypes.number),
  squares: squaresCountValidator,
  // squares: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClick: PropTypes.func,
};

function squaresCountValidator(props, propName) {
  if (props[propName].length !== 9) {
    return new Error(
      "9 squares must be passed in for the board to render properly"
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stepNumber: 0,
      history: [
        {
          squares: Array(9).fill(null),
          filledSquare: null,
        },
      ],
      xIsNext: true,
    };
  }

  nextPlayer() {
    return this.state.xIsNext ? "X" : "O";
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (this.calculateWinner(squares) || squares[i]) return;

    squares[i] = this.nextPlayer();
    this.setState({
      history: history.concat([
        {
          squares: squares,
          filledSquare: i,
        },
      ]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      xIsNext: isXNext(step),
      stepNumber: step,
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winResult = this.calculateWinner(current.squares);

    let status;

    if (winResult) {
      status = winResult.winner + " has won!";
    } else {
      if (this.isBoardFull(current.squares)) status = "Game over - draw";
      else status = "Next player: " + this.nextPlayer();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            squaresToHighLight={winResult ? winResult.combination : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <TimeTravel
            history={history}
            currentStep={this.state.stepNumber}
            onClick={(i) => this.jumpTo(i)}
          />
        </div>
      </div>
    );
  }

  calculateWinner(squares) {
    const winningLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < winningLines.length; i++) {
      const [a, b, c] = winningLines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        const result = {
          winner: squares[a],
          combination: winningLines[i],
        };
        return result;
      }
    }
    return null;
  }

  isBoardFull(squares) {
    for (var i = 0; i < squares.length; i++) {
      if (!squares[i]) return false;
    }
    return true;
  }
}

class TimeTravel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ascending: true,
    };
  }

  sort(isAscending) {
    this.setState({
      ascending: isAscending,
    });
  }

  render() {
    let history = this.props.history;

    let moves = history.map((step, move) => {
      return (
        <HistoryEntry
          key={move}
          move={move}
          square={step.filledSquare}
          xMoved={!isXNext(move)}
          isCurrent={this.props.currentStep === move}
          onClick={() => this.props.onClick(move)}
        />
      );
    });

    if (!this.state.ascending) {
      moves = moves.reverse();
    }

    const direction = this.state.ascending ? "↓" : "↑";

    return (
      <div>
        <button onClick={() => this.sort(!this.state.ascending)}>
          {direction}
        </button>
        {moves}
      </div>
    );
  }
}

TimeTravel.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      filledSquare: PropTypes.number,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

function HistoryEntry(props) {
  let buttonText;
  let extraText = null;
  if (props.move === 0) {
    buttonText = "go to game start";
  } else {
    buttonText = "go to move #" + props.move;
    let col = (props.square % 3) + 1;
    let row = Math.floor(props.square / 3) + 1;
    extraText =
      (props.xMoved ? "X" : "O") + " added on (" + col + ", " + row + ")";
  }

  return (
    <li className={props.isCurrent ? "current" : ""}>
      <button onClick={props.onClick}>{buttonText}</button>
      {extraText}
    </li>
  );
}

HistoryEntry.propTypes = {
  move: PropTypes.number.isRequired,
  square: PropTypes.number,
  xMoved: PropTypes.bool.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function isXNext(step) {
  return step % 2 === 0;
}
