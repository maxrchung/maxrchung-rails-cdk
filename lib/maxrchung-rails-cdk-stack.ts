import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'

export class MaxrchungRailsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, 'maxrchung-rails', {
      bucketName: 'maxrchung-rails'
    })
    bucket.grantPublicAccess()
  }
}
