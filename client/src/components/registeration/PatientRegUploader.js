import { styled } from '@mui/material/styles'
import {Box, Button, Container, Radio, RadioGroup,FormControl, FormControlLabel, FormLabel, List, ListItem, Card, CardHeader, CardMedia, CardActions, CardContent} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import {useState} from 'react'
import {format, toDate} from 'date-fns'
import PDFSvg from '../../assets/images/pdf_svg.svg'

export default function PatientRegUploader({fullwidth=false, handleUploadClick, 
    handleFileDeleteClick, fileUploaded}){
    const [documentUploadType, setDocumentUploadType] = useState("Prescription")

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
        {/* for choosing the document type and file */}
        <Box
            sx={{width:fullwidth?'100%':'70%', m:1, p:2, border:1, borderRadius:'8px', display:'flex', flexDirection:'column', justifyContent:'start', alignItems:'start'}}>
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
                <VisuallyHiddenInput name='uploadedfile' type='file' onChange={(event)=>{
                    handleUploadClick(documentUploadType, event)
                }}/>
            </Button>
        </Box>
        {/* List of uploaded or selected documents */}
        <Box>
            {fileUploaded.length!==0 && <List>
                {fileUploaded.map((value, index)=>{
                    //show image for prescription
                    //make link for screening and attachment
                    if(value.mimetype.includes('application/pdf')){
                        //treat as link 
                        console.log('pdf')
                    }else if (value.mimetype.includes('image')){
                        //treat as image
                        console.log('image')
                    }
                    return <ListItem key={index}>
                        <Card sx={{width:fullwidth?'100%':'64%'}}>
                            <CardHeader sx={{m:0, p:0, paddingLeft:2}} title={value.documentUploadType} subheader={format(toDate(value.uploadedAt),'hh:mm:ss (eee) MMM do yyyy')}/>
                            <CardContent sx={{m:0, p:0, paddingLeft:2}}>
                                <img src={PDFSvg} height={100} alt='pdf' />
                            </CardContent>
                            <CardActions sx={{m:0, p:1,display:'flex', justifyContent:'end'}}>
                                <Button variant='outlined' size='small' color='error' startIcon={<DeleteIcon />} onClick={()=>{
                                        //send the delete command
                                        //delete the document
                                        //TODO:figure out what to send as an argument
                                        handleFileDeleteClick(index)
                                    }}>Delete</Button>
                            </CardActions>
                        </Card>
                    </ListItem>
                })}
            </List>
            }
        </Box>
    </Container>
}