require('dotenv').config()
import fs from 'fs';

import AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-north-1' });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
const s3Client = new S3Client();

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const uploadCommand = new PutObjectCommand({
        Body: fileContent,
        Bucket: "juscel",
        Key: fileName,
    });
    
    try {
        const response = await s3Client.send(uploadCommand);
        console.log(response);
    } catch (err) {
        console.log(err);
    }
}

export const pushToSQS = async (message: string) => {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    const params = {
        MessageBody: message,
        QueueUrl: process.env.SQS_URL || ''
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.MessageId);
        }
    });
}

export const updateStatus = async (id: string, status: string) => {
    const command = new PutCommand({
        TableName: 'juscel',
        Item: {
            id: id,
            status: status
        }
    });

    const response = await docClient.send(command);
    console.log(response);
};

export const getStatus = async (id: string) => {
    const command = new GetCommand({
        TableName: 'juscel',
        Key: {
            id: id
        }
    });

    const response = await docClient.send(command);
    console.log(response);
    return response.Item?.status;
}