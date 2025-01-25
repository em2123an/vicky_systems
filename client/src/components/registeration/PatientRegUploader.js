import { styled } from '@mui/material/styles'
import {Box, Button, Container, Radio, RadioGroup,FormControl, FormControlLabel, FormLabel, List, ListItem, Card, CardHeader, CardMedia, CardActions} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import {useState} from 'react'
import {format} from 'date-fns'
import {useMutation} from '@tanstack/react-query'
import axios from 'axios'

export default function PatientRegUploader({fullwidth=false}){
    const [documentUploadType, setDocumentUploadType] = useState("Prescription")
    const [fileUploaded, setFileUploaded] = useState([])

    const mutupload = useMutation({
        mutationKey:['documentuploads'],
        mutationFn: (newUpload)=>(
            axios.post('http://localhost:8080/putfileuploads',newUpload,
                {headers:{"Content-Type":"multipart/form-data"}})
            ),
        onSuccess: ()=>{
        }
    })

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

    if(mutupload.isError){
        console.log(mutupload.error)
    }
    
    return <Container>
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
                    //event.target.files
                    //file list object used to upload files on server
                    const formData = new FormData()
                    formData.append('documentUploadType', documentUploadType)
                    formData.append('uploadedDocument', event.target.files[0])
                    mutupload.mutate(formData)
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
                {fileUploaded.map((value, index)=>{
                    //show image for prescription
                    //make link for screening and attachment
                    return <ListItem>
                        <Card sx={{width:fullwidth?'100%':'64%'}}>
                            <CardHeader title={value.documentUploadType} subheader={format(new Date(Date.now()),'hh:mm:ss (eee) MMM do yyyy')}/>
                            <CardMedia
                                sx={{height:'94px'}}
                                src={value.file}
                                />
                            <CardActions sx={{display:'flex', justifyContent:'end'}}>
                                <Button variant='outlined' size='small' color='error' startIcon={<DeleteIcon />} onClick={()=>{
                                        //send the delete command
                                        //delete the document
                                        setFileUploaded((prev)=>{
                                            var newArr = prev
                                            newArr.splice(index,1)
                                            return [...newArr]
                                        })
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