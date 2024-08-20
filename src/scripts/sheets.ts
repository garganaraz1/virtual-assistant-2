import dotenv from 'dotenv';
import { google, sheets_v4 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
dotenv.config();

// Inicializa libreria cliente Google y configura autenticacion con credenciales de la cuenta de servicios
const auth = new google.auth.GoogleAuth({
    keyFile: './google.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] // Alcance para la API de Google Sheets
});

const spreadsheetId = process.env.SPREADSHEET_ID;

async function writeToSheet(values: any[][], range: string): Promise<GaxiosResponse<sheets_v4.Schema$UpdateValuesResponse> | void> {
    const sheets = google.sheets({version: 'v4', auth});
    const valueInputOption = 'USER_ENTERED';

    const resource = {
        values
    };  // Los datos que se escribirán.

    try {
        const res = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption,
            requestBody: resource
        });
        return res;
    } catch (error) {
        console.error('Error', error); // Registra errores.
        
    }
}

async function readSheet(): Promise<any[][] | void> {
    const sheets = google.sheets({version: 'v4', auth});
    const range = "hoja1!A1:J35";

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        const rows = response.data.values; //Extrae las filas de la respuesta
        return rows;
    } catch (error) {
        console.error('Error', error);
    }

}

export { writeToSheet, readSheet }