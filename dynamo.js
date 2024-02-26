const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config()
const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const accessdbKeyId = process.env.ACCESS_DB_KEY
const secretDBAccesskey = process.env.SECRET_DB_ACCESS_KEY

AWS.config.update({
  region: region,
  accessKeyId: accessdbKeyId,
  secretAccessKey: secretDBAccesskey
});

const dynamoClient =  new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "photo-server-table";

const getCharacters = async() => {
    const params = {
      TableName: TABLE_NAME
    };
    const characters = await dynamoClient.scan(params).promise();
    console.log(characters);
    return characters;
  }
  
  const addOrUpdateCharacter = async(character) =>{
    const params = {
      TableName: TABLE_NAME,
      Item: character,
    }
    console.log(params);
    return await dynamoClient.put(params).promise();
  }
  
  const getCharacterById = async (keyValue, typeValue) => {
    const params = {
      TableName: TABLE_NAME, // Make sure TABLE_NAME is defined and correct
      Key: {
        key: keyValue,  // The value for the partition key
        type: typeValue // The value for the sort key
      },
    };
  
    try {
      const result = await dynamoClient.get(params).promise();
      return result.Item; // This will return the item if it exists
    } catch (error) {
      console.error("Error fetching data from DynamoDB:", error);
      throw error; // Rethrow or handle as needed
    }
  };
  
  
  const deleteCharacter = async(keyValue, typeValue) =>{
    const params = {
      TableName: TABLE_NAME, // Make sure TABLE_NAME is defined and correct
      Key: {
        key: keyValue,  // The value for the partition key
        type: typeValue // The value for the sort key
      },
    };
    return await dynamoClient.delete(params).promise();
  }

  module.exports ={
    dynamoClient,
    getCharacters,
    getCharacterById,
    deleteCharacter,
    addOrUpdateCharacter,
  };