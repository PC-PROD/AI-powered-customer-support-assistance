import { insertDataToDB } from "./ingesionToDB.mjs";

await insertDataToDB().catch(error => console.log(error.message));