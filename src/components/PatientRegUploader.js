import { styled } from '@mui/material/styles'
import {Box, Button, Container, Radio, RadioGroup,FormControl, FormControlLabel, FormLabel, List, ListItem, Typography, Card, CardHeader, CardMedia } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import {useState} from 'react'
import {format} from 'date-fns'

export default function PatientRegUploader(){
    const [documentUploadType, setDocumentUploadType] = useState("Prescription")
    const [fileUploaded, setFileUploaded] = useState([])

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
        <Box sx={{width:'70%', m:1, p:2, border:1, borderRadius:'8px', display:'flex', flexDirection:'column', justifyContent:'start', alignItems:'start'}}>
            <FormControl variant='outlined'>
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
                    <FormControlLabel value="Prescription" control={<Radio />} label="Prescription" />
                    <FormControlLabel value="Attachment" control={<Radio />} label="Attachment" />
                    <FormControlLabel value="Screening" control={<Radio />} label="Screening" />
                </RadioGroup>
            </FormControl>
            <Button
                sx= {{paddingX:4}}
                component='label'
                variant='contained'
                tabIndex={-1}
                startIcon={<CloudUploadIcon/>} 
                >Upload File
                <VisuallyHiddenInput type='file' onChange={(event)=>{
                    //event.target.files
                    //file list object used to upload files on server
                    setFileUploaded((prev)=>[...prev,{
                        documentUploadType,
                        file : event.target.files[0]
                    }])
                    console.log(event.target.files[0])
                    console.log(typeof(event.target.files.file))
                }}/>
            </Button>
        </Box>
        <Box>
            {fileUploaded && <List>
                {fileUploaded.map((value)=>{
                    var val = <></>
                    switch (value.file.type) {
                        case 'application/pdf':
                            val = <Typography>PDF</Typography>
                            break;
                        case 'image/png':
                            val = <Typography>Image png</Typography>
                            break
                        case 'image/jpeg':
                            val = <Typography>Image jpeg</Typography>
                            break
                        case 'image/jpg':
                            val = <Typography>Image jpg</Typography>
                            break
                        default:
                            break;
                    }
                    return <ListItem>
                        <Card sx={{width:'64%'}}>
                            <CardHeader title={value.documentUploadType} subheader={format(new Date(Date.now()),'hh:mm:ss (eee) MMM do yyyy')}/>
                            
                        </Card>
                    </ListItem>
                })}
            </List>
            }
        </Box>
    </Container>
}