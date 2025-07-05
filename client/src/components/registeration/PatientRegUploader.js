import { styled } from '@mui/material/styles'
import {Box, Button, Container, Radio, RadioGroup,FormControl, FormControlLabel, FormLabel, List, ListItem, Card, CardHeader, CardActions, CardContent, Link, Modal, IconButton} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import {useCallback, useState} from 'react'
import {format, toDate} from 'date-fns'
import {TransformWrapper,TransformComponent, useControls} from 'react-zoom-pan-pinch'
import ScreeningHistory from '../minicomponents/ScreeningHistory'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import CenterFocusWeakRoundedIcon from '@mui/icons-material/CenterFocusWeakRounded';
import Rotate90DegreesCcwOutlinedIcon from '@mui/icons-material/Rotate90DegreesCcwOutlined';
import Rotate90DegreesCwOutlinedIcon from '@mui/icons-material/Rotate90DegreesCwOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import PDFSvg from '../../assets/images/pdf_svg.svg'

export default function PatientRegUploader({fullwidth=false, handleUploadClick, 
    handleFileDeleteClick, fileUploaded}){
    const [documentUploadType, setDocumentUploadType] = useState("Prescription")
    const [openImageModal, setOpenImageModal] = useState(false)
    const [openWordEditorModal, setOpenWordEditorModal] = useState(false)
    const [srcImageModal, setSrcImageModal] = useState('')
    const [rotateDeg, setRotateDeg] = useState(0)
    

    const handleOpenImageModal = (src)=>{
        setOpenImageModal(true)
        setSrcImageModal(src)
    }
    const handleCloseImageModal = ()=>{
        setOpenImageModal(false)
        setSrcImageModal('')
    }
    const handleImgClockwiseRot = useCallback(()=>{
        setRotateDeg((prevRotation)=>{
            return ((prevRotation + 90)%360)
        })
    },[setRotateDeg])
    const handleImgAntiClockwiseRot = useCallback(()=>{
        setRotateDeg((prevRotation)=>{
            return ((prevRotation - 90)%360)
        })
    },[setRotateDeg])

    function openNewPDFTab(isLocalLoad, filePath, file){
        try {
            if(!isLocalLoad){
                //filePath is base64encoded
                if(!window.open(filePath,'_blank','noopener noreferrer')){throw new Error()}
            }
            else{
                //using file
                const urlForFile = window.URL.createObjectURL(file)
                if(!window.open(urlForFile,'_blank','noopener noreferrer')){throw new Error()}
                window.URL.revokeObjectURL(urlForFile)
            }
        } catch (error) {
            console.log(error)
            return
        }
    }
    
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
    
    const ImageViewerModalControls = ()=>{
        const {zoomIn,zoomOut,centerView,resetTransform} = useControls()

        return <Box sx={{display:'flex', justifyContent:'right'}}>
            <IconButton onClick={()=>handleImgAntiClockwiseRot()}><Rotate90DegreesCcwOutlinedIcon/></IconButton>
            <IconButton onClick={()=>handleImgClockwiseRot()}><Rotate90DegreesCwOutlinedIcon/></IconButton>
            <IconButton onClick={()=>zoomIn()}><ZoomInRoundedIcon/></IconButton>
            <IconButton onClick={()=>zoomOut()}><ZoomOutRoundedIcon/></IconButton>
            <IconButton onClick={()=>{
                resetTransform()
                setRotateDeg(0)
                }}><RestoreOutlinedIcon/></IconButton>
            <IconButton onClick={()=>centerView()}><CenterFocusWeakRoundedIcon/></IconButton>
            <IconButton onClick={()=>{handleCloseImageModal()}}><CloseOutlinedIcon/></IconButton>
        </Box>
    }
    
    const ImageViewerModal = () =>{
        return <Modal
            open={openImageModal && (Boolean(srcImageModal))}
            onClose={handleCloseImageModal}
        >
            <Box sx={{p:2,boxShadow:24,bgcolor:'background.paper',position:'absolute', top:'0%', left:'10%'}}>{/* define style of modal here */}
                <TransformWrapper
                    minScale={0.2}
                    initialPositionX={200}
                    initialPositionY={100}
                    centerOnInit={true}
                    initialScale={1}
                >
                    {({zoomIn, zoomOut, resetTransform, centerView, ...rest})=>(
                        <>
                            <ImageViewerModalControls/>
                            <TransformComponent
                                wrapperStyle={{height:'100vh', width:'100vh'}}
                                contentStyle={{display:'flex',justifyContent:'center', alignItems:'center', height:'100vh', width:'100%'}}>
                                <img alt='attached modal' src={srcImageModal} style={{objectFit:'contain',maxWidth:'100wh',maxHeight:'100vh', transform:`rotate(${rotateDeg}deg)`}} />
                            </TransformComponent>
                        </> 
                    )}
                </TransformWrapper>
            </Box>
        </Modal>
    }
    
    const WordEditorModal = ()=>{
        return <Modal
                open={openWordEditorModal}
                onClose={()=>{setOpenWordEditorModal(false)}}
        >
            <Box sx={{p:2,boxShadow:24,bgcolor:'background.paper',position:'absolute', top:'0%', left:'20%'}}>
                <ScreeningHistory/>
            </Box>
        </Modal>
    }

    return <Container>
        {/* for choosing the document type and file */}
        <Box
            sx={{width:fullwidth?'100%':'70%', m:1, p:2, border:1, borderRadius:'8px',
            display:'flex', flexDirection:'column', justifyContent:'start', alignItems:'start'}}>
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
        <Button variant='contained' onClick={()=>{setOpenWordEditorModal(true)}}>Open Editor</Button>
        {/* Image viewing modal */}
        <ImageViewerModal/>
        {/* Word processing modal */}
        <WordEditorModal/>
        <Box>
            {fileUploaded.length!==0 && <List>
                {fileUploaded.map((value, index)=>{
                    var imagePDFSrc = value.filePath?value.filePath:''
                    //show image for prescription
                    //make link for screening and attachment
                    if(null){if(value.mimetype.includes('application/pdf')){
                        //treat as link 
                        console.log('pdf')
                    }else if (value.mimetype.includes('image')){
                        //treat as image
                        console.log('image')
                    }}
                    return <ListItem key={index}>
                        <Card sx={{width:fullwidth?'100%':'64%'}}>
                            <CardHeader sx={{m:0, p:0, paddingLeft:2}} title={value.documentUploadType}
                                subheader={value.uploadedAt?format(toDate(value.uploadedAt),'hh:mm:ss (eee) MMM do yyyy'):"Waiting for upload..."}
                                 />
                            <CardContent sx={{m:0, p:0, paddingLeft:2}}>
                                {value.mimetype.includes('application/pdf')?
                                    <Link component={'button'} onClick={()=>{openNewPDFTab(value.isLocalLoad,value.filePath, value.file)}} rel='noopener noreferrer' target='_blank'>
                                        <img src={PDFSvg} height={100} alt='pdf' />
                                    </Link>
                                    : value.mimetype.includes('image')?
                                    <>
                                        <img src={imagePDFSrc} width={100} height={100} alt='attached images' 
                                            onClick={()=>{handleOpenImageModal(imagePDFSrc)}}/>
                                    </>:
                                    <Link rel='noopener noreferrer' target='_blank' href={''}>
                                        <img src={PDFSvg} height={100} alt='unknown' />
                                    </Link>
                                }
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