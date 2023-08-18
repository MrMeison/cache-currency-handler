import type { Handler } from '@yandex-cloud/function-types';
import fetch from 'node-fetch';
import {
    S3Client,
    PutObjectCommand
} from '@aws-sdk/client-s3';

const {
    S3_ENDPOINT = 'https://storage.yandexcloud.net',
    S3_REGION = 'ru-central1-a',
    DST_NAME = 'current.json',
    DST_BUCKET = '',
    AWS_ACCESS_KEY_ID = '',
    AWS_SECRET_ACCESS_KEY = '',
    DATA_ENDPOINT = '',
} = process.env;

const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID || '',
        secretAccessKey: AWS_SECRET_ACCESS_KEY  || '',
    },
});

export const handler: Handler.Http = async (event, context) => {
    const data = await fetch(DATA_ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    const body = data.body;
    if (!data.ok || !body) {
        console.log('Failed fetch data', data.statusText);
        return {
            statusCode: 404,
            body: 'No data'
        };
    }


    const putCommand = new PutObjectCommand({
        Key: DST_NAME,
        Bucket: DST_BUCKET,
        Body: body!,
        ContentType: 'application/json'
      })

    await s3.send(putCommand);

    return {
        statusCode: 200,
        body: ''
    };
};