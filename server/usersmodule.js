import express from 'express'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import mariadb from 'mariadb'
import bcrypt from 'bcrypt'

dotenv.config({path:['.env.local']})
//create a pool of connections
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    supportBigNumbers: true,
    bigNumberStrings: true
})

const router = express.Router()

function generateAccessToken(user){
    return jwt.sign(
        {userid:user.userid, permissions:user.permissions},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'1m'}
    )
}

function generateRefreshToken(user){
    return jwt.sign(
        {userid:user.userid, permissions:user.permissions},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:'1d'}
    )
}

async function loginuser(fields){
    return new Promise(async(resol,rejec)=>{
        let conn
        try {
            conn = await pool.getConnection()
            const authuser = await conn.query(
                `SELECT password_hash, userid FROM accounts WHERE username=?`,[fields.username]
            )
            if(!authuser || authuser.length!==1){
                resol([])
                return
            }
            if(!bcrypt.compareSync(fields.password,authuser[0].password_hash)){
                resol([])
                return
            }
            const users = await conn.query(
                `SELECT u.userid, u.firstname, u.lastname, a.username,  JSON_ARRAYAGG(aa.activityname) as permissions
                FROM accounts AS a INNER JOIN users AS u 
                    ON a.userid=u.userid AND a.userid=?
                INNER JOIN roles AS r ON a.roleid=r.roleid 
                INNER JOIN role_allowed_activities AS raa ON raa.roleid = r.roleid
                INNER JOIN allowed_activities AS aa ON raa.allowedactivityid=aa.activityid
                GROUP BY r.roleid
                `,[authuser[0].userid]
            )
            resol(users)
        }catch(err){
            console.error(err.message)
            rejec(err)
        }finally {
            if(conn) conn.release()
        }
    })
}
router.post('/sigupuser',cookieParser,bodyParser.urlencoded({extended:true}),(req,res)=>{
    //todo:db sign up
})
router.get('/loginuser',cookieParser,bodyParser.urlencoded({extended:true}),(req,res)=>{
    //todo:db authentication
    loginuser(req.body).then((users)=>{
        if(users.length!==1){
            //authentication failed
            res.sendStatus(401).end()
        }else{
            //authentication success
            const user = users[0]
            //get access token
            const accessToken = generateAccessToken(user)
            //get refresh token
            const refreshToken = generateRefreshToken(user)
            //send refresh token with res.cookie as http only 
            res.cookie('refreshtoken', refreshToken, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                sameSite: 'strict',
                httpOnly: true,
                secure: false
            })
            //send access token with res and save on state
            res.json({
                user,
                accesstoken: accessToken
            }).end()
        }
    }).catch((err)=>{
        res.status(504).end(err.message)
    })
})

router.get('/getnewaccesstoken',cookieParser,bodyParser.urlencoded({extended:true}),(req,res)=>{
    //verify refresh token
    //don't forget to config withCredentials=true to send refresh token
    try {
        //get refresh token from cookies
        //req.headers.authorization
        const sentRefToken = req.cookies.refreshtoken
        if(!sentRefToken) throw new Error("Empty Refresh Token")
        const decodedUser = jwt.verify(sentRefToken,process.env.REFRESH_TOKEN_SECRET)
        //get access token
        const accessToken = generateAccessToken(decodedUser)
        //send access token with res and save on state
        res.json({
            user,
            accesstoken: accessToken
        }).end()
    } catch (err) {
        res.status(401).end(err.message)
    }
})

export default router;

//middlewares

export function verifyUserAccessToken(req,res,next){
    //verify access token
    try {
        //get accesstoken
        const authHeader = req.headers.authorization
        const sentRefToken = authHeader && authHeader.split(' ')[1]
        if(!sentRefToken) throw new Error("Empty token sent")
        const decodedUser = jwt.verify(sentRefToken,process.env.ACCESS_TOKEN_SECRET)
        req.user = decodedUser
        next()
    } catch (err) {
        res.status(401).end(err.message)
    }
}

//remember needs to be called; high order function
export function verifyUserPermission (allowedPermission){
    /*needs to be called with the permission to be tested as argument; high order function */
    return (req,res,next)=>{
        try {
            const userPermissions=req.user.permissions
            if(userPermissions.include(allowedPermission)){
                //user has permission
                next()
            }else{
                throw new Error("User doesn't have a permission")
            }
        } catch (err) {
            res.status(401).end(err.message)
        }
    }
}

function foundAnyMatch(arr1,arr2){
    const longarr = arr1.length>=arr2.length?arr1:arr2;
    const shortarr = longarr===arr1?arr2:arr1
    for(const larrv of longarr){
        if(shortarr.include(larrv)) return true
    }
    return false
}

export function verifyUserPermissionAny (allowedPermissions){
    return (req,res,next)=>{
        try {
            const userPermissions=req.user.permissions
            if(!userPermissions || userPermissions.length==0) throw new Error("User have no permission")
            if(foundAnyMatch(allowedPermissions,userPermissions)){
                //user has permission
                next()
            }else{
                throw new Error("User doesn't have a permission")
            }
        } catch (err) {
            res.status(401).end(err.message)
        }
    }
}