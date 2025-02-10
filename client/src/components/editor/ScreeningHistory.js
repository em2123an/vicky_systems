import { Box, CircularProgress, Typography, Stack, FormControl, FormControlLabel, RadioGroup, Radio, TextField } from "@mui/material";
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
                editedFormatObj = {...editedFormatObj, [title] : question.value}
            }
            setScreenData(editedFormatObj)
        }
    },[screeningFormatData])

    if(isScreeningFormatSuccess){
        console.log('screen data', screenData)
        console.log('axios', screeningFormatData)
    }

    const FormatYesNoMaker = ({question})=>{
        const qtitle = question.questiontitle
        return <FormControl variant='outlined'>
                <RadioGroup
                    row
                    sx={{p:1}}
                    name={qtitle}
                    value={screenData[qtitle]}
                    onChange={(event)=>{
                        setScreenData((prev)=>{
                            return {
                                ...prev,
                                [qtitle]:event.target.value
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
        return <Box sx={{display:'flex', flexDirection:'column', justifyContent:'start', alignItems:'start'}}>
                {listScreeningDatas.map((question)=>{
                    if(question.questionmode==='YN'){
                        //make a yes no radiobutton
                        return <Stack direction={'row'}>
                                    <Typography variant="body">{question.questiontitle}</Typography>
                                    <FormatYesNoMaker question={question}/>
                            </Stack>
                    }else if (question.questionmode==='VAL'){
                        //make text field
                        return <Stack direction={'row'}>
                                    <Typography variant="body">{question.questiontitle}</Typography>
                                    <TextField value={screenData[question.questiontitle]} onChange={(event)=>{
                                        setScreenData((prev)=>{
                                            return{
                                                ...prev,
                                                [question.questiontitle]:event.target.value
                                            }
                                        })
                                    }} variant="standard" name={question.questiontitle} />
                            </Stack>
                    } else{
                        return <></>
                    }
                })}
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