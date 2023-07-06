import React from 'react'

const HighlightButton = (props) => {
    const highlightColor = `linear-gradient(${props.highlightColor},${props.highlightColor})`
    const style = { ...props.style, backgroundImage: highlightColor }

    return (
        <div className="div-button" style={style} onClick={props.onClick}>
            <div className='div-btn-right' style={{ backgroundImage: highlightColor }}>
                <div className='div-btn-left' style={{ backgroundImage: highlightColor }}>
                    <div className='div-btn-top' style={{ backgroundImage: highlightColor }} />
                </div>
            </div>
            <div>{props.name}</div>
        </div>
    )
}

HighlightButton.defaultProps = {
    style: {},
    className: '',
    highlightColor: 'var(--text-color-red)',
    onClick: () => { console.log('BTN Clicked') },
}

export default HighlightButton