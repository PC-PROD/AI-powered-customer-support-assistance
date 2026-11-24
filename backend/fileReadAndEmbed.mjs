import { readdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import chunkText from './chunk.mjs';


async function fetchDocs() {
    try {
        let files = await readdir('./documents', 'utf-8');

        let allDocs = await Promise.all(
            files.map(async (elem) => {
                let file = await readFile(`./documents/${elem}`, 'utf-8');
                return [elem, file];
            })
        );

        return allDocs;

    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export default async function chunkDocs(){
    try{
        let docs = await fetchDocs();
        // console.log('Line no 28', docs);
        let data = {};

        for (let elem of docs){
            // console.log('Line no 31', elem);
            let chunkDoc = chunkText(elem[1]);
            let embededDoc = await embed(chunkDoc);
            let combinedDoc = chunkDoc.map((value, index)=> {return {"text": value, 'embed': embededDoc[index]}});

            data[elem[0]] = combinedDoc;
        }
        return data;
    }catch(error){
        console.log(error.message);
        throw error;
    }
}

async function embed(data){
    try{
        let response = await fetch("http://localhost:11434/api/embed", {
            method: "POST",
            headers: {'Content-type': "application/json"},
            body: JSON.stringify({
                model: "embeddinggemma",
                input: data,
                dimensions: 768
            })
        });

        let res = await response.json();

        let embedding = res.embeddings;

        return embedding;
    }catch(error){
        console.log(error.message);
        throw error;
    }
}