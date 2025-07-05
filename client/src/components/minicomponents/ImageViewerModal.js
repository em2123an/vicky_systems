import { useState, useCallback} from "react"
import {TransformWrapper,TransformComponent, useControls} from 'react-zoom-pan-pinch'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import CenterFocusWeakRoundedIcon from '@mui/icons-material/CenterFocusWeakRounded';
import Rotate90DegreesCcwOutlinedIcon from '@mui/icons-material/Rotate90DegreesCcwOutlined';
import Rotate90DegreesCwOutlinedIcon from '@mui/icons-material/Rotate90DegreesCwOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Box, IconButton, Modal } from "@mui/material";


export default function ImageViewerModal({handleOpenImageRef}){
    const [openImageModal, setOpenImageModal] = useState(false)
    const [srcImageModal, setSrcImageModal] = useState('')
    const [rotateDeg, setRotateDeg] = useState(0)
    

    const handleOpenImageModal = (src)=>{
        setOpenImageModal(true)
        setSrcImageModal(src)
    }
    handleOpenImageRef.current = handleOpenImageModal
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