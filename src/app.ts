import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { welcomeFlow } from './flows/welcome.flow'
import { reservationFlow, confirmationFlow } from './flows/reservation.flow'
import { flowConsultas } from './flows/freetalk.flow'

const PORT = process.env.PORT ?? 3008

const mainFlow = addKeyword<Provider, Database>(EVENTS.WELCOME)
    .addAction(async (ctx, ctxFn) => {
        const bodyText: string = ctx.body.toLowerCase();

        // Primero, el usuario está saludando
        const keywords: string[] = ['hola', 'buenas', 'ola'];
        const containsKeyword: boolean = keywords.some(keyword => bodyText.includes(keyword));
        if (containsKeyword) {
            return await ctxFn.gotoFlow(welcomeFlow);
        } // No, no está saludando

        // Segundo, el usuario quiere hacer una cita?
        const keywordsRes: string[] = ['reservar', 'reserva', 'cita'];
        const constainsKeywordRes: boolean = keywordsRes.some(keyword => bodyText.includes(keyword));
        if (constainsKeywordRes) {
            return ctxFn.gotoFlow(reservationFlow); // Si, quiere reservar
        } else {
            // return ctxFn.fallBack("No te entiendo"); // No, está preguntando otra cosa
            return ctxFn.gotoFlow(flowConsultas)
        }
    });

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, reservationFlow, confirmationFlow, mainFlow, flowConsultas]);
    
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB, 
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
