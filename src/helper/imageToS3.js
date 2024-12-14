import dotenv from 'dotenv'
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3
} from '@aws-sdk/client-s3'

dotenv.config()

const s3Region = process.env.AWS_BUCKED_REGION
const iamPrimaryKey = process.env.AWS_IAM_PK
const iamSecretKey = process.env.AWS_IAM_SK
const buckedName = process.env.AWS_BUCKED_NAME
const folder = process.env.AWS_NAME_FOLDER

const s3 = new S3Client({
  region: s3Region,
  credentials: {
    accessKeyId: iamPrimaryKey,
    secretAccessKey: iamSecretKey
  }
})

//esto es en modo restaurant
export const uploadImageToS3 = async (image, path) => {
  const destino = folder + '/' + path

  let urlImagen = `https://${buckedName}.s3.${s3Region}.amazonaws.com/${destino}`

  const paramsPut = {
    Bucket: buckedName,
    Key: destino,
    Body: image.buffer,
    ContentType: image.mimetype
  }

  const comandoPut = new PutObjectCommand(paramsPut)
  const response = await s3.send(comandoPut)
  return { response, urlImagen }
}

export const deleteImageFromS3 = async (path) => {
  const paramsDelete = {
    Bucket: buckedName,
    Key: path
  }

  const commandDelete = new DeleteObjectCommand(paramsDelete)
  await s3.send(commandDelete)
  return true
}

// {
//     fieldname: 'singleImage',
//     originalname: 'images.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff
//    db 00 84 00 09 06 07 10 07 11 0d 10 0f 0d 0d 15 13 11 0d 10 16 15 10 15 10 0f 0
//   f 12 0d ... 3857 more bytes>,
//     size: 3907
//   }

//   logo_url: '',
//   header_url: ''
