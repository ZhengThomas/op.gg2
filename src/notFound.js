import React from 'react';
import "./notFound.css";
import TopBar from "./topBar.js";


export class NotFound extends React.Component{

    constructor(props){
        super(props);
    }
  
  
    render(){
        return(
            <div>
                <TopBar />
                <div className = "cantFindText">
                    <div className = "actualText">
                        <h1>We couldn't find that user. Check the spelling and try again</h1>
                        <h2>If you are certain you are correct, there is probably a server error. Contact me, or try again later</h2>
                    </div>
                </div>
            </div>
        )
    }

}
