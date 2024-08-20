import { addKeyword, EVENTS } from "@builderbot/bot";

const welcomeFlow = addKeyword(EVENTS.ACTION)
    .addAction(async(ctx, ctxFn) => {
        await ctxFn.endFlow("Bienvenido al Asistente virtual de Grupo Dental Antea \nPuedes escribir 'Cita' para agendar una cita o 'Consultar' si quieres realizar otras consultas.");
    });

export { welcomeFlow };