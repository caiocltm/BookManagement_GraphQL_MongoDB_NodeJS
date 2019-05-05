import React from 'react';
import './LoadingSpinner.css';


const LoadingSpinner = () => 
    <div className="loading__spinner">
        <div className="lds-grid">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>;


export default LoadingSpinner;
