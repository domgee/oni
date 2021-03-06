import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

import { Motion, spring } from "react-motion"

import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"

export interface ICursorRendererProps {
    animated: boolean
    x: number
    y: number
    scale: number
    width: number
    height: number
    mode: string
    color: string
    textColor: string
    character: string
    fontFamily: string
    fontSize: string
    fontPixelWidth: number
    visible: boolean

    typingPrediction: TypingPredictionManager
}

require("./Cursor.less") // tslint:disable-line no-var-requires

export interface ICursorRendererState {
    predictedCharacters: number
}

class CursorRenderer extends React.PureComponent<ICursorRendererProps, ICursorRendererState> {

    constructor(props: ICursorRendererProps) {
        super(props)

        this.state = {
            predictedCharacters: 0,
        }
    }

    public componentDidMount(): void {
        this.props.typingPrediction.onPredictionsChanged.subscribe((predictions) => {
            this.setState({
                predictedCharacters: predictions.length,
            })
        })
    }

    public render(): JSX.Element {

        const fontFamily = this.props.fontFamily
        const fontSize = this.props.fontSize

        const isInsertCursor = this.props.mode === "insert" || this.props.mode === "cmdline_normal"
        const height = this.props.height ? this.props.height.toString() + "px" : "0px"
        const width = isInsertCursor ? 0 : this.props.width
        const characterToShow = isInsertCursor ? "" : this.props.character

        const containerStyle: React.CSSProperties = {
            visibility: this.props.visible ? "visible" : "hidden",
            position: "absolute",
            left: (this.props.x + this.state.predictedCharacters * this.props.fontPixelWidth).toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height,
            lineHeight: height,
            color: this.props.textColor,
            fontFamily,
            fontSize,
        }

        const innerPositionStyle: React.CSSProperties = {
            position: "absolute",
            left: "0px",
            right: "0px",
            bottom: "0px",
            top: "0px",
        }

        const cursorBlockStyle: React.CSSProperties = {
            ...innerPositionStyle,
            backgroundColor: this.props.color,
        }

        const cursorCharacterStyle: React.CSSProperties = {
            ...innerPositionStyle,
            textAlign: "center",
            color: this.props.textColor,
        }

        if (!this.props.animated) {
            return this._renderCursor(containerStyle, cursorBlockStyle, cursorCharacterStyle, characterToShow)
        } else {
            return <Motion defaultStyle={{scale: 0}} style={{scale: spring(this.props.scale, { stiffness: 120, damping: 8})}}>
            {(val) => {
                const cursorStyle = {
                    ...cursorBlockStyle,
                    transform: "scale(" + val.scale + ")",
                }
                return this._renderCursor(containerStyle, cursorStyle, cursorCharacterStyle, characterToShow)
            }}
            </Motion>
        }
    }

    private _renderCursor(containerStyle: React.CSSProperties, cursorBlockStyle: React.CSSProperties, cursorCharacterStyle: React.CSSProperties, characterToShow: string): JSX.Element {
            return <div style={containerStyle} className="cursor">
                <div style={cursorBlockStyle} />
                <div style={cursorCharacterStyle}>{characterToShow}</div>
            </div>
    }
}

export interface ICursorProps {
    typingPrediction: TypingPredictionManager
}

const mapStateToProps = (state: State.IState, props: ICursorProps): ICursorRendererProps => {
    return {
        ...props,
        animated: State.readConf(state.configuration, "ui.animations.enabled"),
        x: state.cursorPixelX, // + state.typingPredictions.length * state.cursorPixelWidth,
        y: state.cursorPixelY,
        scale: state.mode === "operator" ? 0.8 : state.cursorScale,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        mode: state.mode,
        color: state.foregroundColor,
        textColor: state.backgroundColor,
        character: state.cursorCharacter,
        fontPixelWidth: state.fontPixelWidth,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: State.readConf(state.configuration, "editor.fontSize"),
        visible: !state.imeActive,
    }
}

export const Cursor = connect(mapStateToProps)(CursorRenderer)
