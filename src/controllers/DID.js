const sdk = require('api')('@d-id/v4.2.0#1f3wxrelm7g7po0');
const dotenv = require('dotenv').config();
sdk.auth(process.env.API_KEY_D_ID);

const TIME_OUT = 30;

async function clipGenerate(text){
    try {
        let resp = await sdk.createClip({
            driver_id: 'uM00QMwJ9x',
            script: {
                type: 'text',
                provider: {
                    type: 'microsoft', voice_id: 'es-AR-ElenaNeural'
                },
                ssml: 'false',
                input: `${text}`,
            },
            config: {result_format: 'mp4'},
            presenter_id: 'amy-jcwCkr1grs',
            background: {color: '#74c0c0'}
        });
        console.log(resp.data);
        return resp.data.id;
    } catch (error) {
        console.log(resp.data);
        return error;
    }
}

async function getPresenterImageUrlByID(presenterID){
    try {
        let resp = sdk.getPresenterById({id: 'amy-jcwCkr1grs'});
        return resp.data.image_url;
    } catch (error) {
        return error;
    }
}

async function getClipUrlByID(videoID){
    try {
        let timeOutInSeconds = TIME_OUT;
        let resp = await sdk.getClip({id: `${videoID}`});    
        do {
            resp = await sdk.getClip({id: `${videoID}`});    
            await new Promise(resolve => setTimeout(resolve, 1000));
            timeOutInSeconds--;
            console.log(timeOutInSeconds)
            console.log(resp.data)
        } while (resp.data.status != 'done' || timeOutInSeconds === 0);        
        if(resp.data.status === 'done')return resp.data.result_url;
        else throw new Error('timeout error');
    } catch (error) {
        console.log(error)
        return error;
    }
}

const DID = {};

DID.test = (req, res) => {
    try {
        const mensaje = req.body;
        res.status(200).send("OK");
    } catch (error) {
        res.status(400).send(error.message);
    }
}

DID.createVideo = async (req, res) => {
    try {
        const message = req.body.Body;
        const profileName = req.body.ProfileName;
        const from = req.body.WaId;
        sendObjetcToSocket(req.socketChat, {type: 'message', message, profileName, from});
        const videoID = await clipGenerate(message);
        sendObjetcToSocket(req.socketChat, {type: 'generating-video'});
        const videoUrl = await getClipUrlByID(videoID);
        sendObjetcToSocket(req.socketChat, {type: 'video-generated'});
        sendObjetcToSocket(req.socketChat, {type: 'videoUrl', videoUrl});
        res.status(200).send("OK");  
    } catch (error) {
        sendObjetcToSocket(req.socketChat, {type: 'error', error: error.message});
        res.status(400).send(error.message);
    }
}

function sendObjetcToSocket(socket, object){
    socket.send( JSON.stringify(object));
}
module.exports = {DID};