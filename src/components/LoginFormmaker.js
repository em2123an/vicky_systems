import { Button, TextField, Stack, Divider, Avatar } from '@mui/material'
export default function LoginFormMaker(){
    return <Stack component='form' method='POST' action='http://localhost:3030/login' useFlexGap spacing={2} direction={'column'} sx={{width:350, borderRadius:1, border:'2px black solid',paddingX:4, paddingY:4, margin:'auto', marginTop:10}}>
        <Stack spacing={4} direction={'row'} sx={{justifyContent: "center", alignItems:'baseline'}}>
            <Avatar>V</Avatar>
            <h2>Viki Systems</h2>
        </Stack>
        <TextField required id='username' name='username' label='Username' variant='filled' 
        />
        <TextField required id='password' name='password' label='Password' type='password' variant='filled' 
        />
        <Divider variant='middle' orientation="horizontal" flexItem/>
        <Button variant='contained' size='large' type='submit' sx={{margin:["auto", "auto"]}}>Login</Button>
    </Stack>
}