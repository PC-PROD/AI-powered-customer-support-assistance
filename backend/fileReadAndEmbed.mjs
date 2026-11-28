import { readdir, writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import chunkText from './chunk.mjs';
import { PDFParse } from "pdf-parse";


async function fetchDocs() {
    try {
        let files = await readdir('./documents', { encoding: "utf-8", withFileTypes: true });
        let filesOnly = files.filter(item => item.isFile()).map(entry => entry.name);

        let finalDocs = {};
        await Promise.all(
            filesOnly.map(async (elem) => {
                let fileBuffer = await readFile(`./documents/${elem}`);
                // let pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
                // const pdfs = await extractText(pdf, { mergePages: false });
                // return pdfs;

                let parser = new PDFParse(new Uint8Array(fileBuffer));
                let result = await parser.getText();
                finalDocs[elem] = result.pages;
                return;
            })
        );
        return finalDocs;

    } catch (error) {
        console.log(error.message);
        // throw error;
    }
}

export default async function chunkDocs() {
    try {
        let docs = await fetchDocs();
        let data = [];

        for (let elem in docs) {
            let chunkDoc = docs[elem].map(metadata => { return { pageno: metadata.num, chunk: chunkText(metadata.text), text: metadata.text } });
            let finalDoc = await Promise.all(chunkDoc.map(async (data) => {
                let pageNo = data.pageno;
                let fileName = elem;
                let chunk = await Promise.all(data.chunk.map(async (elem) => { return { ...elem, ['embed']: await embed(elem.text) } }));

                return { pageno: pageNo, fileName: fileName, chunk: chunk };
            }));
            data.push(finalDoc);
        }
        return data;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

async function embed(data) {
    try {
        let response = await fetch("http://localhost:11434/api/embed", {
            method: "POST",
            headers: { 'Content-type': "application/json" },
            body: JSON.stringify({
                model: "embeddinggemma",
                input: data,
                dimensions: 768
            })
        });

        let res = await response.json();

        let embedding = res.embeddings;

        return embedding;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}