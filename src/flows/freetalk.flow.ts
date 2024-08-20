// import { addKeyword, EVENTS } from "@builderbot/bot";
import { addKeyword, EVENTS } from "@builderbot/bot";
import { chat } from "~/scripts/chatGPT";
import { farewellFlow } from "./farewell.flow";
import path from 'path';
import fs from 'fs'
import { reservationFlow } from "./reservation.flow";

// const prompt = "Actua como experto en restaurantes. Eres el asistente virtual del restaurante Fixcion Foods. Tenemos 5 años en el mercado y nos especializamos en comida oriental y argentina. Tus respuestas deben ser muy breves y concretas.Estmos en Antea LifeStyle Center Local 45";
// Especifica la ruta del archivo
const filePath = 'src/prompts/generalInfo.txt';
// Lee el archivo de forma asincrónica
const prompt = fs.readFileSync(filePath, "utf8");

// fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//         console.error("Error al leer el archivo:", err);
//         return;
//     }
//     console.log("Contenido del archivo:", data);
//     const prompt = data;
// });

const flowConsultas = addKeyword(EVENTS.ACTION)
/* .addAnswer('¿En que podemos ayudarte?') */
.addAnswer("¿En que puedo ayudarte?", 
    { capture: true }, 
    async (ctx, ctxFn) => {
        const bodyText: string = ctx.body.toLowerCase();
        const keywordsRes: string[] = ['reservar', 'cita', 'reserva', 'agendar'];
        const constainsKeywordRes: boolean = keywordsRes.some(keyword => bodyText.includes(keyword));
        if (constainsKeywordRes) {
            return ctxFn.gotoFlow(reservationFlow);
        }

        if (ctx.body.toLowerCase().includes('salir')) {
            return ctxFn.gotoFlow(farewellFlow);
        } 
        // else if(keywordsRes.some(keyword => ctx.body.includes(keyword))){
        //     return ctxFn.gotoFlow(reservationFlow)
        // }

        else {
            console.log(ctx);
            // const prompt = promptConsultas;
            const consulta = ctx.body;
            const response = await chat(ctx.from, prompt, consulta);
            return ctxFn.fallBack(response.content.toString())
        }            
    })

export { flowConsultas };