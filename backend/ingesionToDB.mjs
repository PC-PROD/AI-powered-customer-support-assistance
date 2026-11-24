import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);
import { MongoClient, ServerApiVersion } from 'mongodb';
import chunkDocs from './fileReadAndEmbed.mjs';

// Replace the placeholder with your Atlas connection string
let mongoPassword = process.env.MONGOPASS;
const uri = `mongodb+srv://root:${mongoPassword}@cluster0.e8cusdk.mongodb.net/`;

export function mCursor(){
    let client = new MongoClient(uri);
    let myDB = client.db('llm');
    let collection = myDB.collection('embed');

    return [client, collection];
}


// Insert data into the collection
export async function insertDataToDB() {
    const [client, cursor] = mCursor();
    try {
        let data = await chunkDocs();

        // {"text1.txt": [{text: "cwe", embed: []}, {text: "ciewbcu", embed: []}]}
        let docToInsert = [];
        for (let key in data) {
            for (let elem of data[key]) {
                docToInsert.push({
                    name: key,
                    text: elem['text'],
                    embeded: elem['embed']
                })
            }
        }

        if (docToInsert.length > 0) await cursor.insertMany(docToInsert);

        let searchIndexes = await cursor.listSearchIndexes().toArray();
        if (searchIndexes.length === 0) {
            // create a new search index
            let searchIndex = {
                name: "policy_index",
                type: "vectorSearch",
                definition: {
                    fields: [
                        {
                            type: "vector",
                            numDimensions: 768,
                            path: "embeded",
                            similarity: "cosine"
                        }
                    ]
                }
            }
            await cursor.createSearchIndex(searchIndex);
            console.log('Index created successfully');
        }

        return;
    } catch (error) {
        console.log(error.message);
    } finally {
        await client.close();
    }
}