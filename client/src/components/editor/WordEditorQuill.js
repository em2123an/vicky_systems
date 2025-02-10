import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useLayoutEffect, useRef } from 'react'

export default function  WordEditorQuill({outerRef}) {
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
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'align': [] }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
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
 
    return <div ref={containerRef}>
    </div> 
}

