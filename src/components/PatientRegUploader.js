import { styled } from '@mui/material/styles'
import { Button, Container, Radio, RadioGroup,FormControl, FormControlLabel, FormLabel } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import {useState} from 'react'

export default function PatientRegUploader(){
    const [documentUploadType, setDocumentUploadType] = useState(null)

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });
    
    return <Container>
        <FormControl variant='outlined' sx={{m:1, p:2, border:'1px solid black'}} fullWidth>
            <FormLabel id="document-upload-radio-buttons-group" sx={{textAlign:'start'}}>Select Type of Document</FormLabel>
            <RadioGroup
                aria-labelledby="document-upload-radio-buttons-group"
                row
                sx={{p:2}}
                name="documentUpload"
                value={documentUploadType}
                onChange={(event)=>{
                    setDocumentUploadType(event.target.value)
                }}
            >
                <FormControlLabel value="prescription" control={<Radio />} label="Prescription" />
                <FormControlLabel value="attachment" control={<Radio />} label="Attachment" />
                <FormControlLabel value="screening" control={<Radio />} label="Screening" />
            </RadioGroup>
        </FormControl>
        <Button
            component='label'
            variant='contained'
            tabIndex={-1}
            startIcon={<CloudUploadIcon/>} 
            >Upload File
            <VisuallyHiddenInput type='file' onChange={(event)=>{
                //event.target.files
                //file list object used to upload files on server
            }}/>
        </Button>
    </Container>
}