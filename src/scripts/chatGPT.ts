import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
dotenv.config();

const conversations = {}; // Diccionario para almacenar el historial de conversaciones

const chat = async (phoneNumber, prompt, text) => {
    // try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        // Inicializa el historial de conversación si no existe
        if (!conversations[phoneNumber]) {
            conversations[phoneNumber] = [{ 
                    role: "system", 
                    content: prompt 
                }];
        }

        // Añade el nuevo mensaje del usuario al historial
        conversations[phoneNumber].push({ 
                    role: "user", 
                    content: text });

        // Llama a la API de OpenAI con el historial de mensajes
        const completion = await openai.createChatCompletion({
            // model: "gpt-3.5-turbo",
            model: "gpt-4o",
            temperature: 0.2,
            messages: conversations[phoneNumber],
        });

        const botResponse = completion.data.choices[0].message;

        // Añade la respuesta del bot al historial
        conversations[phoneNumber].push(botResponse);
        // conversations[phoneNumber].push({
        //     role: "system",
        //     content: botResponse
        // });
        return botResponse;
        
    // } 
    // catch (err) {
    //     console.error("Error al conectar con OpenAI:", err);
    //     if (err.response && err.response.data) {
    //         console.error("Respuesta de OpenAI:", err.response.data);
    //     }
    //     return "ERROR";
    // }
};

// module.exports = chat;
export { chat }