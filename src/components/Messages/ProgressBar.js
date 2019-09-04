import React from 'react'
import { Progress } from 'semantic-ui-react';
const ProgressBar =({uploadState, percentUploaded})=>(
    uploadState === 'uploading' && (
        <Progress
        className="progress__bar"
        percent={percentUploaded}
        progress
        color="green"
        indicating
        size="medium"
        inverted
        />
    )
)
export default ProgressBar