import { Box, CircularProgress, Typography, Stack, FormControl, FormLabel, FormControlLabel, RadioGroup, Radio, TextField } from "@mui/material";
import WordEditorQuill from "./WordEditorQuill";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios'

export default function ScreeningHistory(){
    const quillRef = useRef()
    const [screenData, setScreenData] = useState({})
    const{isPending:isScreenigFormatLoading, isError:isScreeningFormatError, isSuccess:isScreeningFormatSuccess, 
        data:screeningFormatData}=useQuery({
        queryKey:['get_screeningformat'], 
        queryFn: ()=>(axios.get('http://localhost:8080/getscreeningformat')),
        gcTime : 'Infinity',
        select : (response)=>(response.data)
    })
    useEffect(()=>{
        //intial setup to connect with state
        if(isScreeningFormatSuccess && screeningFormatData){
            var editedFormatObj = {}
            for (var question of screeningFormatData){
                const title = question.questiontitle
                editedFormatObj = {...editedFormatObj, [title] : {
                    value:question.value,
                    title:title,
                    questionmode:question.questionmode
                }}
            }
            setScreenData(editedFormatObj)
        }
    },[screeningFormatData])

    const FormatYesNoMaker = ({question})=>{
        const qtitle = question.title?question.title:''
        return <FormControl variant='outlined'>
                <FormLabel sx={{textAlign:'start'}}></FormLabel>
                <RadioGroup
                    row
                    sx={{p:1}}
                    name={qtitle}
                    value={screenData[qtitle]['value']?screenData[qtitle]['value']:false}
                    onChange={(event)=>{
                        setScreenData((prev)=>{
                            return {
                                ...prev,
                                [qtitle]:{
                                    value:event.target.value,
                                    title:qtitle,
                                    questionmode:question.questionmode
                                }
                            }
                        })
                    }}
                >
                    <FormControlLabel value={false} control={<Radio />} label="No" />
                    <FormControlLabel value={true} control={<Radio />} label="Yes" />
                </RadioGroup>
            </FormControl>
    }

    const FormatMakerFromAPI = ({listScreeningDatas})=>{
        var listQuestionCmpnts = []
        for(var [title, question] of Object.entries(listScreeningDatas) ){
            if(question.questionmode && question.questionmode==='YN'){
                //make a yes no radiobutton
                listQuestionCmpnts = [...listQuestionCmpnts, 
                <Stack direction={'row'}>
                    <Box sx={{display:'flex', flexDirection:'row', justifyContent:'start', alignItems:'baseline'}}>
                        <Typography variant="body" sx={{alignSelf:'center'}}>{question.title?question.title:''}</Typography>
                        <FormatYesNoMaker question={question?question:{}}/>
                    </Box>
                </Stack>
                ]
            }else if (question.questionmode && question.questionmode==='VAL'){
                //make text field
                listQuestionCmpnts = [...listQuestionCmpnts, 
                    <Stack direction={'row'}>
                        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'baseline', alignItems:'baseline'}}>
                            <Typography variant="body">{question.title}</Typography>
                            <TextField value={screenData[question.title]['value']} onChange={(event)=>{
                                setScreenData((prev)=>{
                                    return{
                                        ...prev,
                                        [question.title]:{
                                            value:event.target.value,
                                            title:question.title,
                                            questionmode:question.questionmode
                                        }
                                    }
                                })
                            }} variant="standard" name={question.title} />
                        </Box>
                    </Stack>
                ]
            } else{
                listQuestionCmpnts = [...listQuestionCmpnts, <></>] 
            }
        }
        return <Box sx={{display:'flex', flexDirection:'column', justifyContent:'start', alignItems:'start'}}>
                {listQuestionCmpnts}
        </Box>
    }

    return <Box
            sx={{display:'flex', flexDirection:'column',justifyContent:'start', alignItems:'start'}}
    >
        <WordEditorQuill outerRef={quillRef}/>
        {isScreenigFormatLoading?
            <CircularProgress sx={{justifySelf:'center'}}/>
        : isScreeningFormatError ? <Typography>Failed to Load the screening format. Try Again</Typography>
        : isScreeningFormatSuccess &&
            <FormatMakerFromAPI listScreeningDatas={screenData}/>
        }
    </Box>
}