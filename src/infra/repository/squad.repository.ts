import { DynamoDB } from 'aws-sdk';
import { injectable } from 'inversify';
import IRepository from '../../domain/interface/infra/repository/repository.interface';
import Squad from '../../domain/model/squad.model';
import DynamoDBDocumentClient from '../provider/aws.provider';

@injectable()
export default class SquadRepository implements IRepository<Squad> {
  private TABLE_NAME = `${process.env.DYNAMO_TABLE_PREFIX}.Squad`;

  private dynamoDbClient = DynamoDBDocumentClient();

  async list(): Promise<Array<Squad>> {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.TABLE_NAME,
    };

    const response = await this.dynamoDbClient.scan(params).promise();

    return response.Items as Array<Squad>;
  }
}
