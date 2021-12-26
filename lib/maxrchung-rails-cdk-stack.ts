import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
// import * as sqs from '@aws-cdk/aws-sqs';

export class MaxrchungRailsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'maxrchung-rails', {
      bucketName: 'maxrchung-rails'
    });
    bucket.grantPublicAccess();

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MaxrchungRailsCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
