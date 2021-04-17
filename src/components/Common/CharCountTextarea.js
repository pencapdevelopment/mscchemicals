import React from "react";
import styled from "styled-components";

class CharCountTextarea extends React.Component {
    state = {
        loading: false,
        charsLeft: null,
        maxChars: null
    };

    componentDidMount() {
        this.setState({ maxChars: this.props.maxChars });
        this.handleCharCount(this.props.value);
    }

    handleCharCount = value => {
        const { maxChars } = this.props;
        const charCount = value.length;
        const charsLeft = maxChars - charCount;
        this.setState({ charsLeft });
    };

    handleChange = event => {
        this.handleCharCount(event.target.value);
        this.props.onChange(event);
    };

    renderCharactersLeft = () => {
        const { charsLeft } = this.state;

        let content;
        if (charsLeft >= 0) {
            content = <SpanOK>{`${charsLeft} / ${this.state.maxChars}`}</SpanOK>;
        } else if (charsLeft != null && charsLeft < 0) {
            const string = charsLeft.toString().substring(1);
            content = <SpanError>{`too many characters: ${string}`}</SpanError>;
        } else {
            content = null;
        }
        return content;
    };

    renderCredits = () => {
        // const { charsLeft } = this.state;
        const regex =new RegExp("/[^\\\x00-\xFF]+/");

        const charCompleted = this.props.value.length;
        var credits = 0;

        if(regex.test(this.props.value)) {
            credits = Math.ceil(charCompleted / 70);
        } else {
            credits = Math.ceil(charCompleted / 160);
        }

        return <SpanCredits>{charCompleted} Characters, {credits} Credits</SpanCredits>;
    };

    render() {
        const {  maxLength, rows, value, className, placeholder, disabled } = this.props;

        return (
            <Div>
                <textarea
                    onChange={this.handleChange}
                    maxLength={maxLength}
                    rows={rows}
                    value={value}
                    className={className}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                ></textarea>
                {/* {this.renderCharactersLeft()} */}
                {this.renderCredits()}
            </Div>
        );
    }
}

export default CharCountTextarea;

const Div = styled.div`
    display: flex;
    flex-direction: column;
  `;

const Span = styled.span`
    align-self: flex-end;
    font-size: 0.9rem;
    margin: -25px 8px 10px 0;
    z-index: 1;
  `;

const SpanOK = styled(Span)`
    color: black;
  `;

const SpanError = styled(Span)`
    color: red;
  `;

const SpanCredits = styled(Span)`
  color: black;
  margin-top: 5px;
`;