import React, {useEffect, useState} from 'react';
import './isolated-styles.css';
import ExDialog from "./components/SeelieExDialog";

function App() {

    const [showExDialog, setShowExDialog] = useState(() => false)

    useEffect(() => {
        GM_registerMenuCommand("打开SeelieEx", () => setShowExDialog(true))
        GM_registerMenuCommand("关闭SeelieEx", () => setShowExDialog(false))
        GM_registerMenuCommand("意见反馈", () => GM_openInTab("https://github.com/Owwkmidream/seelieEx/issues"))
    })

    return (
        <div className="seelie-App" style={{display: showExDialog ? "" : "none"}}>
            <ExDialog/>
        </div>
    );
}


export default App;
