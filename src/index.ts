import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayAuthorizerCallback } from 'aws-lambda';
import { Client } from 'pg';
import fs from 'fs'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sslConfig = {
        ca: fs.readFileSync(process.env.AWS_RDS_SSL_CERT_PATH!),
      };
    
    const client = new Client({
        user: process.env.AWS_RDS_USERNAME,
        host: process.env.AWS_RDS_HOST,
        database: process.env.AWS_RDS_DATABASE,
        password: process.env.AWS_RDS_PASSWORD,
        port: parseInt(process.env.AWS_RDS_PORT!),
        ssl: sslConfig,
    });
    if (event.httpMethod === 'OPTIONS') {
        // Handle CORS preflight requests
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
            },
            body: '',
        };
    }
    else if (event.httpMethod === 'GET') {
        try {
            await client.connect();
            
            let query = 'SELECT * FROM vw_cats';
            if (event.queryStringParameters) {
                const name = event.queryStringParameters.name
                query += ` WHERE name LIKE '%${name}%'`;
            }
            query += ';'
            const result = await client.query(query);
            return {
                statusCode: 200,
                body: JSON.stringify({ cats: result.rows }),
            };
        } catch (error) {
            console.log(error)
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Error trying to GET data from database' }),
            }
        } finally {
            client.end();
        }
    } 
    else if (event.httpMethod === 'POST') {
        try {
            await client.connect();
            const requestBody = JSON.parse(event.body!);
            const valuesArr = Object.values(requestBody)
            const query = 'INSERT INTO cats (name, color, address, owner, breed, stray) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
            const result = await client.query(query, valuesArr);
            return {
                statusCode: 200,
                body: JSON.stringify({ cats: result.rows }),
            };
        } catch (error) {
            console.log(error)
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Error trying to POST data to database on ${event.httpMethod}`  }),
            }
        } finally {
            client.end();
        }
    }
    else if (event.httpMethod === 'PUT') {
        try {
            await client.connect();
            const requestBody = JSON.parse(event.body!);
            const valuesArr = Object.values(requestBody)
            const query = 'UPDATE cats SET name = $2, color = $3, address = $4, owner = $5, breed = $6, stray = $7 WHERE id = $1;';
            const result = await client.query(query, valuesArr);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Successfully updated Cat' }),
            };
        } catch (error) {
            console.log(error)
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Error trying to PUT data in database on ${event.httpMethod}` }),
            }
        } finally {
            client.end();
        }
    }
    else if (event.httpMethod === 'DELETE') {
        try {
            await client.connect();
            //will be list of ids 
            const requestBody = JSON.parse(event.body!);
            const valuesArr = Object.values(requestBody.toBeDeleted)
            const idArr = valuesArr.map((cat) => (cat as { id: number }).id);
            let query = 'DELETE FROM cats WHERE id In (';
            for (let i = 0; i < valuesArr.length; i++) {
                query += `$${i + 1}`;
                if (i < valuesArr.length - 1) {
                  query += ', ';
                }
              }
              query += ');';
            const result = await client.query(query, idArr);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Successfully deleted Cat(s)' }),
            };
        } catch (error) {
            console.log(error)
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Error trying to DELETE data from database on ${event.httpMethod}` }),
            }
        } finally {
            client.end();
        }
    }
    // else if (event.httpMethod === 'OPTIONS') {

    // }
    else {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Not a Valid Request' }),
        }
    }
};