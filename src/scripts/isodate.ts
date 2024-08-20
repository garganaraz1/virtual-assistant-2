import { DateTime } from 'luxon';
import { chat } from "./chatGPT";

// const chat = require("./chatGPT")

interface Slot {
    year: string,
    month: string,
    day: string,
    dayOfWeek: string,
    time: string,
    weekNumber: string
}

function iso2Text(isoDate: string): Slot | null {
    try {
        const dt= DateTime.fromISO(isoDate, {zone: 'utc'});

        if (!dt.isValid) {
            throw new Error('Invalid ISO date format');
        }

        // Obtaining date components
        const year = dt.toFormat('yyyy');
        const month = dt.toFormat('LLLL'); // Full month name
        const day = dt.toFormat('dd'); // Day of month in two digits
        const dayOfWeek = dt.toFormat('EEEE'); // Full day of week name
        const time = dt.toFormat('HH:mm'); // Time in 'HH:MM' format
        const weekNumber = dt.toFormat('W'); // Week number of the year

        const slot: Slot = {
            year,
            month,
            day, 
            dayOfWeek,
            time,
            weekNumber
        }

        return slot;

    } catch (error) {
        console.error('Error ', error);
    }
}

async function text2iso(text: string): Promise<string> {
    const currentDate = new Date();
    const prompt = `La fecha de hoy es ${currentDate}. Te voy a dar un texto.
        Necesito que de ese texto extraigas la fecha y la hora y me respondas con esa fecha y horario en 
        formato ISO. Por ejemplo, el texto puede ser "el jueves 30 de mayo a las 12hs". En ese caso
        tu respuesta tiene que ser 2024-06-30T12:00:00.000Z.
        Si el texto no tiene horario, responde false.
        Si el texto es "Mañana 20hs", suma un día a la fecha actual y responde con eso`;
    
        try {
            const response = await chat('1231231233', prompt, text);
            console.log('ChatGPT dice:', response['content']);
            
            const cleanedResponse = response['content'].toString().trim();

            return cleanedResponse;

        } catch (error) {
            throw new Error('Errores en la conversion de texto a ISO');

        }
}

export { text2iso, iso2Text };