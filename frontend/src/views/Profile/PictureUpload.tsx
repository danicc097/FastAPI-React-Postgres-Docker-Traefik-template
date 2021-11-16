import { EuiButton, EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiFormHelpText } from '@elastic/eui'
import React, { Fragment, useRef, useState } from 'react'

export default function PictureUpload() {
  const [files, setFiles] = useState<GenObjType<any>>({})
  const filePickerRef: any = useRef()

  const onChange = (files) => {
    setFiles(files.length > 0 ? files : {})
  }
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFormHelpText>Upload a profile picture</EuiFormHelpText>
      </EuiFlexItem>
      <Fragment>
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            <EuiFilePicker
              ref={filePickerRef}
              id="programmatic"
              multiple
              initialPromptText="Select or drag and drop multiple files"
              onChange={onChange}
              display="default"
              aria-label="Use aria labels when no actual label is in use"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              color="danger"
              iconType="trash"
              disabled={files.length > 0 ? false : true}
              onClick={() => filePickerRef.current.removeFiles()}
            >
              <h3>Remove files</h3>
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    </EuiFlexGroup>
  )
}
