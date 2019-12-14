import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v0', app);
main.use(bodyParser.json());

export const exampleApi = functions.https.onRequest(main);

// Add a fights
app.post('/fights', async (request, response) => {
    try {
        const { winner, loser, title } = request.body;
        const data = {
            winner,
            loser,
            title
        };
        const fightRef = await db.collection('fights').add(data);
        const fight = await fightRef.get();

        response.json({
            id: fight.id,
            data: fight.data()
        });
    } catch (error) {
        response.status(500).send(error);
    }
});

// Select a fight by id
app.get('/fights/:id', async (request, response) => {
    try{
        const fightId = request.params.id;
        if(!fightId) throw new Error("Fight Id is required!");

        const fight = await db.collection('fights').doc(fightId).get();
        if(!fight.exists){
            throw new Error("Fight doesn't exists.");
        }

        response.json({
            id: fight.id,
            data: fight.data()
        });
    }catch(error){
        response.status(500).send(error);
    }
});

// Select all fights
app.get('/fights', async (request, response) => {
    try{
        const fightQuerySnapshot = await db.collection('fights').get();
        const fights: any[] = [];
    
        fightQuerySnapshot.forEach(
            (doc) => {
                fights.push({
                    id: doc.id,
                    data: doc.data()
                });
            }
        )

        response.json(fights);
    }catch(error){
        response.status(500).send(error);
    }
});

// Update an existing fight
app.put('/fights/:id', async (request, response) => {
    try{
        const fightId = request.params.id;
        const title = request.body.title;

        if(!fightId) throw new Error("Fight Id is required!");
        if(!title) throw new Error("Fight title is required!");

        const data = {
            title
        };

        await db.collection('fights').doc(fightId).set(data, {merge: true});

        response.json({
            id: fightId,
            data: data
        });
    }catch(error){
        response.status(500).send(error);
    }
});

// Delete an existing fight
app.delete('/fights/:id', async (request, response) => {
    try{
        const fightId = request.params.id;
        if(!fightId) throw new Error("Fight Id is required!");

        await db.collection('fights')
            .doc(fightId)
            .delete();

        response.json({
            id: fightId
        });
    }catch(error){
        response.status(500).send(error);
    }
});
