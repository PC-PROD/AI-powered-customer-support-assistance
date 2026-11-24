import { useState } from 'react'
import './App.css'
import { OllamaRuntimeProvider } from './chat';
import { Thread } from "@/components/assistant-ui/elements/thread.aui";

// import { Thread } from "@/components/assistant-ui/elements/thread.aui";
// function App() {

//   const [userQuestion, setUserQuestion] = useState("");
//   const [airesponse, setAIResponse] = useState('');

//   async function handleSubmit() {
//     try {
//       let response = await fetch("http://127.0.0.1:11434/api/generate",
//         {
//           method: "POST",
//           body: JSON.stringify({
//             model: "llama3.2",
//             prompt: userQuestion,
//             stream: true
//           }),
//           responseType: 'stream'
//         }
//       );

//       let reader = response.body.getReader();
//       let decoder = new TextDecoder();
//       let aiResponse = '';

//       while(true){
//         let {done, value} = await reader.read();

//         if (done) break;

//         let chunk = decoder.decode(value, {
//           stream: true
//         });


//         chunk = JSON.parse(chunk);

//         chunk = chunk.response;

//         aiResponse += chunk;

//         setAIResponse(aiResponse);
//       }

//     } catch (error) {
//       console.log(error.message);
//     }
//   }

//   return (
//     <>
//       <div>
//         <label for="question">
//           <input id='question' placeholder='Put any question' onChange={(e) => setUserQuestion(e.target.value)} />
//         </label>
//         <button onClick={handleSubmit}>Send</button>
//         <p>{airesponse}</p>
//       </div>
//     </>
//   )
// }

function App() {


  return (
    <>
      <OllamaRuntimeProvider>
        <div className="h-screen w-full">
          <Thread />
        </div>
      </OllamaRuntimeProvider>
    </>
  )
}

export default App
