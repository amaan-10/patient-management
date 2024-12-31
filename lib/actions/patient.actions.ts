"use server";

import { ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from "../appwrite.config"
import { parseStringify } from "../utils"
import { InputFile } from "node-appwrite/file"

export const createUser = async (user: CreateUserParams) => {
    try {
        const newUser = await users.create(
            ID.unique(),
            user.email,
            user.phone, 
            undefined,
            user.name
        )

        return parseStringify(newUser)
    } catch (error: any) {
        if(error && error?.code === 409){
            const documents = await users.list([
                Query.equal('email', [user.email])
            ])

            return documents?.users[0]
        }
        console.error("An error occurred while creating a new user:", error);
    }
}

export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId)

        return parseStringify(user);
    } catch (error) {
        console.log(error)
    }
}

export const registerPatient = async({identificationDocument, ...patient}: RegisterUserParams) => {
    
    try {
        let file;

        if(identificationDocument) {
            const blobFile = identificationDocument?.get('blobFile');
            const fileName = identificationDocument?.get('fileName');

            if (!(blobFile instanceof Blob)) {
                throw new Error("Invalid blobFile: not a Blob instance");
            }
            if (!fileName || typeof fileName !== 'string') {
                throw new Error("Invalid fileName: not a valid string");
            }

            console.log("Blob File Size:", blobFile.size);
            if (blobFile.size === 0) {
                throw new Error("Blob File is empty");
            }
            const arrayBuffer = await blobFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const inputFile = InputFile.fromBuffer(buffer, fileName);
            console.log("Input File created successfully:", inputFile);
            
            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile)
        }
        
        const newPatient = await databases.createDocument(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            ID.unique(),
            {
                identificationDocumentId: file?.$id ? file.$id : null,
                identificationDocumentUrl: file?.$id
                ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
                : null,
                ...patient,
            }
        )

        return parseStringify(newPatient)
    } catch (error) {
        console.log(error)
    }
}