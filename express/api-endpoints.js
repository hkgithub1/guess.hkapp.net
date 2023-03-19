const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "GameScoresTable";

const getScore = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    ExpressionAttributeValues: {
      ":pk": userId,
    },
    KeyConditionExpression: "UserId = :pk",
    ProjectionExpression: "SessionId, Score",
  };
  return await dynamoClient.query(params).promise();
};

const addScore = async (entry) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      SessionId: entry.SessionId,
      UserId: entry.UserId,
      Score: entry.Score,
    },
  };
  return await dynamoClient.put(params).promise();
};

module.exports = {
  dynamoClient,
  getScore,
  addScore,
};
