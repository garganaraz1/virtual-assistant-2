import { addKeyword, EVENTS } from "@builderbot/bot";
import { text2iso } from "~/scripts/isodate";
import { dateAvailable, addReservation } from "~/scripts/utils";
import { farewellFlow } from "./farewell.flow";

const confirmationFlow = addKeyword(EVENTS.ACTION)
    .addAnswer("Perfecto, la fecha solicitada está disponible. Para confirmar, cual es su nombre?", 
                {capture: true},
                async (ctx, ctxFn) => {
                    const state = ctxFn.state.getMyState();
                    const dateState = state.date;
                    const date = new Date(Date.parse(dateState));
                    const confirmation = await addReservation(date, ctx.body);
                    if (confirmation) {
                        await ctxFn.flowDynamic("Cita realizada con éxito.");
                        return ctxFn.gotoFlow(farewellFlow);
                    } else {
                        await ctxFn.flowDynamic("Hubo un error reservando la fecha. Intenta nuevamente por favor");
                    }
                }
            );

const reservationFlow = addKeyword(EVENTS.ACTION)
            .addAnswer("Para qué fecha quieres tu cita?",
                {capture: true},
                async (ctx, ctxFn) => {
                    const solicitedDate = await text2iso(ctx.body);
                    console.log('Fecha solicitada:', solicitedDate);
                    
                    const date = new Date(solicitedDate);
                    const available = await dateAvailable(date);

                    if (available) {
                        ctxFn.state.update({"date": solicitedDate});
                        return ctxFn.gotoFlow(confirmationFlow);
                    } else {
                        return ctxFn.fallBack("Horario o Fecha solicitada no disponible. Solicitar un slot diferente.");
                    }
                }
            )

export { reservationFlow, confirmationFlow };