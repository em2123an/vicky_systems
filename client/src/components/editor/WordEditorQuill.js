import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

export default function  WordEditorQuill({outerRef, height=500}) {
    const containerRef = useRef()//points to div element for quill to render on
    const quillRef = useRef(null)
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['clean']                                         // remove formatting button
    ];

    const pickedToolbarOptions =[
        [{ 'font': [] },{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline',],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ]

    useEffect(()=>{
        if(!quillRef.current){
            const container = containerRef.current;
            const editorContainer = container.appendChild(
                container.ownerDocument.createElement('div'),
            );
            console.log(editorContainer)
            quillRef.current = new Quill(editorContainer, {
                theme:'snow',
                modules:{toolbar: pickedToolbarOptions}
            })
        }
        outerRef.current = quillRef.current
        return ()=>{
            outerRef.current = null
        } 
    },[outerRef])
 
    return <Box ref={containerRef}  
                sx={{height, '.ql-container':{
                    height: `${height-70}px`
                }, '.ql-toolbar':{
                    height: '70px'
                },'.ql-editor':{
                    fontSize: '18px'
                }}}>
            </Box>
}

