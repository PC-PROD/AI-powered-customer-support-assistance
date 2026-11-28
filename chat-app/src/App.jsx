import { useState } from 'react'
import './App.css'
import { OllamaRuntimeProvider } from './chat';
import { Thread } from "@/components/assistant-ui/elements/thread.aui";

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
