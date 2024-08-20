import { addKeyword, EVENTS } from "@builderbot/bot";

const farewellFlow = addKeyword(EVENTS.ACTION)
    .addAnswer("Fue un gusto poder ayudarte. Hasta la próxima.");

export {farewellFlow}