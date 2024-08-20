import { readSheet, writeToSheet } from './sheets';

interface Slot {
    dia: string,
    inicio: string,
    final: string,
    mesas: {[key: string]: string | null}, //Ejemplo {'Mesa 1': 'Ricardo', 'Mesa 2': null}
    completo: boolean
}

// Función para obtener y parsear los datos desde Google Sheets
async function getParsedData(): Promise<Slot[]> {
    const data = await readSheet();
    if (!data) {
        throw new Error('No se pudieron leer los datos de Google Sheets');
    }

    // Encuentra la fila de encabezado dinámicamente.
    const headerRow = data.find(row => row.includes('Día'));
    if (!headerRow) {
        throw new Error('No se ha encontrado encabezado.');
    }

    const headerIndex = data.indexOf(headerRow);
    const headers = headerRow.slice(1); // Ignora el primer elemento vacío

    // Extrae los datos a partir de la fila de encabezado
    const rows = data.slice(headerIndex + 1);

    return rows.map(row => {
        const slot: Slot = {
            dia: row[headers.indexOf('Día') + 1],
            inicio: row[headers.indexOf('Slot Inicio') + 1],
            final: row[headers.indexOf('Slot Final') + 1],
            mesas: {},
            completo: false
        };

        // Rellenar las mesas dinámicamente
        headers.forEach((header, index) => {
            if (header.startsWith('Mesa')) {
                slot.mesas[header] = row[index + 1] || null;
            }
        });

        slot.completo = Object.values(slot.mesas).every(m => m !== null);

        return slot;

    })
}

// Función para verificar si hay mesas disponibles en una fecha y hora específicos
async function dateAvailable(startDate: Date): Promise<boolean> {
    try {
        const slots = await getParsedData();

        // Extraer día de la semana y hora de inicio de la fecha proporcionada en UTC.
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // const dayOfWeek = daysOfWeek[startDate.getUTCDay()];
        const dayOfWeek = daysOfWeek[startDate.getDay()];
        const startTime = startDate.toISOString().split('T')[1].slice(0,5); // Formato HH:MM en UTC

        // Encontrar slot correspondiente
        const slot = slots.find(s => s.dia === dayOfWeek && s.inicio === startTime);

        if (slot) {
            // Verificar si hay mesa disponible
            const algunaMesaDisponible = Object.values(slot.mesas).some(m => m === null);
            return algunaMesaDisponible;
        }

        return false;

    } catch (error) {
        console.error('Error en dateAvailable', error);
        return false; // Manejar el error y retornar false indicamndo que hubo un problema.
    }
}

// Función para agregar una reserva a la siguiente mesa disponible en una fecha y hora específicos
async function addReservation(date: Date, name: string): Promise<boolean> {
    console.log(date);
    
    try {
        const slots = await getParsedData();

        // Extraer dia de la semana y hora de la fecha proporcionada
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[date.getUTCDay()];
        console.log(dayOfWeek);
        
        // const time = date.toTimeString().split(' ')[0].slice(0,5); // Formato HH:MM
        // console.log(date.toTimeString());
        

        // Obtiene la hora en UTC
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();

        // Formatea la hora en formato HH:MM
        const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        console.log(time);
        

        // Encontrar el slot correspondiente
        const slot = slots.find(s => s.dia === dayOfWeek && time >= s.inicio && time < s.final);
        console.log('Slot:', slot);
        
        if (slot) {
            // Encontrar la primer mesa disponible
            for (const table in slot.mesas){
                if (slot.mesas[table] === null) {
                    slot.mesas[table] = name;
                    // Actualizar la propiedad 'completo' si todas las mesas están ocupadas
                    slot.completo = Object.values(slot.mesas).every(m => m !== null);

                    // Encontrar el indice del slot en la hoja de calculo
                    const rowIndex = slots.indexOf(slot) + 2; // Sumamos 2 porque los datos empiezan en la fila 2 (A1:J35)
                    const values = [
                        [slot.dia, slot.inicio, slot.final, ...Object.values(slot.mesas)]
                    ];
                    const range = `hoja1!A${rowIndex}:J${rowIndex}`;
                    console.log(range);
                    
                    await writeToSheet(values, range);

                    return true; // Indicar que la reserva fue exitosa
                }   

            }
        }

        return false; // Indocar que no se encontró un slot disponible o no había mesas libres


    } catch (error) {
        console.error('Error en addReservation:', error);
        return false; // Manejar error y retornar false indicando que hubo un problema
    }
}

export { getParsedData, dateAvailable, addReservation }