const fetch = require('node-fetch');
const Audius = {}

async function searchMusicByName (name){
    try {
        const response = await fetch(
            `https://audius-discovery-18.cultur3stake.com/v1/tracks/search?query=${name}&app_name=EXAMPLEAPP`,
            {
                method: 'GET',
                headers: {'Accept':'application/json'}
            }
        )
        const data = await response.json();
        return data.data;
    } catch (error) {
        return error;
    }
}

Audius.test = async (req, res) => {
    try {
        const message = req.body.Body;
        const profileName = req.body.ProfileName;
        const from = req.body.WaId;
        sendObjetcToSocket(req.socketChat, {type: 'message', message, profileName, from});
        const music = await searchMusicByName(message);
        const musicID = music[0].id;
        const musicTitle = music[0].title;
        const url = `https://audius-discovery-18.cultur3stake.com/v1/tracks/${musicID}/stream?app_name=EXAMPLEAPP`;
        sendObjetcToSocket(req.socketChat, {type: "music", url: url, title: musicTitle});
        res.status(200).send("OK");
    } catch (error) {
        sendObjetcToSocket(req.socketChat, {type: "error", error: error.message});
        res.status(400).send(error.message);
    }
}

function sendObjetcToSocket(socket, object){
    socket.send( JSON.stringify(object));
}
module.exports = {Audius}